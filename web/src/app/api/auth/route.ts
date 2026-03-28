import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq, and, gt } from "drizzle-orm";
import { SignJWT } from "jose";
import { db } from "@/lib/db/client";
import { user, otp as otpTable } from "@/lib/db/schema";
import { sendOTPEmail, generateOTP } from "@/lib/email/service";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_change_me",
);

export type actionType = "send-otp" | "verify-otp";

function hashOTP(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, otp } = body;
    if (!email) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (action === "send-otp") {
      const code = generateOTP();
      const hashedCode = hashOTP(code);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const users = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      let currentUser = users[0];

      if (!currentUser) {
        const [newUser] = await db.insert(user).values({ email }).returning();
        currentUser = newUser;
      }

      await db.insert(otpTable).values({
        userId: currentUser.id,
        code: hashedCode,
        expiresAt,
      });

      const emailRes = await sendOTPEmail({ email, otp: code });
      if (!emailRes.success) {
        return NextResponse.json({ error: emailRes.error }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "verify-otp") {
      if (!otp) {
        return NextResponse.json({ error: "OTP is required" }, { status: 400 });
      }

      const users = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      const currentUser = users[0];

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const hashedOtp = hashOTP(otp);
      const otps = await db
        .select()
        .from(otpTable)
        .where(
          and(
            eq(otpTable.userId, currentUser.id),
            eq(otpTable.code, hashedOtp),
            gt(otpTable.expiresAt, new Date()),
          ),
        )
        .limit(1);

      const validOtp = otps[0];

      if (!validOtp) {
        return NextResponse.json(
          { error: "Invalid or expired OTP" },
          { status: 400 },
        );
      }

      if (!currentUser.isVerified) {
        await db
          .update(user)
          .set({ isVerified: 1 })
          .where(eq(user.id, currentUser.id));
      }

      await db.delete(otpTable).where(eq(otpTable.userId, currentUser.id));

      const token = await new SignJWT({
        userId: currentUser.id,
        email: currentUser.email,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
