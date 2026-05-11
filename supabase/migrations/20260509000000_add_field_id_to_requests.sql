-- request_submissions と requests に field_id を追加する。
-- 既存レコードとの互換性のため nullable にする。

alter table request_submissions
  add column field_id text references fields(id);

alter table requests
  add column field_id text references fields(id);
