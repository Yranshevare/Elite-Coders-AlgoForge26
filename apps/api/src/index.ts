import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "./core/lib/auth/init.js";
import { cors } from "hono/cors";
import analyzedomain from "./routes/analyzedomain.js";

import "dotenv/config";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .basePath("/api")
  .use(
    cors({
      origin: ["http://localhost:3001"],
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
  .on(["POST", "GET"], "/auth/*", async (c) => {
    return auth.handler(c.req.raw);
  })
  .route("/analyzedomain", analyzedomain);

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
