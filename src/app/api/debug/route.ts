import { NextResponse } from "next/server";

export async function GET() {
  const gid = process.env.GOOGLE_CLIENT_ID || "";
  const gsec = process.env.GOOGLE_CLIENT_SECRET || "";

  const info: Record<string, unknown> = {
    GOOGLE_CLIENT_ID_len: gid.length,
    GOOGLE_CLIENT_ID_suffix: gid.slice(-35),
    GOOGLE_CLIENT_ID_prefix: gid.slice(0, 10),
    GOOGLE_CLIENT_SECRET_len: gsec.length,
    GOOGLE_CLIENT_SECRET_prefix: gsec.slice(0, 8),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_URL: process.env.AUTH_URL || "not set",
    NODE_ENV: process.env.NODE_ENV,
  };

  // Try fetching Google OIDC discovery to check network
  try {
    const res = await fetch(
      "https://accounts.google.com/.well-known/openid-configuration"
    );
    info.google_discovery = res.ok ? "ok" : `failed: ${res.status}`;
  } catch (e) {
    info.google_discovery = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(info);
}
