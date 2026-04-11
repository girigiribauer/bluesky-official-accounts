"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getCurrentModerator, logout } from "src/lib/auth";
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
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function approveEntry(id: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabase();

  try {
    await supabase
      .from("entries")
      .update({ status: "published", approved_at: new Date().toISOString() })
      .eq("id", id);

    await supabase.from("activities").insert({
      entry_id: id,
      moderator_id: moderator.id,
      action: "approve",
    });
  } catch {
    return { ok: false, error: "承認に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}

async function updateEntryField(
  id: string,
  field: string,
  value: string
): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabase();
  try {
    await supabase
      .from("entries")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", id);
    await supabase.from("activities").insert({
      entry_id: id,
      moderator_id: moderator.id,
      action: "edit",
      payload: { field, value },
    });
  } catch {
    return { ok: false, error: "更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function updateEntryName(id: string, displayName: string): Promise<Result> {
  const parsed = updateEntryNameSchema.safeParse({ name: displayName });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "アカウント名を入力してください" };
  return updateEntryField(id, "display_name", parsed.data.name);
}

export async function updateEntryTwitterHandle(id: string, handle: string): Promise<Result> {
  const parsed = updateEntryTwitterHandleSchema.safeParse({ handle });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };
  return updateEntryField(id, "twitter_handle", parsed.data.handle);
}

export async function updateEntryStatus(id: string, status: string): Promise<Result> {
  const parsed = updateEntryStatusSchema.safeParse({ status });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ステータスを選択してください" };
  return updateEntryField(id, "transition_status", parsed.data.status);
}

export async function updateEntryBlueskyHandle(id: string, handle: string): Promise<Result> {
  const parsed = updateEntryBlueskyHandleSchema.safeParse({ handle });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Bluesky ハンドルを入力してください" };
  return updateEntryField(id, "bluesky_handle", parsed.data.handle);
}

export async function setEntryClassification(id: string, classificationId: string): Promise<Result> {
  const parsed = setEntryClassificationSchema.safeParse({ classificationId });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "入力値が不正です" };

  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabase();
  try {
    await supabase
      .from("entry_fields")
      .update({ classification_id: parsed.data.classificationId || null })
      .eq("entry_id", id);
    await supabase.from("activities").insert({
      entry_id: id,
      moderator_id: moderator.id,
      action: "edit",
      payload: { field: "classification_id", value: parsed.data.classificationId || null },
    });
  } catch {
    return { ok: false, error: "分類の更新に失敗しました" };
  }
  revalidatePath("/moderation_beta");
  return { ok: true };
}

export async function addEvidence(entryId: string, content: string): Promise<Result<{ id: string }>> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const parsed = addEvidenceSchema.safeParse({ content });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "根拠を入力してください" };

  const supabase = getSupabase();
  try {
    const { data } = await supabase
      .from("evidences")
      .insert({ entry_id: entryId, moderator_id: moderator.id, content: parsed.data.content })
      .select("id")
      .single();
    await supabase.from("activities").insert({
      entry_id: entryId,
      moderator_id: moderator.id,
      action: "edit",
      payload: { field: "evidence", value: parsed.data.content },
    });
    revalidatePath("/moderation_beta");
    return { ok: true, id: data?.id ?? "" };
  } catch {
    return { ok: false, error: "根拠の追加に失敗しました" };
  }
}

export async function rejectEntry(id: string, reason: string): Promise<Result> {
  const moderator = await getCurrentModerator();
  if (!moderator) return { ok: false, error: "ログインが必要です" };

  const supabase = getSupabase();

  try {
    await supabase.from("entries").update({ status: "rejected" }).eq("id", id);

    if (reason.trim()) {
      await supabase.from("evidences").insert({
        entry_id: id,
        moderator_id: moderator.id,
        content: reason.trim(),
      });
    }

    await supabase.from("activities").insert({
      entry_id: id,
      moderator_id: moderator.id,
      action: "reject",
    });
  } catch {
    return { ok: false, error: "却下に失敗しました" };
  }

  revalidatePath("/moderation_beta");
  return { ok: true };
}
