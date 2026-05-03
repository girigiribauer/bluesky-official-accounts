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

// 登録申請を承認し、エントリーを公開リストに追加する。
// DID が既登録の場合は情報を更新。来て欲しいリストに紐付いていれば承認時に削除する。
export async function approveEntrySubmission(submissionId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabaseClient();

  const { data: submission, error: fetchError } = await supabase
    .from("entry_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();
  if (fetchError || !submission) return { ok: false, error: "申請が見つかりません" };

  try {
    const twitterHandle = submission.twitter_url ? extractTwitterHandle(submission.twitter_url) : null;

    const { data: existingEntry } = await supabase
      .from("entries")
      .select("id, account_id")
      .eq("bluesky_did", submission.bluesky_did)
      .maybeSingle();

    let accountId: string;

    if (existingEntry) {
      accountId = existingEntry.account_id;

      const { error: updateEntryError } = await supabase
        .from("entries")
        .update({
          bluesky_handle: submission.bluesky_handle,
          twitter_handle: twitterHandle,
          transition_status: submission.transition_status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingEntry.id);
      if (updateEntryError) throw updateEntryError;

      const { error: updateAccountError } = await supabase
        .from("accounts")
        .update({ display_name: submission.account_name })
        .eq("id", accountId);
      if (updateAccountError) throw updateAccountError;

      // 同じ分野なら分類を更新、異なる分野なら account_fields を追加
      const { data: existingField } = await supabase
        .from("account_fields")
        .select("field_id")
        .eq("account_id", accountId)
        .eq("field_id", submission.field_id)
        .maybeSingle();

      if (existingField) {
        if (submission.classification_id !== null) {
          const { error: updateFieldError } = await supabase
            .from("account_fields")
            .update({ classification_id: submission.classification_id })
            .eq("account_id", accountId)
            .eq("field_id", submission.field_id);
          if (updateFieldError) throw updateFieldError;
        }
      } else {
        const { error: insertFieldError } = await supabase
          .from("account_fields")
          .insert({
            account_id: accountId,
            field_id: submission.field_id,
            classification_id: submission.classification_id,
          });
        if (insertFieldError) throw insertFieldError;
      }

      // 来て欲しいリストに紐付いていた場合は requests を削除
      if (submission.request_id) {
        const { error: requestError } = await supabase
          .from("requests")
          .delete()
          .eq("id", submission.request_id);
        if (requestError) throw requestError;
      }
    } else {
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .insert({
          display_name: submission.account_name,
          old_category: submission.old_category,
          submitted_by: null,
        })
        .select("id")
        .single();
      if (accountError) throw accountError;
      accountId = account.id;

      const { error: entryError } = await supabase
        .from("entries")
        .insert({
          account_id: accountId,
          bluesky_did: submission.bluesky_did,
          bluesky_handle: submission.bluesky_handle,
          twitter_handle: twitterHandle,
          transition_status: submission.transition_status,
          approved_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (entryError) throw entryError;

      const { error: fieldError } = await supabase.from("account_fields").insert({
        account_id: accountId,
        field_id: submission.field_id,
        classification_id: submission.classification_id,
      });
      if (fieldError) throw fieldError;

      // D03: 来て欲しいリストに存在した場合は requests を削除
      if (submission.request_id) {
        const { error: requestError } = await supabase
          .from("requests")
          .delete()
          .eq("id", submission.request_id);
        if (requestError) throw requestError;
      }
    }

    if (submission.evidence?.trim()) {
      const { error: evidenceError } = await supabase.from("evidences").insert({
        account_id: accountId,
        moderator_id: moderator.id,
        content: submission.evidence.trim(),
      });
      if (evidenceError) throw evidenceError;
    }

    const { error: activityError } = await supabase.from("activities").insert({
      account_id: accountId,
      moderator_id: moderator.id,
      action: "approve",
    });
    if (activityError) throw activityError;

    const { error: deleteError } = await supabase
      .from("entry_submissions")
      .delete()
      .eq("id", submissionId);
    if (deleteError) throw deleteError;
  } catch (err) {
    console.error("approveEntrySubmission error:", err);
    return { ok: false, error: "承認に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}

// 登録申請を却下して削除する。活動ログは残さない（MVP 割り切り）。
export async function rejectEntrySubmission(submissionId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase
      .from("entry_submissions")
      .delete()
      .eq("id", submissionId);
    if (error) throw error;
  } catch {
    return { ok: false, error: "却下に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}

// レビュー中の登録申請フィールドを修正する。
export async function updateSubmissionName(submissionId: string, name: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const parsed = updateEntryNameSchema.safeParse({ name });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };

  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase
      .from("entry_submissions")
      .update({ account_name: parsed.data.name })
      .eq("id", submissionId);
    if (error) throw error;
  } catch {
    return { ok: false, error: "更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function updateSubmissionTwitterUrl(submissionId: string, url: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const parsed = updateSubmissionTwitterUrlSchema.safeParse({ url });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };

  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase
      .from("entry_submissions")
      .update({ twitter_url: parsed.data.url || null })
      .eq("id", submissionId);
    if (error) throw error;
  } catch {
    return { ok: false, error: "更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function updateSubmissionBlueskyHandle(submissionId: string, handle: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const parsed = updateEntryBlueskyHandleSchema.safeParse({ handle });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };

  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase
      .from("entry_submissions")
      .update({ bluesky_handle: parsed.data.handle })
      .eq("id", submissionId);
    if (error) throw error;
  } catch {
    return { ok: false, error: "更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function updateSubmissionTransitionStatus(submissionId: string, status: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const parsed = updateEntryStatusSchema.safeParse({ status });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };

  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase
      .from("entry_submissions")
      .update({ transition_status: parsed.data.status })
      .eq("id", submissionId);
    if (error) throw error;
  } catch {
    return { ok: false, error: "更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function updateSubmissionEvidence(submissionId: string, evidence: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase
      .from("entry_submissions")
      .update({ evidence: evidence.trim() || null })
      .eq("id", submissionId);
    if (error) throw error;
  } catch {
    return { ok: false, error: "更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function setSubmissionClassification(submissionId: string, classificationId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const parsed = setEntryClassificationSchema.safeParse({ classificationId });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };

  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase
      .from("entry_submissions")
      .update({ classification_id: parsed.data.classificationId || null })
      .eq("id", submissionId);
    if (error) throw error;
  } catch {
    return { ok: false, error: "分類の更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

// 来て欲しいアカウント申請を承認してリストに追加する。
export async function approveRequestSubmission(submissionId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabaseClient();

  const { data: submission, error: fetchError } = await supabase
    .from("request_submissions")
    .select("*")
    .eq("id", submissionId)
    .single();
  if (fetchError || !submission) return { ok: false, error: "申請が見つかりません" };

  try {
    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .insert({ display_name: submission.display_name, submitted_by: null })
      .select("id")
      .single();
    if (accountError) throw accountError;

    const { error: requestError } = await supabase.from("requests").insert({
      account_id: account.id,
      twitter_handle: submission.twitter_handle,
    });
    if (requestError) throw requestError;

    const { error: activityError } = await supabase.from("activities").insert({
      account_id: account.id,
      moderator_id: moderator.id,
      action: "approve",
    });
    if (activityError) throw activityError;

    const { error: deleteError } = await supabase
      .from("request_submissions")
      .delete()
      .eq("id", submissionId);
    if (deleteError) throw deleteError;
  } catch (err) {
    console.error("approveRequestSubmission error:", err);
    return { ok: false, error: "承認に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}

// 来て欲しいアカウント申請を却下して削除する。活動ログは残さない（MVP 割り切り）。
export async function rejectRequestSubmission(submissionId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase
      .from("request_submissions")
      .delete()
      .eq("id", submissionId);
    if (error) throw error;
  } catch {
    return { ok: false, error: "却下に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}
