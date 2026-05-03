import { NextRequest, NextResponse } from "next/server";
import { checkDuplicate } from "./_checkDuplicate";
import { checkOrigin } from "src/lib/csrf";
import { getSupabaseClient } from "src/lib/supabaseClient";
import { requestContributionSchema } from "src/lib/schemas/requestContribution";
import { extractTwitterHandle } from "src/lib/twitterUrl";

export async function POST(req: NextRequest) {
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
    if (duplicate === "entry") {
      return NextResponse.json(
        { ok: false, message: "このアカウントはすでに Bluesky に来ています" },
        { status: 409 }
      );
    }
    if (duplicate === "request") {
      return NextResponse.json(
        { ok: false, message: "このアカウントはすでにリクエスト済みです" },
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

    const { error } = await supabase.from("request_submissions").insert({
      display_name: safeName,
      twitter_handle: twitterHandle,
    });

    if (error) throw error;
  } catch (err) {
    console.error("Supabase insert error:", err);
    return NextResponse.json(
      { ok: false, message: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
