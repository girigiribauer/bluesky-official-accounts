-- field_id なしの来て欲しい申請は新フォームで再申請してもらう
delete from request_submissions where field_id is null;

alter table request_submissions
  alter column field_id set not null;
