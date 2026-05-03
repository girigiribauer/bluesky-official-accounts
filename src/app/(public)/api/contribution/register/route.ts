import { NextRequest, NextResponse } from "next/server";
import { checkOrigin } from "src/lib/csrf";
import { getSupabaseClient } from "src/lib/supabaseClient";
import { registerContributionSchema } from "src/lib/schemas/registerContribution";
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

  const parsed = registerContributionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "入力値が不正です" }, { status: 400 });
  }

  const { did, handle, accountName, oldCategory, fields, migrationStatus, twitterUrl, evidence } =
    parsed.data;

  const fieldId = fields[0];
  const twitterHandle = extractTwitterHandle(twitterUrl.trim()) ?? null;

  try {
    const supabase = getSupabaseClient();

    // twitter_handle が requests に存在する場合は request_id を設定する（D03 用）
    let requestId: string | null = null;
    if (twitterHandle) {
      const { data: request } = await supabase
        .from("requests")
        .select("id")
        .eq("twitter_handle", twitterHandle)
        .maybeSingle();
      requestId = request?.id ?? null;
    }

    const { error } = await supabase.from("entry_submissions").insert({
      account_name: accountName.trim(),
      bluesky_did: did,
      bluesky_handle: handle.trim(),
      twitter_url: twitterUrl.trim() || null,
      old_category: oldCategory.trim() || null,
      field_id: fieldId,
      transition_status: migrationStatus,
      evidence: evidence.trim() || null,
      request_id: requestId,
    });

    if (error) throw error;
  } catch (err) {
    console.error("Supabase error:", err);
    return NextResponse.json(
      { ok: false, message: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
