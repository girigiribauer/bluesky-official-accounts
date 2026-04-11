-- ---------------------------------------------------------------------------
-- moderators
-- ---------------------------------------------------------------------------
create table moderators (
  id             uuid primary key default gen_random_uuid(),
  did            text not null unique,
  handle         text not null,
  display_name   text not null,
  is_admin       boolean not null default false,
  created_at     timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- field_memberships
-- ---------------------------------------------------------------------------
-- stage の選択可能な値:
--   novice … 入門（操作は即時反映されるが、一人前以上による後追いチェックの対象）
--   member … 一人前（自身の操作はチェック対象外。入門の後追いチェックを担う）
--   expert … 熟練（分類の新設・変更・削除、公開エントリーの編集など分野内の全権限）
create table field_memberships (
  id           uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references moderators(id),
  field_id     text not null,
  stage        text not null default 'novice' check (stage in ('novice', 'member', 'expert')),
  joined_at    timestamptz not null default now(),
  unique (moderator_id, field_id)
);

-- ---------------------------------------------------------------------------
-- classifications
-- 分野内の分類。熟練モデレーターのみ追加・変更・削除可能。
-- 削除は論理削除（deleted_at）で参照整合性を保つ。
-- ---------------------------------------------------------------------------
create table classifications (
  id         uuid primary key default gen_random_uuid(),
  field_id   text not null,
  name       text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- requests
-- 来て欲しいアカウント。X(Twitter) の情報のみ持つ。
-- entry_id が埋まったら登録済みになったことを示す。
-- ---------------------------------------------------------------------------
create table requests (
  id             uuid primary key default gen_random_uuid(),
  twitter_handle text not null unique,
  display_name   text not null,
  submitted_by   uuid references moderators(id),
  entry_id       uuid,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- entries
-- 登録済みアカウント。Bluesky・X(Twitter) 両方の情報を持つ。
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
  bluesky_did       text not null unique,
  bluesky_handle    text not null,
  twitter_handle    text,
  display_name      text not null,
  transition_status text not null check (transition_status in (
    'not_migrated', 'account_created', 'dual_active', 'migrated', 'unverifiable'
  )),
  status            text not null check (status in ('pending', 'published', 'rejected')),
  submitted_by      uuid references moderators(id),
  approved_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- 移行期間中のみ使用。表側の閲覧ページを Notion から Supabase に切り替える際に削除する。
  old_category      text
);

-- requests.entry_id → entries の循環参照を後から追加
alter table requests
  add constraint requests_entry_id_fkey
  foreign key (entry_id) references entries(id);

-- ---------------------------------------------------------------------------
-- entry_fields
-- エントリーと分野・分類の紐付け。MVPでは1エントリー1分野。
-- ---------------------------------------------------------------------------
create table entry_fields (
  id                uuid primary key default gen_random_uuid(),
  entry_id          uuid not null references entries(id),
  field_id          text not null,
  classification_id uuid references classifications(id),
  unique (entry_id, field_id)
);

-- ---------------------------------------------------------------------------
-- evidences
-- 根拠の記録。複数人が時系列で追記できる。
-- ---------------------------------------------------------------------------
create table evidences (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references entries(id),
  moderator_id uuid references moderators(id),
  content      text not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- activities
-- 全操作の記録。action の選択可能な値:
--   migrate … データ移行時の自動インポート
--   submit  … ユーザーからの新規投稿
--   approve … モデレーターによる承認
--   reject  … モデレーターによる却下
--   edit    … モデレーターによる編集
-- ---------------------------------------------------------------------------
create table activities (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references entries(id),
  moderator_id uuid references moderators(id),
  action       text not null check (action in ('migrate', 'submit', 'approve', 'reject', 'edit')),
  payload      jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- news
-- サイト全体のお知らせ。管理者が Supabase Studio または管理画面で更新する。
-- ---------------------------------------------------------------------------
create table news (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  published_at date not null,
  created_at timestamptz not null default now()
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
