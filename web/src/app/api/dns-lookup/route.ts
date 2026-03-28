import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse, ApiResponse } from "./types";
import { dnsPhishingCheck, extractDomain, getVerdict } from "./child-fn";

export async function GET(
  req: NextRequest,
): Promise<NextResponse<ApiResponse | ApiErrorResponse>> {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("domain");

  if (!raw || raw.trim() === "") {
    return NextResponse.json(
      { error: "Missing required query param: domain" },
      { status: 400 },
    );
  }

  const domain = extractDomain(raw.trim());

  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 422 });
  }

  try {
    const result = await dnsPhishingCheck(domain);
    const v = getVerdict(result);
    return NextResponse.json({ domain, verdict: v, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse | ApiErrorResponse>> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("domain" in body)) {
    return NextResponse.json(
      { error: "Body must contain a domain field" },
      { status: 400 },
    );
  }

  const raw = (body as Record<string, unknown>).domain;

  if (typeof raw !== "string" || raw.trim() === "") {
    return NextResponse.json(
      { error: "domain must be a non-empty string" },
      { status: 400 },
    );
  }

  const domain = extractDomain(raw.trim());

  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 422 });
  }

  try {
    const result = await dnsPhishingCheck(domain);
    const v = getVerdict(result);
    return NextResponse.json({ domain, verdict: v, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
