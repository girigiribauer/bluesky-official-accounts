import { z } from "zod";
import { FIELD_ID_LABELS } from "src/constants/fields";

const twitterUrlPattern = /^https:\/\/(x|twitter)\.com\/[A-Za-z0-9_]{1,15}(\/.*)?$/;

const VALID_FIELD_IDS = Object.keys(FIELD_ID_LABELS) as [string, ...string[]];

export const requestContributionSchema = z.object({
  twitterUrl: z.string().trim().min(1).max(150).regex(twitterUrlPattern),
  twitterName: z.string().trim().min(1).max(100),
  oldCategory: z.string().trim().max(100).optional(),
  fieldId: z.enum(VALID_FIELD_IDS),
});

export type RequestContributionInput = z.infer<typeof requestContributionSchema>;
