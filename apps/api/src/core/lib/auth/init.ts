import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "../../../core/db/client.js";
import { member as memberSchema, user } from "../../../core/db/schema/index.js";
import { eq } from "drizzle-orm";
import { stripe } from "@better-auth/stripe";
import { and } from "drizzle-orm";
import { sendEmail } from "../resend/send-email.js";

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "chrome-extension://*",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendEmail({
          from: process.env.RESEND_EMAIL || "noreply@trustinbox.com",
          to: email,
          subject:
            type === "sign-in"
              ? "Your TrustInBox Sign-In Code"
              : type === "email-verification"
                ? "Verify Your Email"
                : "Reset Your Password",
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Your Verification Code</h2>
              <p>Your code is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
              <p>This code expires in 5 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });
      },
    }),
  ],
});
