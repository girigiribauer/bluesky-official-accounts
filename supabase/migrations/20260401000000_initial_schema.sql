-- ---------------------------------------------------------------------------
-- moderators
-- モデレーションを行うユーザー。
-- ---------------------------------------------------------------------------
create table moderators (
  id             uuid        primary key default gen_random_uuid(),
  did            text        not null unique,
  handle         text        not null,
  display_name   text        not null,
  avatar         text,
  is_admin       boolean     not null default false,
  created_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- fields
-- 分野の静的マスター。2重管理のため field_id はコード定数と一致させる。
-- ---------------------------------------------------------------------------
create table fields (
  id         text primary key,
  label      text not null,
  sort_order int  not null
);

-- ---------------------------------------------------------------------------
-- field_memberships
-- モデレーターが参加している分野。複数所属可能。
-- ---------------------------------------------------------------------------
create table field_memberships (
  id           uuid        primary key default gen_random_uuid(),
  moderator_id uuid        not null references moderators(id),
  field_id     text        not null references fields(id),
  joined_at    timestamptz not null default now(),
  unique (moderator_id, field_id)
);

-- ---------------------------------------------------------------------------
-- classifications
-- 分野内の分類。削除時は所属アカウントを別分類に移動させてから物理削除する。
-- ---------------------------------------------------------------------------
create table classifications (
  id         uuid        primary key default gen_random_uuid(),
  field_id   text        not null references fields(id),
  name       text        not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- accounts
-- entries と requests の共通親テーブル。承認時に作成される。
-- ---------------------------------------------------------------------------
create table accounts (
  id           uuid        primary key default gen_random_uuid(),
  display_name text        not null,
  submitted_by uuid        references moderators(id),
  old_category text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- entries
-- 登録済みアカウントの公開リスト。承認済みのみ含む。
--
-- transition_status の選択可能な値:
--   not_migrated    … Notion 移行元の「未移行（未確認）」。X との同一性が未確認。新規申請では使用しない。
--   account_created … Bluesky 作成済みだが X も継続運用中。
--   dual_active     … X・Bluesky 両方を積極的に運用中。
--   migrated        … X を辞めて Bluesky に完全移行、または最初から Bluesky のみで運用。
--   unverifiable    … 確認不能。
-- ---------------------------------------------------------------------------
create table entries (
  id                uuid        primary key default gen_random_uuid(),
  account_id        uuid        not null references accounts(id),
  bluesky_did       text        not null unique,
  bluesky_handle    text        not null,
  twitter_handle    text,
  transition_status text        not null check (transition_status in (
    'not_migrated', 'account_created', 'dual_active', 'migrated', 'unverifiable'
  )),
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- requests
-- 来て欲しいアカウントのリスト。承認済みのみ含む。
-- 登録アカウントになったら削除される。
-- ---------------------------------------------------------------------------
create table requests (
  id             uuid        primary key default gen_random_uuid(),
  account_id     uuid        not null references accounts(id),
  twitter_handle text        not null unique,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- account_fields
-- アカウントと分野の紐付け。1アカウントが複数分野に属することができる。
-- ---------------------------------------------------------------------------
create table account_fields (
  id                uuid primary key default gen_random_uuid(),
  account_id        uuid not null references accounts(id),
  field_id          text not null references fields(id),
  classification_id uuid references classifications(id),
  unique (account_id, field_id)
);

-- ---------------------------------------------------------------------------
-- evidences
-- 根拠の記録。複数人が時系列で追記できる。
-- ---------------------------------------------------------------------------
create table evidences (
  id           uuid        primary key default gen_random_uuid(),
  account_id   uuid        not null references accounts(id),
  moderator_id uuid        references moderators(id),
  content      text        not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- activities
-- 全操作の記録。action の選択可能な値:
--   migrate … データ移行時の自動インポート（Notion → Supabase）。
--   approve … モデレーターによる承認。
--   reject  … モデレーターによる却下。
--   edit    … モデレーターによる編集。
--   promote … request から entry への昇格。
--
-- payload の構造（action ごと）:
--   migrate  {}
--   approve  {}
--   reject   {}
--   edit     {"display_name": {"before": "旧", "after": "新"}}  ※変更フィールドのみ含む
--   promote  {"request_id": "..."}
-- ---------------------------------------------------------------------------
create table activities (
  id           uuid        primary key default gen_random_uuid(),
  account_id   uuid        not null references accounts(id),
  moderator_id uuid        references moderators(id),
  action       text        not null check (action in (
    'migrate', 'approve', 'reject', 'edit', 'promote'
  )),
  payload      jsonb       not null default '{}',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- entry_submissions
-- 登録フォームから投稿された申請。モデレーション前の一時置き場。
-- 承認時に accounts + entries + account_fields を作成してこのレコードを削除する。
--
-- transition_status は新規申請で選択可能な値のみ（not_migrated / unverifiable は除く）。
-- 投稿時に twitter_url を requests テーブルと照合し、一致すれば request_id を記録する。
-- ---------------------------------------------------------------------------
create table entry_submissions (
  id                uuid        primary key default gen_random_uuid(),
  account_name      text        not null,
  bluesky_did       text        not null,
  bluesky_handle    text        not null,
  twitter_url       text,
  old_category      text,
  field_id          text        not null references fields(id),
  transition_status text        not null check (transition_status in (
    'account_created', 'dual_active', 'migrated'
  )),
  evidence          text,
  classification_id uuid        references classifications(id),
  request_id        uuid        references requests(id),
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- request_submissions
-- 来て欲しいフォームから投稿された申請。モデレーション前の一時置き場。
-- 承認時に accounts + requests を作成してこのレコードを削除する。
-- ---------------------------------------------------------------------------
create table request_submissions (
  id             uuid        primary key default gen_random_uuid(),
  display_name   text        not null,
  twitter_handle text        not null,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- news
-- サイト全体のお知らせ。
-- ---------------------------------------------------------------------------
create table news (
  id           uuid        primary key default gen_random_uuid(),
  title        text        not null,
  published_at date        not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- OAuth フロー用（内部利用）。
-- ---------------------------------------------------------------------------
create table oauth_states (
  key        text        primary key,
  value      jsonb       not null,
  created_at timestamptz not null default now()
);

create table oauth_sessions (
  did        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- old_categories（旧 Notion 分類）
-- accounts.old_category と title で紐付ける移行期間用テーブル。
-- ---------------------------------------------------------------------------
create table old_categories (
  id         uuid        primary key,
  title      text        not null unique,
  sort_order int         not null,
  criteria   text        not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- サーバーサイドはサービスロールキーで RLS をバイパスする。
-- 公開ポリシーは一般公開時に追加する。
-- ---------------------------------------------------------------------------
alter table moderators         enable row level security;
alter table fields             enable row level security;
alter table field_memberships  enable row level security;
alter table classifications    enable row level security;
alter table accounts           enable row level security;
alter table entries            enable row level security;
alter table requests           enable row level security;
alter table account_fields     enable row level security;
alter table evidences          enable row level security;
alter table activities         enable row level security;
alter table entry_submissions  enable row level security;
alter table request_submissions enable row level security;
alter table news               enable row level security;
alter table oauth_states       enable row level security;
alter table oauth_sessions     enable row level security;
alter table old_categories     enable row level security;
