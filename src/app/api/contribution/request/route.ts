import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import { checkDuplicate } from "./_checkDuplicate";
import { checkOrigin } from "src/lib/csrf";
import { requestContributionSchema } from "src/lib/schemas/requestContribution";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
};

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

  const parsed = requestContributionSchema.safeParse({
    twitterUrl: typeof body.twitterUrl === "string" ? body.twitterUrl.trim() : body.twitterUrl,
    twitterName: typeof body.twitterName === "string" ? body.twitterName.trim() : body.twitterName,
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "入力値が不正です" }, { status: 400 });
  }

  const safeUrl = parsed.data.twitterUrl;
  const safeName = parsed.data.twitterName;

  const databaseId = process.env.ACCOUNTLIST_DATABASE;
  if (!databaseId) {
    console.error("ACCOUNTLIST_DATABASE is not set");
    return NextResponse.json({ ok: false, message: "サーバー設定エラーです" }, { status: 500 });
  }

  try {
    const duplicate = await checkDuplicate(safeUrl);
    if (duplicate) {
      return NextResponse.json(
        { ok: false, message: "このアカウントはすでに登録されています" },
        { status: 409 }
      );
    }
  } catch (err) {
    console.error("Notion query error:", err);
    return NextResponse.json(
      { ok: false, message: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  const client = new Client({ auth: process.env.NOTION_API_KEY });

  try {
    await client.pages.create({
      parent: { database_id: databaseId },
      properties: {
        名前: {
          title: [{ text: { content: safeName } }],
        },
        "Twitter/X アカウント": {
          url: safeUrl,
        },
        ステータス: {
          select: { name: "未移行（未確認）" },
        },
        公開: {
          checkbox: false,
        },
      },
    });
  } catch (err) {
    console.error("Notion API error:", err);
    return NextResponse.json(
      { ok: false, message: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
