import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "src/lib/oauthClient";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { handle } = await req.json();
  if (!handle || typeof handle !== "string") {
    return NextResponse.json({ error: "handle is required" }, { status: 400 });
  }

  const client = await getOAuthClient();
  const url = await client.authorize(handle, { scope: "atproto" });
  return NextResponse.json({ url: url.toString() });
}
