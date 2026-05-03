import type { TRANSITION_STATUSES } from "src/lib/schemas/moderation";

// ---------------------------------------------------------------------------
// モデレーション画面で使う型定義（JOIN を含むクエリ結果型を含む）
// ---------------------------------------------------------------------------

export type TransitionStatus = (typeof TRANSITION_STATUSES)[number];

export type ActivityAction = "migrate" | "approve" | "reject" | "edit" | "promote";

export type ReviewSubmission = {
  id: string;
  account_name: string;
  bluesky_did: string;
  bluesky_handle: string;
  twitter_url: string | null;
  old_category: string | null;
  field_id: string;
  transition_status: TransitionStatus;
  evidence: string | null;
  classification_id: string | null;
  request_id: string | null;
  created_at: string;
  classifications: { id: string; name: string } | null;
};

export type RequestSubmission = {
  id: string;
  display_name: string;
  twitter_handle: string;
  created_at: string;
};

export type Classification = {
  id: string;
  name: string;
  field_id: string;
};

export type Activity = {
  id: string;
  action: ActivityAction;
  created_at: string;
  moderators: { handle: string; display_name: string } | null;
  accounts: { display_name: string } | null;
};

export type FieldMembership = {
  moderator_id: string;
  field_id: string;
  moderators: { is_admin: boolean } | null;
};
