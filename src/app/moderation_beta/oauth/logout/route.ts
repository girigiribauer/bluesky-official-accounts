import { NextRequest, NextResponse } from "next/server";
import { getOAuthClient } from "src/lib/oauthClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const SESSION_COOKIE = "moderator_did";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const did = cookieStore.get(SESSION_COOKIE)?.value;

  if (did) {
    const client = await getOAuthClient();
    await client.revoke(did).catch(() => {});
  }

  const response = NextResponse.redirect(new URL("/moderation_beta", req.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
