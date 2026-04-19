import { NextRequest, NextResponse } from "next/server";
import { checkOrigin } from "src/lib/csrf";
import { getSupabaseClient } from "src/lib/supabaseClient";
import { checkRateLimit } from "src/lib/rateLimit";
import { registerContributionSchema } from "src/lib/schemas/registerContribution";
import { FIELD_ID_LABELS } from "src/constants/contributionForm";

const TWITTER_URL_PREFIX = "https://x.com/";
const TWITTER_COM_PREFIX = "https://twitter.com/";

// 表示ラベル → field_id の逆引きマップ
const LABEL_TO_FIELD_ID: Record<string, string> = Object.fromEntries(
  Object.entries(FIELD_ID_LABELS).map(([id, label]) => [label, id])
);

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

  const parsed = registerContributionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "入力値が不正です" }, { status: 400 });
  }

  const { did, handle, accountName, oldCategory, fields, migrationStatus, twitterUrl, evidence } =
    parsed.data;

  const twitterHandle = extractTwitterHandle(twitterUrl.trim()) ?? null;
  const fieldLabel = fields[0];
  const fieldId = LABEL_TO_FIELD_ID[fieldLabel] ?? "business";

  try {
    const supabase = getSupabaseClient();

    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .insert({
        display_name: accountName.trim(),
        old_category: oldCategory.trim(),
        submitted_by: null,
      })
      .select("id")
      .single();

    if (accountError) throw accountError;

    const accountId = account.id;

    const { error: entryError } = await supabase
      .from("entries")
      .insert({
        account_id: accountId,
        bluesky_did: did,
        bluesky_handle: handle.trim(),
        twitter_handle: twitterHandle,
        transition_status: migrationStatus,
        status: "pending",
      });

    if (entryError) throw entryError;

    const { error: fieldError } = await supabase.from("account_fields").insert({
      account_id: accountId,
      field_id: fieldId,
      classification_id: null,
    });
    if (fieldError) throw fieldError;

    if (evidence.trim()) {
      const { error: evidenceError } = await supabase.from("evidences").insert({
        account_id: accountId,
        moderator_id: null,
        content: evidence.trim(),
      });
      if (evidenceError) throw evidenceError;
    }
  } catch (err) {
    console.error("Supabase error:", err);
    return NextResponse.json(
      { ok: false, message: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
