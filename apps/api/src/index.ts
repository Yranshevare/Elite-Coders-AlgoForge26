import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./core/lib/auth/init.js";
import { cors } from "hono/cors";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";
import { randomInt } from "crypto";
import { z } from "zod";
import "dotenv/config";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY);

const analyseRequestSchema = z.object({
  subject: z.string(),
  sender: z.string(),
  body: z.string(),
  bodyHtml: z.string().optional(),
});

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .basePath("/api")
  .use(
    cors({
      origin: ["http://localhost:3001", "chrome-extension://*"],
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: [
        "POST",
        "GET",
        "OPTIONS",
        "DELETE",
        "PUT",
        "PATCH",
        "HEAD",
        "CONNECT",
        "TRACE",
      ],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .get("/", (c) => {
    return c.text("Ok!");
  })
  .get("/health", (c) => {
    return c.json({ status: "ok" });
  })
  .post("/auth/request-otp", async (c) => {
    try {
      const { email } = await c.req.json<{ email: string }>();

      if (!email || !email.includes("@")) {
        return c.json({ error: "Invalid email" }, 400);
      }

      const otp = randomInt(100000, 999999).toString();
      await redis.set(`otp:${email}`, otp, { ex: 300 });

      await resend.emails.send({
        from: "TrustInBox <noreply@trustinbox.com>",
        to: email,
        subject: "Your TrustInBox Verification Code",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Your Verification Code</h2>
            <p>Your code is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
            <p>This code expires in 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      return c.json({ success: true, message: "OTP sent" });
    } catch (error) {
      console.error("OTP request error:", error);
      return c.json({ error: "Failed to send OTP" }, 500);
    }
  })
  .post("/auth/verify-otp", async (c) => {
    try {
      const { email, code } = await c.req.json<{
        email: string;
        code: string;
      }>();

      if (!email || !code) {
        return c.json({ error: "Missing email or code" }, 400);
      }

      const storedOtp = await redis.get<string>(`otp:${email}`);

      if (!storedOtp || storedOtp !== code) {
        return c.json({ error: "Invalid or expired OTP" }, 401);
      }

      await redis.del(`otp:${email}`);

      const token = Buffer.from(
        JSON.stringify({ email, timestamp: Date.now() }),
      ).toString("base64");

      return c.json({ success: true, token });
    } catch (error) {
      console.error("OTP verify error:", error);
      return c.json({ error: "Verification failed" }, 500);
    }
  })
  .post("/analyse", async (c) => {
    try {
      const body = await c.req.json();
      const {
        subject,
        sender,
        body: emailBody,
      } = analyseRequestSchema.parse(body);

      const riskScore = calculateRiskScore(subject, sender, emailBody);
      const threats = detectThreats(subject, sender, emailBody);
      const riskLevel =
        riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";

      return c.json({
        score: riskScore,
        riskLevel,
        threats,
        recommendations: generateRecommendations(riskLevel, threats),
        analyzedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: "Invalid request body" }, 400);
      }
      console.error("Analysis error:", error);
      return c.json({ error: "Analysis failed" }, 500);
    }
  })
  .on(["POST", "GET"], "/auth/*", async (c) => {
    return auth.handler(c.req.raw);
  });

function calculateRiskScore(
  subject: string,
  sender: string,
  body: string,
): number {
  let score = 0;
  const lowerBody = body.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  const suspiciousPatterns = [
    { pattern: /urgent|act now|immediately|expires? today/i, weight: 15 },
    {
      pattern: /verify your account|confirm your identity|suspend/i,
      weight: 20,
    },
    { pattern: /click here|login now|update your (info|details)/i, weight: 25 },
    {
      pattern: /winner|congratulations|you've (won|been selected)/i,
      weight: 30,
    },
    { pattern: /bit\.ly|tinyurl|goo\.gl|is\.gd|buff\.ly/i, weight: 15 },
    { pattern: /password reset|reset your|security alert/i, weight: 20 },
  ];

  for (const { pattern, weight } of suspiciousPatterns) {
    if (pattern.test(lowerSubject) || pattern.test(lowerBody)) {
      score += weight;
    }
  }

  const senderLower = sender.toLowerCase();
  const commonBrands = [
    "paypal",
    "amazon",
    "netflix",
    "apple",
    "microsoft",
    "google",
    "bank",
  ];
  const brandMatch = commonBrands.some((brand) => senderLower.includes(brand));
  if (brandMatch && !senderLower.includes("@") && sender.includes("<")) {
    score += 15;
  }

  const fakeDomains = [
    "paypa1.com",
    "amaz0n.com",
    "g00gle.com",
    "micros0ft.com",
  ];
  for (const fake of fakeDomains) {
    if (senderLower.includes(fake)) {
      score += 40;
    }
  }

  if (body.includes("<a href=")) {
    const linkMatches = body.match(/<a[^>]+href="([^"]+)"/g) || [];
    for (const link of linkMatches) {
      const href = link.match(/href="([^"]+)"/)?.[1] || "";
      if (href && !href.startsWith("https://") && !href.startsWith("mailto:")) {
        score += 10;
      }
    }
  }

  return Math.min(score, 100);
}

function detectThreats(
  subject: string,
  sender: string,
  body: string,
): string[] {
  const threats: string[] = [];
  const lowerBody = body.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  if (/urgent|act now|immediately|deadline/i.test(lowerSubject + lowerBody)) {
    threats.push("Creates urgency to bypass scrutiny");
  }

  if (/verify|confirm|login|account.*update/i.test(lowerBody)) {
    threats.push("Requests sensitive information");
  }

  if (/click.*here|login.*now|update.*now/i.test(lowerBody)) {
    threats.push("Contains suspicious call-to-action links");
  }

  if (/(winner|congratulations|you've won)/i.test(lowerBody)) {
    threats.push("Classic phishing lure detected");
  }

  const links = body.match(/https?:\/\/[^\s<]+/g) || [];
  for (const link of links) {
    try {
      const url = new URL(link);
      if (url.hostname !== "google.com" && url.hostname !== "mail.google.com") {
        threats.push(`External link: ${link.substring(0, 30)}...`);
      }
    } catch {
      threats.push("Malformed URL detected");
    }
  }

  if (/payment|credit card|ssn|social security/i.test(lowerBody)) {
    threats.push("Requests financial or personal data");
  }

  return [...new Set(threats)].slice(0, 5);
}

function generateRecommendations(riskLevel: string, threats: string[]): string {
  if (riskLevel === "low") {
    return "This email appears to be legitimate. Continue to exercise normal caution.";
  }

  if (riskLevel === "medium") {
    return "Exercise caution with this email. Do not click links or download attachments until you verify the sender.";
  }

  return "This email shows multiple signs of phishing. Do not interact with it. Mark as spam and delete.";
}

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

export type AppRouter = typeof app;
