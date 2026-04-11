import { NextResponse } from "next/server";
import { getOAuthClient } from "src/lib/oauthClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await getOAuthClient();
  return NextResponse.json(client.clientMetadata);
}
