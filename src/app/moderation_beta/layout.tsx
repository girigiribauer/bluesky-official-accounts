import { createClient } from "@supabase/supabase-js";
import { GlobalFooter } from "src/components/GlobalFooter";
import { GlobalHeaderServer } from "src/components/GlobalHeaderServer";
import { ModerationLogin } from "src/components/ModerationLogin";
import { Dashboard } from "src/components/ModerationDashboard";
import { ModalProvider } from "src/components/ModalProvider";
import { ModalContents } from "src/components/ModalContents";
import { getCurrentModerator } from "src/lib/auth";
import type { ReviewEntry } from "src/types/moderation";

function getSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}


async function getPendingEntries(): Promise<ReviewEntry[]> {
  const { data } = await getSupabase()
    .from("entries")
    .select("id, display_name, bluesky_handle, twitter_handle, transition_status, evidences(id, content, created_at, moderators(handle, display_name)), entry_fields(id, field_id, classification_id, classifications(id, name))")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ReviewEntry[];
}

async function getRecentActivities() {
  const { data } = await getSupabase()
    .from("activities")
    .select("id, action, created_at, moderators(handle, display_name), entries!left(display_name)")
    .in("action", ["approve", "reject"])
    .order("created_at", { ascending: false })
    .limit(10);
  return data ?? [];
}

async function getModeratorReviewFieldIds(moderatorId: string): Promise<(string | null)[]> {
  const { data } = await getSupabase()
    .from("activities")
    .select("entries!left(entry_fields!left(field_id))")
    .eq("moderator_id", moderatorId)
    .in("action", ["approve", "reject"]);
  return (data ?? []).map((a: any) => a.entries?.entry_fields?.[0]?.field_id ?? null);
}

async function getFieldMemberships(): Promise<{ moderator_id: string; field_id: string; moderators: { is_admin: boolean } | null }[]> {
  const { data } = await getSupabase()
    .from("field_memberships")
    .select("moderator_id, field_id, moderators!inner(is_admin)");
  return (data ?? []) as any;
}

async function getAdminCount(): Promise<number> {
  const { count } = await getSupabase()
    .from("moderators")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", true);
  return count ?? 0;
}

export default async function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const moderator = await getCurrentModerator();

  if (!moderator) {
    return (
      <div className="moderationMain">
        <header className="header">
          <GlobalHeaderServer />
        </header>
        <div className="mainContent">
          <ModerationLogin />
        </div>
        <GlobalFooter />
      </div>
    );
  }

  const [entries, activities, moderatorReviewFieldIds, fieldMemberships, adminCount] = await Promise.all([
    getPendingEntries(),
    getRecentActivities(),
    getModeratorReviewFieldIds(moderator.id),
    getFieldMemberships(),
    getAdminCount(),
  ]);

  return (
    <ModalProvider>
      <div className="moderationMain">
        <header className="header">
          <GlobalHeaderServer />
        </header>
        <Dashboard
          entries={entries}
          moderator={moderator}
          activities={activities as any}
          moderatorReviewFieldIds={moderatorReviewFieldIds}
          fieldMemberships={fieldMemberships}
          adminCount={adminCount}
          postCount={0}
        />
        {children}
        <GlobalFooter />
        <ModalContents />
      </div>
    </ModalProvider>
  );
}
