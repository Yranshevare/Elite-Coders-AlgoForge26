import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export interface predictions {
  error: boolean;
  prediction: "bad" | "good";
  raw: {
    good: number;
    bad: number;
  };
  status: string;
}

export const history = sqliteTable("history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("userId").notNull(),
  senderEmail: text("sender"),
  emailSubject: text("emailSubject"),
  emailBody: text("emailBody"),
  attachmentCount: integer("attachmentCount").notNull().default(0),
  llmPrediction: text("llm_prediction").notNull(),
  dnsLookupResult: text("dns_lookup_result"),
  googleSafeBrowsingResult: text("google_safe_browsing_result"),
  mlResponse: text("ml_response"),
  finalAiVerdict: text("final_ai_verdict"),
  attachments: text("attachments"),
});
