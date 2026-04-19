import { createClient } from "@supabase/supabase-js";
import { GlobalFooter } from "src/components/GlobalFooter";
import { GlobalHeaderServer } from "src/components/GlobalHeaderServer";
import { ModerationLogin } from "src/components/ModerationLogin";
import { Dashboard } from "src/components/ModerationDashboard";
import { ModalProvider } from "src/components/ModalProvider";
import { ModalContents } from "src/components/ModalContents";
import { getCurrentModerator } from "src/lib/auth";
import type { Database } from "src/types/database";
import type { ReviewEntry, Activity, FieldMembership } from "src/types/moderation";

function getSupabase() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
}

async function getPendingEntries(): Promise<ReviewEntry[]> {
  const { data } = await getSupabase()
    .from("entries")
    .select("id, account_id, bluesky_handle, twitter_handle, transition_status, accounts(display_name, evidences(id, content, created_at, moderators(handle, display_name)), account_fields(id, field_id, classification_id, classifications(id, name)))")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  // Supabase の join 型は accounts を nullable に推論するが、
  // entries が存在する限り accounts は必ず存在する。ReviewEntry に合わせてキャスト。
  return (data ?? []) as unknown as ReviewEntry[];
}

async function getRecentActivities(): Promise<Activity[]> {
  const { data } = await getSupabase()
    .from("activities")
    .select("id, action, created_at, moderators(handle, display_name), accounts(display_name)")
    .in("action", ["approve", "reject"])
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []) as Activity[];
}

async function getModeratorReviewFieldIds(moderatorId: string): Promise<(string | null)[]> {
  const { data } = await getSupabase()
    .from("activities")
    .select("accounts!left(account_fields!left(field_id))")
    .eq("moderator_id", moderatorId)
    .in("action", ["approve", "reject"]);
  return (data ?? []).map((a) => {
    const accounts = a.accounts as { account_fields: { field_id: string }[] } | null;
    return accounts?.account_fields?.[0]?.field_id ?? null;
  });
}

async function getFieldMemberships(): Promise<FieldMembership[]> {
  const { data } = await getSupabase()
    .from("field_memberships")
    .select("moderator_id, field_id, moderators!inner(is_admin)");
  return (data ?? []) as FieldMembership[];
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
          activities={activities}
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