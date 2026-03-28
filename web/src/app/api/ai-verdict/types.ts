import z from "zod";
import { dnsPhishingCheck } from "../dns-lookup/child-fn";

export const AiVerdictSchema = z.object({
  verdict: z.enum(["SAFE", "SUSPICIOUS", "PHISHING"]),
  confidence: z.number().min(0).max(1),
  reasons: z.array(z.string()),
  recommendation: z.string(),
});

export type AiVerdict = z.infer<typeof AiVerdictSchema>;
export type DnsResult = Awaited<ReturnType<typeof dnsPhishingCheck>>;

export interface SafeBrowsingMatch {
  threatType?: string;
  platformType?: string;
  threatEntryType?: string;
  threat?: { url?: string };
}

export interface SafeBrowsingResult {
  isSafe: boolean;
  matches: SafeBrowsingMatch[];
}

export interface RequestBody {
  domain: string;
  userId: string;
  historyId?: string;
  senderEmail?: string;
  emailSubject?: string;
  emailBody?: string;
  links?: string[];
}

export interface FinalResponse {
  domain: string;
  ruleBasedVerdict: string;
  aiVerdict: AiVerdict;
  result: DnsResult;
  safeBrowsing: SafeBrowsingResult;
}

export interface ApiErrorResponse {
  error: string;
}

export interface MlResponse{
    error:boolean,
    success: string,
    raw?: {
        good: number;
        bad: number
    },
    prediction?: "bad" | "good"

}
