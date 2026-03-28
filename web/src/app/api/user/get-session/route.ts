import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_change_me",
);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
};

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.userId) {
      return jsonResponse({ user: null }, 200);
    }

    const users = await db
      .select()
      .from(user)
      .where(eq(user.id, payload.userId as string))
      .limit(1);

    const currentUser = users[0];

    if (!currentUser) {
      return jsonResponse({ user: null }, 200);
    }

    return jsonResponse({
      user: {
        id: currentUser.id,
        email: currentUser.email,
        isVerified: Boolean(currentUser.isVerified),
      },
    });
  } catch (error) {
    console.error("Get session error:", error);
    return jsonResponse({ user: null }, 200);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}
