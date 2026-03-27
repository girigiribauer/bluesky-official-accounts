import { z } from "zod";

export const MIGRATION_STATUSES = [
  "未移行（未確認）",
  "アカウント作成済",
  "両方運用中",
  "Bluesky 完全移行",
] as const;

const twitterUrlPattern = /^https:\/\/(x|twitter)\.com\/[A-Za-z0-9_]{1,15}(\/.*)?$/;

export const registerContributionSchema = z
  .object({
    did: z.string().min(1),
    handle: z.string().min(1),
    accountName: z.string().min(1).max(100),
    oldCategory: z.string().min(1).max(100),
    fields: z.array(z.string().min(1)).min(1).max(1),
    migrationStatus: z.enum(MIGRATION_STATUSES),
    twitterUrl: z.string().max(150).default(""),
    evidence: z.string().max(1000).default(""),
  })
  .refine(
    (d) => d.twitterUrl.trim().length > 0,
    { message: "X(Twitter) URLは必須です" }
  )
  .refine(
    (d) =>
      d.migrationStatus === "未移行（未確認）" || d.evidence.trim().length > 0,
    { message: "根拠は必須です" }
  )
  .refine(
    (d) => !d.twitterUrl.trim() || twitterUrlPattern.test(d.twitterUrl.trim()),
    { message: "X(Twitter) URLの形式が正しくありません" }
  );

export type RegisterContributionInput = z.infer<typeof registerContributionSchema>;
