import { redirect } from "next/navigation";
import { getCurrentModerator } from "src/lib/auth";
import { getSupabaseClient } from "src/lib/supabaseClient";
import { ModerationOnboarding } from "src/components/ModerationOnboarding";
import { joinField } from "../actions";

export default async function OnboardPage() {
  const moderator = await getCurrentModerator();
  if (!moderator) redirect("/moderation_beta");

  const { data: memberships } = await getSupabaseClient()
    .from("field_memberships")
    .select("field_id")
    .eq("moderator_id", moderator.id);

  const joinedFieldIds = (memberships ?? []).map((m) => m.field_id);

  return <ModerationOnboarding joinedFieldIds={joinedFieldIds} onJoin={joinField} />;
}
