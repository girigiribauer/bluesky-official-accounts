import { NextRequest, NextResponse } from "next/server";
import { getNotionClient } from "src/lib/notionClient";

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

  // Notion DB で重複確認
  const databaseId = process.env.ACCOUNTLIST_DATABASE;
  if (!databaseId) {
    console.error("ACCOUNTLIST_DATABASE is not set");
    return NextResponse.json({ ok: false, message: "サーバー設定エラーです" }, { status: 500 });
  }

  const blueskyUrl = `https://bsky.app/profile/${profile.handle}`;

  try {
    const existing = await getNotionClient().databases.query({
      database_id: databaseId,
      filter: {
        property: "Bluesky アカウント",
        url: { equals: blueskyUrl },
      },
    });

    if (existing.results.length > 0) {
      const page = existing.results[0] as any;
      const props = page.properties;
      return NextResponse.json({
        status: "registered",
        did: profile.did,
        handle: profile.handle,
        displayName: profile.displayName ?? profile.handle,
        existing: {
          name: props["名前"]?.title[0]?.plain_text ?? "",
          category: props["分類"]?.select?.name ?? "",
          source: props["根拠"]?.rich_text[0]?.plain_text ?? "",
          twitter: props["Twitter/X アカウント"]?.url ?? "",
          status: props["ステータス"]?.select?.name ?? "",
        },
      });
    }
  } catch (err) {
    console.error("Notion query error:", err);
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
