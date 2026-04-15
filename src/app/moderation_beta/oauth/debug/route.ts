import { NextResponse } from "next/server";
import { getOAuthClient } from "src/lib/oauthClient";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await getOAuthClient();
    return NextResponse.json({
      ok: true,
      jwks_keys_count: client.jwks.keys.length,
      jwks_kids: client.jwks.keys.map((k) => k.kid),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}