-- activities.account_id を削除し、payload に寄せる。
-- 操作ログをアカウント以外のエンティティ（申請など）にも記録できるようにする。
alter table activities drop column account_id;
