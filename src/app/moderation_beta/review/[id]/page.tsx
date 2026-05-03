import { redirect } from "next/navigation";
import { ReviewBottomSheet } from "src/components/ReviewBottomSheet";
import { getCurrentModerator } from "src/lib/auth";
import { getSupabaseClient } from "src/lib/supabaseClient";
import type { ReviewSubmission, Classification } from "src/types/moderation";

async function getSubmission(id: string): Promise<ReviewSubmission | null> {
  const { data } = await getSupabaseClient()
    .from("entry_submissions")
    .select("*, classifications(id, name)")
    .eq("id", id)
    .single();
  return (data ?? null) as unknown as ReviewSubmission | null;
}

async function getClassificationsForField(fieldId: string): Promise<Classification[]> {
  const { data } = await getSupabaseClient()
    .from("classifications")
    .select("id, name, field_id")
    .eq("field_id", fieldId);
  return (data ?? []) as Classification[];
}

export default async function ReviewPage(
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

  const classifications = await getClassificationsForField(submission.field_id);

  return (
    <ReviewBottomSheet
      submission={submission}
      classifications={classifications}
    />
  );
}
