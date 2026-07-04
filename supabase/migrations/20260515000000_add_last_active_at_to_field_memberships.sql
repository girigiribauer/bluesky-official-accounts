-- ---------------------------------------------------------------------------
-- field_memberships に last_active_at を追加。
-- モデレーターが分野を切り替えた際に更新し、ログイン時のデフォルト表示分野の判定に使う。
-- 既存レコードは joined_at で初期化する。
-- ---------------------------------------------------------------------------
alter table field_memberships
  add column last_active_at timestamptz;

update field_memberships set last_active_at = joined_at;

alter table field_memberships
  alter column last_active_at set not null,
  alter column last_active_at set default now();
