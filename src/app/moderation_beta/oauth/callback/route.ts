import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "src/lib/auth";
import { getOAuthClient } from "src/lib/oauthClient";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const client = await getOAuthClient();
  const { session } = await client.callback(req.nextUrl.searchParams);

  // host ヘッダーを使ってリダイレクト先を組み立てる（localhost/127.0.0.1 の食い違いを防ぐ）
  const host = req.headers.get("host") ?? "localhost:15010";
  const baseUrl = `http://${host}`;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  // moderators テーブルに DID がなければ弾く
  const { data: moderator } = await supabase
    .from("moderators")
    .select("id")
    .eq("did", session.did)
    .single();

  if (!moderator) {
    return NextResponse.redirect(`${baseUrl}/moderation_beta?error=unauthorized`);
  }

  await supabase
    .from("moderators")
    .update({ last_active_at: new Date().toISOString() })
    .eq("did", session.did);

  const response = NextResponse.redirect(`${baseUrl}/moderation_beta`);
  response.cookies.set(SESSION_COOKIE, session.did, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
