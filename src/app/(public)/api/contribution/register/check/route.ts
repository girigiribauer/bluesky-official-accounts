import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "src/lib/supabaseClient";

const parseActor = (input: string): string => {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/^https?:\/\/bsky\.app\/profile\/([^/?#]+)/);
  if (urlMatch) return urlMatch[1];
  if (trimmed.startsWith("@")) return trimmed.slice(1);
  return trimmed;
};

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("actor");
  if (!raw || !raw.trim()) {
    return NextResponse.json({ ok: false, message: "入力値が不正です" }, { status: 400 });
  }

  const actor = parseActor(raw);

  // Bluesky Public API でアカウントを解決
  let profile: { did: string; handle: string; displayName?: string };
  try {
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`,
      { next: { revalidate: 0 } }
    );
    if (res.status === 400 || res.status === 404) {
      return NextResponse.json({ status: "invalid" });
    }
    if (!res.ok) throw new Error(`Bluesky API error: ${res.status}`);
    profile = await res.json();
  } catch (err) {
    console.error("Bluesky API error:", err);
    return NextResponse.json(
      { ok: false, message: "アカウントの確認に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  // Supabase で重複確認
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("entries")
      .select("twitter_handle, transition_status, accounts(display_name, old_category, evidences(content))")
      .eq("bluesky_did", profile.did)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      const account = Array.isArray(data.accounts) ? data.accounts[0] : data.accounts;
      const twitterUrl = data.twitter_handle
        ? `https://x.com/${data.twitter_handle}`
        : "";
      const evidences = account?.evidences ?? [];
      const source = Array.isArray(evidences) && evidences.length > 0
        ? (evidences[0] as { content: string }).content
        : "";

      return NextResponse.json({
        status: "registered",
        did: profile.did,
        handle: profile.handle,
        displayName: profile.displayName ?? profile.handle,
        existing: {
          name: account?.display_name ?? "",
          category: account?.old_category ?? "",
          source,
          twitter: twitterUrl,
          status: data.transition_status ?? "",
        },
      });
    }
  } catch (err) {
    console.error("Supabase query error:", err);
    return NextResponse.json(
      { ok: false, message: "確認に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: "new",
    did: profile.did,
    handle: profile.handle,
    displayName: profile.displayName ?? profile.handle,
  });
}
