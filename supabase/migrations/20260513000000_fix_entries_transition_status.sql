-- entries の transition_status を整理する
-- 1. unverifiable → unknown に名称を戻す（未確認 unverified と紛らわしいため）
-- 2. not_migrated を entries から除外（来てほしいは requests テーブルで管理）
-- 3. unverified を check 制約に追加

-- check 制約を先に外す（UPDATE 時に旧制約が働くため）
alter table entries drop constraint entries_transition_status_check;

-- データ更新
update entries set transition_status = 'unknown' where transition_status = 'unverifiable';
update entries set transition_status = 'unverified' where transition_status = 'not_migrated';

-- 新しい check 制約を追加
alter table entries add constraint entries_transition_status_check
  check (transition_status in ('unverified', 'account_created', 'dual_active', 'migrated', 'unknown'));
