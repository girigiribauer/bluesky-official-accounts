import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "src/lib/auth";
import { isAllowedBetaUser } from "src/lib/betaAllowList";
import { getOAuthClient } from "src/lib/oauthClient";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const client = await getOAuthClient();
  const { session } = await client.callback(req.nextUrl.searchParams);

  // host ヘッダーを使ってリダイレクト先を組み立てる（localhost/127.0.0.1 の食い違いを防ぐ）
  const host = req.headers.get("host") ?? "localhost:15010";
  const baseUrl = `http://${host}`;

  // ベータ版は許可リストの DID のみ通す
  if (!isAllowedBetaUser(session.did)) {
    return NextResponse.redirect(`${baseUrl}/moderation_beta?error=unauthorized`);
  }

  // Bluesky 公開 API でプロフィールを取得して moderators に upsert
  let profile: { handle?: string; displayName?: string } = {};
  try {
    const profileRes = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${session.did}`
    );
    if (profileRes.ok) profile = await profileRes.json();
  } catch {
    // プロフィール取得失敗時は DID をフォールバックとして使うため続行
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
  await supabase.from("moderators").upsert(
    {
      did: session.did,
      handle: profile.handle ?? session.did,
      display_name: profile.displayName ?? profile.handle ?? session.did,
    },
    { onConflict: "did" }
  );

  const response = NextResponse.redirect(`${baseUrl}/moderation_beta`);
  response.cookies.set(SESSION_COOKIE, session.did, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
