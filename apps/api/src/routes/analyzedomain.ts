import { Hono } from "hono";
import dns from "node:dns/promises";
import whois from "whois-node-json";

const analyzedomain = new Hono();

/**
 * Extract clean domain from URL
 */
function extractDomain(url: string): string {
  return url.replace(/^https?:\/\//, "").split("/")[0];
}

/**
 * Calculate flux score
 */
function calculateFluxScore(recordCount: number, ttl: number): number {
  let score = 0;

  if (recordCount > 3) score += 0.4;
  if (ttl < 300) score += 0.3;
  if (ttl > 31536000) score += 0.2;

  return Math.min(score, 1.0);
}

/**
 * Get domain age using WHOIS
 */
async function getDomainAge(domain: string): Promise<number> {
  try {
    const data = await whois(domain);

    const creationDate =
      data.createdDate ||
      data.created ||
      data.creationDate ||
      data["Created On"] ||
      data["creation date"] ||
      data.date_created;

    if (creationDate) {
      const created = new Date(creationDate);

      if (!isNaN(created.getTime())) {
        return Math.floor(
          (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24),
        );
      }
    } else {
      console.log("🚨 WHOIS Error: No creation date found");
      return 1;
    }
  } catch (err: any) {
    console.log("🚨 WHOIS Error:", err.message);
  }

  return 999; // fallback
}

/**
 * Main DNS phishing check
 */
async function dnsPhishingCheck(domain: string) {
  const domainClean = extractDomain(domain);

  try {
    const records = await dns.resolve4(domainClean, { ttl: true });

    const ips = records.map((r) => r.address);
    const ttl = records[0]?.ttl || 0;

    if (ips.length === 0) {
      return { ips: [], ttl: 0, record_count: 0, flux_score: 0.9 };
    }

    const fluxScore = calculateFluxScore(ips.length, ttl);
    const age = await getDomainAge(domainClean);

    return {
      ips,
      ttl,
      record_count: ips.length,
      flux_score: fluxScore,
      age_days: age,
    };
  } catch (err) {
    return { ips: [], ttl: 0, record_count: 0, flux_score: 0.95 };
  }
}

/**
 * API Route
 */
app.post("/analyzedomain", async (c) => {
  try {
    const { url } = await c.req.json();

    if (!url) {
      return c.json({ error: "URL is required" }, 400);
    }

    const result = await dnsPhishingCheck(url);

    // Verdict logic
    let verdict = "OKAY";

    if (result.flux_score > 0.7) {
      verdict = "PHISH";
    } else if (result.age_days && result.age_days < 30) {
      verdict = "SUSPICIOUS";
    }

    return c.json({
      ...result,
      verdict,
    });
  } catch (err) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default analyzedomain;
