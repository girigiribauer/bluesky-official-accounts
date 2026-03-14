import { z } from "zod";

const twitterUrlPattern = /^https:\/\/(x|twitter)\.com\/[A-Za-z0-9_]{1,15}(\/.*)?$/;

export const requestContributionSchema = z.object({
  twitterUrl: z.string().min(1).max(150).regex(twitterUrlPattern),
  twitterName: z.string().min(1).max(100),
});

export type RequestContributionInput = z.infer<typeof requestContributionSchema>;
