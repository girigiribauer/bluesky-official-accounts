import { z } from "zod";

// DB の CHECK 制約と合わせる
export const TRANSITION_STATUSES = [
  "not_migrated",
  "account_created",
  "dual_active",
  "migrated",
  "unverifiable",
] as const;

export const updateEntryNameSchema = z.object({
  name: z.string().trim().min(1, "アカウント名を入力してください").max(200),
});

export const updateEntryTwitterHandleSchema = z.object({
  handle: z.string().trim().max(200),
});

export const updateEntryBlueskyHandleSchema = z.object({
  handle: z.string().trim().min(1, "Bluesky ハンドルを入力してください").max(200),
});

export const updateEntryStatusSchema = z.object({
  status: z.enum(TRANSITION_STATUSES, { error: "ステータスを選択してください" }),
});

export const setEntryClassificationSchema = z.object({
  // 空文字は「未分類に戻す」を意味する
  classificationId: z.union([z.uuid("入力値が不正です"), z.literal("")]),
});

export const updateSubmissionTwitterUrlSchema = z.object({
  url: z.string().trim().refine(
    (v) => v === "" || /^https?:\/\/(x|twitter)\.com\/[A-Za-z0-9_]{1,15}(\/.*)?$/.test(v),
    "Twitter/X のURLを入力してください"
  ),
});

export const addEvidenceSchema = z.object({
  content: z.string().trim().min(1, "根拠を入力してください").max(2000),
});
