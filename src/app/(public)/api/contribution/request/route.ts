import { NextRequest, NextResponse } from "next/server";
import { checkDuplicate } from "./_checkDuplicate";
import { checkOrigin } from "src/lib/csrf";
import { getNotionClient } from "src/lib/notionClient";
import { checkRateLimit } from "src/lib/rateLimit";
import { requestContributionSchema } from "src/lib/schemas/requestContribution";

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
    twitterUrl: body.twitterUrl,
    twitterName: body.twitterName,
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

  try {
    await getNotionClient().pages.create({
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
