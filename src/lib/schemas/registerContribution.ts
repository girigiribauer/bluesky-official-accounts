import { z } from "zod";
import { FIELD_ID_LABELS } from "src/constants/contributionForm";

// transition_status の選択肢。値は DB に保存される英語値
export const MIGRATION_STATUSES = [
  "account_created",
  "dual_active",
  "migrated",
] as const;

const twitterUrlPattern = /^https:\/\/(x|twitter)\.com\/[A-Za-z0-9_]{1,15}(\/.*)?$/;

const VALID_FIELD_IDS = Object.keys(FIELD_ID_LABELS) as [string, ...string[]];

export const registerContributionSchema = z
  .object({
    did: z.string().min(1),
    handle: z.string().trim().min(1),
    accountName: z.string().trim().min(1).max(100),
    oldCategory: z.string().trim().min(1).max(100),
    fields: z.array(z.enum(VALID_FIELD_IDS)).min(1).max(1),
    migrationStatus: z.enum(MIGRATION_STATUSES),
    twitterUrl: z.string().trim().max(150).default(""),
    evidence: z.string().trim().max(1000).default(""),
  })
  .refine(
    (d) => d.twitterUrl.length > 0,
    { message: "X(Twitter) URLは必須です" }
  )
  .refine(
    (d) => d.evidence.length > 0,
    { message: "根拠は必須です" }
  )
  .refine(
    (d) => !d.twitterUrl || twitterUrlPattern.test(d.twitterUrl),
    { message: "X(Twitter) URLの形式が正しくありません" }
  );

export type RegisterContributionInput = z.infer<typeof registerContributionSchema>;
