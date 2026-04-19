"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentModerator, logout } from "src/lib/auth";
import type { Database } from "src/types/database";
import {
  updateEntryNameSchema,
  updateEntryTwitterHandleSchema,
  updateEntryBlueskyHandleSchema,
  updateEntryStatusSchema,
  setEntryClassificationSchema,
  addEvidenceSchema,
} from "src/lib/schemas/moderation";
import type { Result } from "src/types/result";

export async function logoutAction() {
  await logout();
  revalidatePath("/moderation_beta");
}

function getSupabase() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function approveEntry(entryId: string, accountId: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabase();

  try {
    const { error: updateError } = await supabase
      .from("entries")
      .update({ status: "published", approved_at: new Date().toISOString() })
      .eq("id", entryId);
    if (updateError) throw updateError;

    const { error: activityError } = await supabase.from("activities").insert({
      account_id: accountId,
      moderator_id: moderator.id,
      action: "approve",
    });
    if (activityError) throw activityError;
  } catch {
    return { ok: false, error: "承認に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}

// entries テーブルの各フィールド（twitter_handle / bluesky_handle / transition_status）を更新
type EntryEditableField = "twitter_handle" | "bluesky_handle" | "transition_status";

async function updateEntryField(
  entryId: string,
  accountId: string,
  field: EntryEditableField,
  value: string
): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabase();
  try {
    const { error: updateError } = await supabase
      .from("entries")
      .update({ [field]: value, updated_at: new Date().toISOString() } as any)
      .eq("id", entryId);
    if (updateError) throw updateError;

    const { error: activityError } = await supabase.from("activities").insert({
      account_id: accountId,
      moderator_id: moderator.id,
      action: "edit",
      payload: { field, value },
    });
    if (activityError) throw activityError;
  } catch {
    return { ok: false, error: "更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

// display_name は accounts テーブル側
export async function updateEntryName(accountId: string, displayName: string): Promise<Result> {
  const parsed = updateEntryNameSchema.safeParse({ name: displayName });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "アカウント名を入力してください" };

  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabase();
  try {
    const { error: updateError } = await supabase
      .from("accounts")
      .update({ display_name: parsed.data.name })
      .eq("id", accountId);
    if (updateError) throw updateError;

    const { error: activityError } = await supabase.from("activities").insert({
      account_id: accountId,
      moderator_id: moderator.id,
      action: "edit",
      payload: { field: "display_name", value: parsed.data.name },
    });
    if (activityError) throw activityError;
  } catch {
    return { ok: false, error: "更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function updateEntryTwitterHandle(entryId: string, accountId: string, handle: string): Promise<Result> {
  const parsed = updateEntryTwitterHandleSchema.safeParse({ handle });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };
  return updateEntryField(entryId, accountId, "twitter_handle", parsed.data.handle);
}

export async function updateEntryStatus(entryId: string, accountId: string, status: string): Promise<Result> {
  const parsed = updateEntryStatusSchema.safeParse({ status });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ステータスを選択してください" };
  return updateEntryField(entryId, accountId, "transition_status", parsed.data.status);
}

export async function updateEntryBlueskyHandle(entryId: string, accountId: string, handle: string): Promise<Result> {
  const parsed = updateEntryBlueskyHandleSchema.safeParse({ handle });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Bluesky ハンドルを入力してください" };
  return updateEntryField(entryId, accountId, "bluesky_handle", parsed.data.handle);
}

export async function setEntryClassification(accountId: string, classificationId: string): Promise<Result> {
  const parsed = setEntryClassificationSchema.safeParse({ classificationId });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };

  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabase();
  try {
    const { error: updateError } = await supabase
      .from("account_fields")
      .update({ classification_id: parsed.data.classificationId || null })
      .eq("account_id", accountId);
    if (updateError) throw updateError;

    const { error: activityError } = await supabase.from("activities").insert({
      account_id: accountId,
      moderator_id: moderator.id,
      action: "edit",
      payload: { field: "classification_id", value: parsed.data.classificationId || null },
    });
    if (activityError) throw activityError;
  } catch {
    return { ok: false, error: "分類の更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function addEvidence(accountId: string, content: string): Promise<Result<{ id: string }>> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const parsed = addEvidenceSchema.safeParse({ content });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "根拠を入力してください" };

  const supabase = getSupabase();
  try {
    const { data, error: insertError } = await supabase
      .from("evidences")
      .insert({ account_id: accountId, moderator_id: moderator.id, content: parsed.data.content })
      .select("id")
      .single();
    if (insertError) throw insertError;

    const { error: activityError } = await supabase.from("activities").insert({
      account_id: accountId,
      moderator_id: moderator.id,
      action: "edit",
      payload: { field: "evidence", value: parsed.data.content },
    });
    if (activityError) throw activityError;

    revalidatePath("/moderation_beta");
    return { ok: true, id: data?.id ?? "" };
  } catch {
    return { ok: false, error: "根拠の追加に失敗しました" };
  }
}

export async function rejectEntry(entryId: string, accountId: string, reason: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabase();

  try {
    const { error: updateError } = await supabase
      .from("entries")
      .update({ status: "rejected" })
      .eq("id", entryId);
    if (updateError) throw updateError;

    if (reason.trim()) {
      const { error: evidenceError } = await supabase.from("evidences").insert({
        account_id: accountId,
        moderator_id: moderator.id,
        content: reason.trim(),
      });
      if (evidenceError) throw evidenceError;
    }

    const { error: activityError } = await supabase.from("activities").insert({
      account_id: accountId,
      moderator_id: moderator.id,
      action: "reject",
    });
    if (activityError) throw activityError;
  } catch {
    return { ok: false, error: "却下に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}
