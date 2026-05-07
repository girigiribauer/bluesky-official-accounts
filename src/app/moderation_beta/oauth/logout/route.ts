import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "src/lib/auth";
import { getOAuthClient } from "src/lib/oauthClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const did = token ? verifyToken(token) : null;

  if (did) {
    const client = await getOAuthClient();
    await client.revoke(did).catch(() => {});
  }

  const response = NextResponse.redirect(new URL("/moderation_beta", req.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
