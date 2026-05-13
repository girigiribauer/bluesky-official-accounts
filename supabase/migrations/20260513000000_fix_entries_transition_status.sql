-- entries の transition_status を整理する
-- 1. unverifiable → unknown に名称を戻す（未確認 unverified と紛らわしいため）
-- 2. not_migrated を entries から除外（来てほしいは requests テーブルで管理）
-- 3. unverified を check 制約に追加

-- データ更新（制約変更前に行う）
update entries set transition_status = 'unknown' where transition_status = 'unverifiable';
update entries set transition_status = 'unverified' where transition_status = 'not_migrated';

-- check 制約を更新
alter table entries drop constraint entries_transition_status_check;
alter table entries add constraint entries_transition_status_check
  check (transition_status in ('unverified', 'account_created', 'dual_active', 'migrated', 'unknown'));
