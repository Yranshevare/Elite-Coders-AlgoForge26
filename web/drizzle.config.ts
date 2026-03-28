import type { Config } from "drizzle-kit";
import "dotenv/config";

console.log(process.env.DATABASE_URL);

export default {
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
} satisfies Config;
