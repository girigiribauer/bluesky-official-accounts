// ---------------------------------------------------------------------------
// DB モデルに対応する型定義
// ---------------------------------------------------------------------------

export type Evidence = {
  id: string;
  content: string;
  created_at: string | null;
  moderators: { handle: string; display_name: string } | null;
};

export type EntryField = {
  id: string;
  field_id: string;
  classification_id: string | null;
  classifications: { id: string; name: string } | null;
};

export type ReviewEntry = {
  id: string;
  display_name: string;
  bluesky_handle: string;
  twitter_handle: string | null;
  transition_status: string;
  evidences: Evidence[];
  entry_fields: EntryField[];
};

export type Classification = {
  id: string;
  name: string;
  field_id: string;
};

export type Activity = {
  id: string;
  action: string;
  created_at: string;
  moderators: { handle: string; display_name: string } | null;
  entries: { display_name: string } | null;
};

export type FieldMembership = {
  moderator_id: string;
  field_id: string;
  moderators: { is_admin: boolean } | null;
};
