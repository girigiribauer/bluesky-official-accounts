import { redirect } from "next/navigation";
import { RequestReviewBottomSheet } from "src/components/RequestReviewBottomSheet";
import { getCurrentModerator } from "src/lib/auth";
import { getSupabaseClient } from "src/lib/supabaseClient";
import type { RequestSubmission } from "src/types/moderation";

async function getSubmission(id: string): Promise<RequestSubmission | null> {
  const { data } = await getSupabaseClient()
    .from("request_submissions")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}

export default async function RequestReviewPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const [submission, moderator] = await Promise.all([
    getSubmission(params.id),
    getCurrentModerator(),
  ]);
  if (!submission || !moderator) redirect("/moderation_beta");

  return <RequestReviewBottomSheet submission={submission} />;
}
