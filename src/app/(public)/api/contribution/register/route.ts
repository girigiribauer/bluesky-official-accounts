import { NextRequest, NextResponse } from "next/server";
import { checkOrigin } from "src/lib/csrf";
import { getNotionClient } from "src/lib/notionClient";
import { checkRateLimit } from "src/lib/rateLimit";
import { registerContributionSchema } from "src/lib/schemas/registerContribution";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, message: "しばらくしてから再度お試しください" },
      { status: 429 }
    );
  }

  if (!checkOrigin(req)) {
    return NextResponse.json({ ok: false, message: "不正なリクエストです" }, { status: 403 });
  }

  const body = await req.json();

  // ハニーポット
  if (body.website) {
    return NextResponse.json({ ok: false, message: "入力値が不正です" }, { status: 400 });
  }

  const parsed = registerContributionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "入力値が不正です" }, { status: 400 });
  }

  const { did, handle, accountName, oldCategory, fields, migrationStatus, twitterUrl, evidence } =
    parsed.data;

  const databaseId = process.env.ACCOUNTLIST_DATABASE;
  if (!databaseId) {
    console.error("ACCOUNTLIST_DATABASE is not set");
    return NextResponse.json({ ok: false, message: "サーバー設定エラーです" }, { status: 500 });
  }

  const blueskyUrl = `https://bsky.app/profile/${handle.trim()}`;

  try {
    await getNotionClient().pages.create({
      parent: { database_id: databaseId },
      properties: {
        名前: { title: [{ text: { content: accountName.trim() } }] },
        "Bluesky アカウント": { url: blueskyUrl },
        分類: { select: { name: oldCategory.trim() } },
        分野: { multi_select: fields.map((f) => ({ name: f.trim() })) },
        ステータス: { select: { name: migrationStatus } },
        ...(twitterUrl.trim() && { "Twitter/X アカウント": { url: twitterUrl.trim() } }),
        ...(evidence.trim() && {
          根拠: { rich_text: [{ text: { content: evidence.trim() } }] },
        }),
        公開: { checkbox: false },
      },
    });
  } catch (err) {
    console.error("Notion API error:", err);
    return NextResponse.json(
      { ok: false, message: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  // didは現時点では未使用（将来の活用のためフロントから受け取っておく）
  void did;

  return NextResponse.json({ ok: true });
}
