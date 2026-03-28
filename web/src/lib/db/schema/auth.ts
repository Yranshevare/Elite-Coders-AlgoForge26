import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  isVerified: boolean("isVerified").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull(),
});

export const otp = pgTable("otp", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export interface predictions {
  error: boolean;
  prediction: "bad" | "good";
  raw: {
    good: number;
    bad: number;
  };
  status: string;
}

export const predictions = pgTable("predictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId").notNull(),
  metadata: jsonb("metadata").notNull().$type<predictions>(),
  sender: text("sender"),
  emailSubject: text("emailSubject"),
  body: text("body"),
  attachments: jsonb("attachments"),
});

export type User = typeof user.$inferSelect;
