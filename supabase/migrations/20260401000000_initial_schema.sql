-- ---------------------------------------------------------------------------
-- moderators
-- ---------------------------------------------------------------------------
create table moderators (
  id             uuid primary key default gen_random_uuid(),
  did            text not null unique,
  handle         text not null,
  display_name   text not null,
  avatar         text,
  is_admin       boolean not null default false,
  created_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- field_memberships
-- ---------------------------------------------------------------------------
create table field_memberships (
  id           uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references moderators(id),
  field_id     text not null,
  joined_at    timestamptz not null default now(),
  unique (moderator_id, field_id)
);

-- ---------------------------------------------------------------------------
-- classifications
-- 分野内の分類。削除は論理削除（deleted_at）で参照整合性を保つ。
-- ---------------------------------------------------------------------------
create table classifications (
  id         uuid primary key default gen_random_uuid(),
  field_id   text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- accounts
-- アカウント管理の共通親テーブル。Bluesky 未登録（requests）・登録済み（entries）
-- どちらも同一レコードとして扱う。Notion では同じレコードだったものに対応。
-- ---------------------------------------------------------------------------
create table accounts (
  id             uuid primary key default gen_random_uuid(),
  display_name   text not null,
  submitted_by   uuid references moderators(id),
  -- 移行期間中のみ使用。新分野・分類システムへの移行完了後に削除する。
  old_category   text,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- requests
-- 来て欲しいアカウント（Bluesky 未登録）。X(Twitter) の情報のみ持つ。
-- Bluesky アカウントが確認されたら entries に昇格し、このレコードは削除する。
-- ---------------------------------------------------------------------------
create table requests (
  id             uuid primary key default gen_random_uuid(),
  account_id     uuid not null references accounts(id),
  twitter_handle text not null unique
);

-- ---------------------------------------------------------------------------
-- entries
-- 登録済みアカウント（Bluesky 登録済み）。
--
-- transition_status の選択可能な値:
--   not_migrated   … 未確認（Blueskyアカウントの同一性が確認できていない）
--   account_created … アカウント作成済（投稿なし or 挨拶程度）
--   dual_active    … 両方運用中
--   migrated       … Bluesky 完全移行（X/Twitter 更新停止）
--   unverifiable   … 確認不能（モデレーションリスト等でブロックされ確認できない）
--
-- status の選択可能な値:
--   pending   … レビュー待ち
--   published … 公開済み
--   rejected  … 却下済み
-- ---------------------------------------------------------------------------
create table entries (
  id                uuid primary key default gen_random_uuid(),
  account_id        uuid not null references accounts(id),
  bluesky_did       text not null unique,
  bluesky_handle    text not null,
  twitter_handle    text,
  transition_status text not null check (transition_status in (
    'not_migrated', 'account_created', 'dual_active', 'migrated', 'unverifiable'
  )),
  status            text not null check (status in ('pending', 'published', 'rejected')),
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- account_fields
-- アカウントと分野・分類の紐付け。MVPでは1アカウント1分野。
-- requests・entries どちらからも参照される。
-- ---------------------------------------------------------------------------
create table account_fields (
  id                uuid primary key default gen_random_uuid(),
  account_id        uuid not null references accounts(id),
  field_id          text not null,
  classification_id uuid references classifications(id),
  unique (account_id, field_id)
);

-- ---------------------------------------------------------------------------
-- evidences
-- 根拠の記録。複数人が時系列で追記できる。
-- ---------------------------------------------------------------------------
create table evidences (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references accounts(id),
  moderator_id uuid references moderators(id),
  content      text not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- activities
-- 全操作の記録。action の選択可能な値:
--   migrate … データ移行時の自動インポート（Notion → Supabase）
--   approve … モデレーターによる承認（pending → published）
--   reject  … モデレーターによる却下（pending → rejected）
--   edit    … モデレーターによる編集
--   promote … request から entry への昇格（Bluesky アカウント確認済み）
-- ---------------------------------------------------------------------------
create table activities (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references accounts(id),
  moderator_id uuid references moderators(id),
  action       text not null check (action in ('migrate', 'approve', 'reject', 'edit', 'promote')),
  payload      jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- news
-- サイト全体のお知らせ。管理者が Supabase Studio または管理画面で更新する。
-- ---------------------------------------------------------------------------
create table news (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  published_at date not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- OAuth フロー用（内部利用）
-- ---------------------------------------------------------------------------
create table oauth_states (
  key        text primary key,
  value      jsonb not null,
  created_at timestamptz not null default now()
);

create table oauth_sessions (
  did        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- old_categories（旧 Notion 分類）
-- accounts.old_category と title で紐付ける移行期間用テーブル。
-- 新分野・分類システム（account_fields/classifications）への移行完了後に廃止予定。
-- ---------------------------------------------------------------------------
create table old_categories (
  id         uuid primary key,
  title      text not null unique,
  sort_order int  not null,
  criteria   text not null default '',
  created_at timestamptz not null default now()
);
