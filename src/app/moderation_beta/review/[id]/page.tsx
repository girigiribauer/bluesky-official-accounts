import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { ReviewBottomSheet } from "src/components/ReviewBottomSheet";
import { getCurrentModerator } from "src/lib/auth";
import type { Database } from "src/types/database";
import type { ReviewEntry, Classification } from "src/types/moderation";

function getSupabase() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

async function getEntry(id: string): Promise<ReviewEntry | null> {
  const { data } = await getSupabase()
    .from("entries")
    .select("id, account_id, bluesky_handle, twitter_handle, transition_status, accounts(display_name, evidences(id, content, created_at, moderators(handle, display_name)), account_fields(id, field_id, classification_id, classifications(id, name)))")
    .eq("id", id)
    .eq("status", "pending")
    .single();
  return (data ?? null) as unknown as ReviewEntry | null;
}

async function getClassificationsForEntry(entry: ReviewEntry): Promise<Classification[]> {
  const fieldId = entry.accounts.account_fields[0]?.field_id;
  if (!fieldId) return [];
  const { data } = await getSupabase()
    .from("classifications")
    .select("id, name, field_id")
    .eq("field_id", fieldId)
    .is("deleted_at", null);
  return (data ?? []) as Classification[];
}

export default async function ReviewPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const [entry, moderator] = await Promise.all([getEntry(params.id), getCurrentModerator()]);
  if (!entry || !moderator) redirect("/moderation_beta");

  const classifications = await getClassificationsForEntry(entry);

  return <ReviewBottomSheet entry={entry} classifications={classifications} moderatorHandle={moderator.handle} />;
}
