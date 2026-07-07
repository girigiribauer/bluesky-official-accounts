"use server";

import { revalidatePath } from "next/cache";
import { getCurrentModerator } from "src/lib/auth";
import { extractTwitterHandle } from "src/lib/twitterUrl";
import { getSupabaseClient } from "src/lib/supabaseClient";
import {
  updateEntryNameSchema,
  updateEntryBlueskyHandleSchema,
  updateEntryStatusSchema,
  setEntryClassificationSchema,
  updateSubmissionTwitterUrlSchema,
} from "src/lib/schemas/moderation";
import type { Result } from "src/types/result";
import type { Database } from "src/types/database";

type EntrySubmissionUpdate = Database["public"]["Tables"]["entry_submissions"]["Update"];

// 登録申請を承認し、エントリーを公開リストに追加する。
// 一連の書き込みは Postgres 関数（approve_entry_submission）内で1トランザクションとして実行する。
// URL パースは純粋ロジックなので TS 側に残し、解決済みの twitter_handle を関数へ渡す。
export async function approveEntrySubmission(submissionId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabaseClient();

  const { data: submission, error: fetchError } = await supabase
    .from("entry_submissions")
    .select("twitter_url")
    .eq("id", submissionId)
    .single();
  if (fetchError || !submission) return { ok: false, error: "申請が見つかりません" };

  const twitterHandle = submission.twitter_url ? extractTwitterHandle(submission.twitter_url) : null;

  const { error } = await supabase.rpc("approve_entry_submission", {
    p_submission_id: submissionId,
    p_moderator_id: moderator.id,
    // twitter が無いときは省略（SQL 側デフォルト NULL）。型生成の都合で null ではなく undefined を渡す
    p_twitter_handle: twitterHandle ?? undefined,
  });
  if (error) {
    console.error("approveEntrySubmission error:", error);
    return { ok: false, error: "承認に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}

// 登録申請を却下して削除する。
export async function rejectEntrySubmission(submissionId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabaseClient();

  try {
    const { data: submission } = await supabase
      .from("entry_submissions")
      .select("account_name, field_id")
      .eq("id", submissionId)
      .single();

    const { error } = await supabase
      .from("entry_submissions")
      .delete()
      .eq("id", submissionId);
    if (error) throw error;

    const { error: logError } = await supabase.from("activities").insert({
      moderator_id: moderator.id,
      action: "reject",
      payload: {
        submission_id: submissionId,
        submission_type: "entry",
        display_name: submission?.account_name ?? "",
        field_id: submission?.field_id ?? null,
      },
    });
    if (logError) console.error("reject activity log failed:", logError);
  } catch {
    return { ok: false, error: "却下に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}

// レビュー中の登録申請フィールドを修正する。
// 認証チェック → entry_submissions の更新 → revalidate の共通処理をまとめる。
async function updateEntrySubmissionFields(
  submissionId: string,
  patch: EntrySubmissionUpdate,
  errorMessage = "更新に失敗しました",
): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase
      .from("entry_submissions")
      .update(patch)
      .eq("id", submissionId);
    if (error) throw error;
  } catch {
    return { ok: false, error: errorMessage };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function updateSubmissionName(submissionId: string, name: string): Promise<Result> {
  const parsed = updateEntryNameSchema.safeParse({ name });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };
  return updateEntrySubmissionFields(submissionId, { account_name: parsed.data.name });
}

export async function updateSubmissionTwitterUrl(submissionId: string, url: string): Promise<Result> {
  const parsed = updateSubmissionTwitterUrlSchema.safeParse({ url });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };
  return updateEntrySubmissionFields(submissionId, { twitter_url: parsed.data.url || null });
}

export async function updateSubmissionBlueskyHandle(submissionId: string, handle: string): Promise<Result> {
  const parsed = updateEntryBlueskyHandleSchema.safeParse({ handle });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };
  return updateEntrySubmissionFields(submissionId, { bluesky_handle: parsed.data.handle });
}

export async function updateSubmissionTransitionStatus(submissionId: string, status: string): Promise<Result> {
  const parsed = updateEntryStatusSchema.safeParse({ status });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };
  return updateEntrySubmissionFields(submissionId, { transition_status: parsed.data.status });
}

export async function updateSubmissionEvidence(submissionId: string, evidence: string): Promise<Result> {
  return updateEntrySubmissionFields(submissionId, { evidence: evidence.trim() || null });
}

export async function setSubmissionClassification(submissionId: string, classificationId: string): Promise<Result> {
  const parsed = setEntryClassificationSchema.safeParse({ classificationId });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };
  return updateEntrySubmissionFields(
    submissionId,
    { classification_id: parsed.data.classificationId || null },
    "分類の更新に失敗しました",
  );
}

// 来て欲しいアカウント申請を承認してリストに追加する。
// 一連の書き込みは Postgres 関数（approve_request_submission）内で1トランザクションとして実行する。
export async function approveRequestSubmission(submissionId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const { error } = await getSupabaseClient().rpc("approve_request_submission", {
    p_submission_id: submissionId,
    p_moderator_id: moderator.id,
  });
  if (error) {
    console.error("approveRequestSubmission error:", error);
    return { ok: false, error: "承認に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}

// 来て欲しいアカウント申請を却下して削除する。
export async function rejectRequestSubmission(submissionId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabaseClient();

  try {
    const { data: submission } = await supabase
      .from("request_submissions")
      .select("display_name, field_id")
      .eq("id", submissionId)
      .single();

    const { error } = await supabase
      .from("request_submissions")
      .delete()
      .eq("id", submissionId);
    if (error) throw error;

    const { error: logError } = await supabase.from("activities").insert({
      moderator_id: moderator.id,
      action: "reject",
      payload: {
        submission_id: submissionId,
        submission_type: "request",
        display_name: submission?.display_name ?? "",
        field_id: submission?.field_id ?? null,
      },
    });
    if (logError) console.error("reject activity log failed:", logError);
  } catch {
    return { ok: false, error: "却下に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function joinField(fieldId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const { error } = await getSupabaseClient()
    .from("field_memberships")
    .upsert(
      { moderator_id: moderator.id, field_id: fieldId, last_active_at: new Date().toISOString() },
      { onConflict: "moderator_id,field_id" }
    );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function updateFieldLastActive(fieldId: string): Promise<void> {
  const moderator = await getCurrentModerator();
  if (!moderator) return;

  await getSupabaseClient()
    .from("field_memberships")
    .update({ last_active_at: new Date().toISOString() })
    .eq("moderator_id", moderator.id)
    .eq("field_id", fieldId);
}
