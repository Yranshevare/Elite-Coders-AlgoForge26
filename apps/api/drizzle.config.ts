import type { Config } from "drizzle-kit";
import "dotenv/config";

export default {
  schema: "./src/core/db/schema/auth.ts",
  out: "../../drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
} satisfies Config;
