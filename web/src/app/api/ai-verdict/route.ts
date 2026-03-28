import { NextRequest, NextResponse } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { history } from "@/lib/db/schema/core";
import { eq } from "drizzle-orm";
import google from "@googleapis/safebrowsing";
import {
  dnsPhishingCheck,
  extractDomain,
  getVerdict,
} from "../dns-lookup/child-fn";
import {
  AiVerdictSchema,
  MlResponse,
  RequestBody,
  SafeBrowsingMatch,
  SafeBrowsingResult,
} from "./types";
import { mlClient } from "@/lib/api/client";

const safebrowsing = google.safebrowsing("v4");
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

function parseJsonFromText(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

// google safe browsing
async function runSafeBrowsing(url: string): Promise<SafeBrowsingResult> {
  try {
    const res = await safebrowsing.threatMatches.find({
      key: process.env.GOOGLE_SAFE_BROWSING_API_KEY,
      requestBody: {
        client: { clientId: "phishing-detector", clientVersion: "1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      },
    });
    return {
      isSafe: !res.data.matches,
      matches: (res.data.matches as SafeBrowsingMatch[]) ?? [],
    };
  } catch {
    return { isSafe: true, matches: [] };
  }
}

// Ml prediction
async function predict(url: string): Promise<MlResponse> {
    try {
        const res = await mlClient.post("/predict", { url });
        
        if (!res) return { error: true, success: "error" };

        return {
            error: false,
            success: "success",
            raw: res.data.raw,
            prediction: res.data.prediction,
        }
    } catch (error) {
        return {
            error: true,
            success: "error",
        };
    }
}

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleRequest(
  raw: string,
  userId: string,
  historyId?: string,
): Promise<Response> {
  const domain = extractDomain(raw.trim());

  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return errorResponse("Invalid domain", 422);
  }


//   console.log(raw)
    // TODO: ml
const [dnsSettled, safeBrowsingSettled, mlResponse] = await Promise.allSettled([
    dnsPhishingCheck(domain),
    runSafeBrowsing(`https://${domain}`),
    predict(raw),
]);

//   console.log({ dnsSettled, safeBrowsingSettled, mlResponse });

  let ml: MlResponse = { error: true, success: "error" };
  if (mlResponse.status === "fulfilled") {
    ml = mlResponse.value;
  }


  if (dnsSettled.status === "rejected") {
    return errorResponse("DNS lookup failed", 500);
  }

  const dns = dnsSettled.value;
  const safeBrowsing =
    safeBrowsingSettled.status === "fulfilled"
      ? safeBrowsingSettled.value
      : { isSafe: true, matches: [] };

  const ruleBasedVerdict = getVerdict(dns);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );

      send("dns", { domain, ruleBasedVerdict, result: dns });
      send("safebrowsing", safeBrowsing);
      send("ml", ml);

      try {
        const prompt = `You are a cybersecurity expert specializing in phishing detection. Analyze the following data about a domain and provide a final verdict.

Domain: ${domain}

DNS Analysis:
- IPs: ${dns.ips.join(", ") || "none"}
- TTL: ${dns.ttl}s
- Record count: ${dns.record_count}
- Flux score: ${dns.flux_score} (0=stable, 1=highly suspicious fast-flux)
- DNSSEC valid: ${dns.dnssec_valid}
- Domain age: ${dns.age_days ?? "unknown"} days

VirusTotal:
- Malicious engines: ${dns.vt_malicious ?? "N/A"}
- Suspicious engines: ${dns.vt_suspicious ?? "N/A"}
- Reputation score: ${dns.vt_reputation ?? "N/A"} (higher = more trusted)

Google Safe Browsing:
- Is safe: ${safeBrowsing.isSafe}
- Threat matches: ${
            safeBrowsing.matches.length === 0
              ? "none"
              : JSON.stringify(safeBrowsing.matches)
          }

ML Prediction:
- Error: ${ml.error}
- Prediction: ${ml.prediction || "N/A"}
- Raw scores: good: ${ml.raw?.good || "N/A"}, bad: ${ml.raw?.bad || "N/A"}

Rule-based verdict: ${ruleBasedVerdict}

Provide a final verdict (SAFE, SUSPICIOUS, or PHISHING), a confidence score 0-1, key reasons for your decision, and a short user-facing recommendation.

Respond ONLY with valid JSON in this exact format:
{"verdict": "SAFE|SUSPICIOUS|PHISHING", "confidence": 0.0-1.0, "reasons": ["reason1", "reason2"], "recommendation": "short recommendation"}`;

        const { text } = await generateText({
          model: groq("llama-3.3-70b-versatile"),
          prompt,
        });

        const parsed = parseJsonFromText(text) as {
          verdict: string;
          confidence: number;
          reasons: string[];
          recommendation: string;
        } | null;

        if (!parsed) {
          throw new Error("Failed to parse AI response");
        }

        const aiVerdict = {
          verdict: parsed.verdict,
          confidence: parsed.confidence,
          reasons: parsed.reasons,
          recommendation: parsed.recommendation,
        };

        send("ai_final", aiVerdict);

        const dnsJson = JSON.stringify(dns);
        const safeBrowsingJson = JSON.stringify(safeBrowsing);
        const aiVerdictJson = JSON.stringify(aiVerdict);

        if (historyId) {
          await db
            .update(history)
            .set({
              dnsLookupResult: dnsJson,
              googleSafeBrowsingResult: safeBrowsingJson,
              mlResponse: JSON.stringify(ml),
              finalAiVerdict: aiVerdictJson,
            })
            .where(eq(history.id, historyId));
        } else {
          await db.insert(history).values({
            userId,
            llmPrediction: ruleBasedVerdict,
            dnsLookupResult: dnsJson,
            googleSafeBrowsingResult: safeBrowsingJson,
            mlResponse: JSON.stringify(ml),
            finalAiVerdict: aiVerdictJson,
            attachmentCount: 0,
          });
        }

        send("done", {
          domain,
          ruleBasedVerdict,
          aiVerdict,
          result: dns,
          safeBrowsing,
          ml,
        });
      } catch (err) {
        send("error", {
          error: err instanceof Error ? err.message : "AI verdict failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

    // return NextResponse.json({ error: "Not implemented", data:{ dnsSettled, safeBrowsingSettled, mlResponse } }, { status: 200 });
}

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("domain");
  const userId = searchParams.get("userId");
  const historyId = searchParams.get("historyId") ?? undefined;

  if (!raw || raw.trim() === "")
    return errorResponse("Missing required query param: domain", 400);
  if (!userId || userId.trim() === "")
    return errorResponse("Missing required query param: userId", 400);

  return handleRequest(raw, userId, historyId);
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  if (typeof body !== "object" || body === null)
    return errorResponse("Invalid request body", 400);

  const { domain, userId, historyId } = body as RequestBody;

  if (typeof domain !== "string" || domain.trim() === "")
    return errorResponse("domain must be a non-empty string", 400);
  if (typeof userId !== "string" || userId.trim() === "")
    return errorResponse("userId must be a non-empty string", 400);

  return handleRequest(domain, userId, historyId);
}
