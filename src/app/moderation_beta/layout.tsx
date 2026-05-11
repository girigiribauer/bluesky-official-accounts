import { GlobalFooter } from "src/components/GlobalFooter";
import { GlobalHeaderServer } from "src/components/GlobalHeaderServer";
import { ModerationLogin } from "src/components/ModerationLogin";
import { Dashboard } from "src/components/ModerationDashboard";
import { ModalProvider } from "src/components/ModalProvider";
import { ModalContents } from "src/components/ModalContents";
import { getCurrentModerator } from "src/lib/auth";
import { getSupabaseClient } from "src/lib/supabaseClient";
import type { ReviewSubmission, RequestSubmission, Activity, FieldMembership, Classification } from "src/types/moderation";

async function getPendingEntrySubmissions(): Promise<ReviewSubmission[]> {
  const { data } = await getSupabaseClient()
    .from("entry_submissions")
    .select("*, classifications(id, name)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ReviewSubmission[];
}

async function getPendingRequestSubmissions(): Promise<RequestSubmission[]> {
  const { data } = await getSupabaseClient()
    .from("request_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as RequestSubmission[];
}

async function getRecentActivities(): Promise<Activity[]> {
  const { data } = await getSupabaseClient()
    .from("activities")
    .select("id, action, created_at, payload, moderators(handle, display_name)")
    .in("action", ["approve", "reject"])
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []) as Activity[];
}

async function getModeratorReviewFieldIds(moderatorId: string): Promise<(string | null)[]> {
  const { data } = await getSupabaseClient()
    .from("activities")
    .select("payload")
    .eq("moderator_id", moderatorId)
    .in("action", ["approve", "reject"]);
  return (data ?? []).map((a) => {
    const payload = a.payload as { field_id?: string } | null;
    return payload?.field_id ?? null;
  });
}

async function getFieldMemberships(): Promise<FieldMembership[]> {
  const { data } = await getSupabaseClient()
    .from("field_memberships")
    .select("moderator_id, field_id, moderators!inner(is_admin)");
  return (data ?? []) as FieldMembership[];
}

async function getAdminCount(): Promise<number> {
  const { count } = await getSupabaseClient()
    .from("moderators")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", true);
  return count ?? 0;
}

async function getAllClassifications(): Promise<Classification[]> {
  const { data } = await getSupabaseClient()
    .from("classifications")
    .select("id, name, field_id");
  return (data ?? []) as Classification[];
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

  const [entrySubmissions, requestSubmissions, activities, moderatorReviewFieldIds, fieldMemberships, adminCount, classifications] =
    await Promise.all([
      getPendingEntrySubmissions(),
      getPendingRequestSubmissions(),
      getRecentActivities(),
      getModeratorReviewFieldIds(moderator.id),
      getFieldMemberships(),
      getAdminCount(),
      getAllClassifications(),
    ]);

  return (
    <ModalProvider>
      <div className="moderationMain">
        <header className="header">
          <GlobalHeaderServer />
        </header>
        <Dashboard
          entrySubmissions={entrySubmissions}
          requestSubmissions={requestSubmissions}
          moderator={moderator}
          activities={activities}
          moderatorReviewFieldIds={moderatorReviewFieldIds}
          fieldMemberships={fieldMemberships}
          adminCount={adminCount}
          postCount={0}
          classifications={classifications}
        />
        {children}
        <GlobalFooter />
        <ModalContents />
      </div>
    </ModalProvider>
  );
}
