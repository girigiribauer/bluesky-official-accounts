// ---------------------------------------------------------------------------
// DB モデルに対応する型定義
// ---------------------------------------------------------------------------

export type Evidence = {
  id: string;
  content: string;
  created_at: string | null;
  moderators: { handle: string; display_name: string } | null;
};

export type AccountField = {
  id: string;
  field_id: string;
  classification_id: string | null;
  classifications: { id: string; name: string } | null;
};

export type ReviewEntry = {
  id: string;
  account_id: string;
  accounts: {
    display_name: string;
    evidences: Evidence[];
    account_fields: AccountField[];
  };
  bluesky_handle: string;
  twitter_handle: string | null;
  transition_status: string;
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
  accounts: { display_name: string } | null;
};

export type FieldMembership = {
  moderator_id: string;
  field_id: string;
  moderators: { is_admin: boolean } | null;
};
