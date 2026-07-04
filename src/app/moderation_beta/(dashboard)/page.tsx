import { redirect } from "next/navigation";
import { getCurrentModerator } from "src/lib/auth";
import { getSupabaseClient } from "src/lib/supabaseClient";

export default async function ModerationBetaPage({
  searchParams,
}: {
  searchParams: Promise<{ field?: string }>;
}) {
  const { field } = await searchParams;
  if (!field) {
    const moderator = await getCurrentModerator();
    if (moderator) {
      const { data } = await getSupabaseClient()
        .from("field_memberships")
        .select("field_id")
        .eq("moderator_id", moderator.id)
        .order("last_active_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.field_id) {
        redirect(`/moderation_beta?field=${encodeURIComponent(data.field_id)}`);
      }
    }
  }
  return null;
}
