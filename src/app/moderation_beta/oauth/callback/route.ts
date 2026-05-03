import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "src/lib/auth";
import { getOAuthClient } from "src/lib/oauthClient";
import { getSupabaseClient } from "src/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // host ヘッダーを使ってリダイレクト先を組み立てる（localhost/127.0.0.1 の食い違いを防ぐ）
  const host = req.headers.get("host") ?? "localhost:15010";
  const baseUrl = `http://${host}`;

  let session;
  try {
    const client = await getOAuthClient();
    ({ session } = await client.callback(req.nextUrl.searchParams));
  } catch {
    return NextResponse.redirect(`${baseUrl}/moderation_beta?error=oauth_failed`);
  }

  const supabase = getSupabaseClient();

  // moderators テーブルに DID がなければ弾く
  const { data: moderator } = await supabase
    .from("moderators")
    .select("id")
    .eq("did", session.did)
    .single();

  if (!moderator) {
    return NextResponse.redirect(`${baseUrl}/moderation_beta?error=unauthorized`);
  }

  // ログイン時にアバターを更新（失敗しても続行）
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${session.did}`
    );
    if (res.ok) {
      const profile = await res.json();
      await supabase
        .from("moderators")
        .update({ avatar: profile.avatar ?? null })
        .eq("did", session.did);
    }
  } catch {
    // アバター更新失敗は無視
  }

  const response = NextResponse.redirect(`${baseUrl}/moderation_beta`);
  response.cookies.set(SESSION_COOKIE, session.did, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response;
}
