import { defineEnv } from "envin";
import { vercel } from "envin/presets/zod";
import * as z from "zod";

export default defineEnv({
  extends: [vercel],

  clientPrefix: "NEXT_PUBLIC_",

  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string(),
  },

  env: {
    ...process.env,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
});
