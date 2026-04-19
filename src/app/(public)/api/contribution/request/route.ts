import { NextRequest, NextResponse } from "next/server";
import { checkDuplicate } from "./_checkDuplicate";
import { checkOrigin } from "src/lib/csrf";
import { getSupabaseClient } from "src/lib/supabaseClient";
import { checkRateLimit } from "src/lib/rateLimit";
import { requestContributionSchema } from "src/lib/schemas/requestContribution";

const TWITTER_URL_PREFIX = "https://x.com/";
const TWITTER_COM_PREFIX = "https://twitter.com/";

function extractTwitterHandle(url: string): string | null {
  if (url.startsWith(TWITTER_URL_PREFIX)) {
    return url.slice(TWITTER_URL_PREFIX.length).replace(/\/$/, "") || null;
  }
  if (url.startsWith(TWITTER_COM_PREFIX)) {
    return url.slice(TWITTER_COM_PREFIX.length).replace(/\/$/, "") || null;
  }
  return null;
}

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

  try {
    const duplicate = await checkDuplicate(safeUrl);
    if (duplicate) {
      return NextResponse.json(
        { ok: false, message: "このアカウントはすでに登録されています" },
        { status: 409 }
      );
    }
  } catch (err) {
    console.error("Supabase query error:", err);
    return NextResponse.json(
      { ok: false, message: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  const twitterHandle = extractTwitterHandle(safeUrl);
  if (!twitterHandle) {
    return NextResponse.json({ ok: false, message: "入力値が不正です" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();

    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .insert({
        display_name: safeName,
        submitted_by: null,
      })
      .select("id")
      .single();

    if (accountError) throw accountError;

    const { error: requestError } = await supabase.from("requests").insert({
      account_id: account.id,
      twitter_handle: twitterHandle,
    });

    if (requestError) throw requestError;
  } catch (err) {
    console.error("Supabase insert error:", err);
    return NextResponse.json(
      { ok: false, message: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
