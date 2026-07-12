-- ---------------------------------------------------------------------------
-- 旧分類（old_category / old_categories）の廃止。
-- 表側の表示・fetchスクリプト・公開フォームはすでに新分野・分類（fields/classifications）
-- ベースに切り替え済みで、old_category はどこからも読まれていない（書き込まれるだけの死んだ値）。
-- ここで参照元を断ってからカラム・テーブルを落とす。
-- ---------------------------------------------------------------------------

-- accounts.old_category を参照していたのはこの関数の新規作成分岐のみ。
-- （entry_submissions/request_submissions は select * のため、カラム削除だけで型・実装ともに追従できる）
create or replace function approve_entry_submission(
  p_submission_id uuid,
  p_moderator_id  uuid,
  p_twitter_handle text default null
) returns void
language plpgsql
as $$
declare
  s            entry_submissions%rowtype;
  v_account_id uuid;
  v_entry_id   uuid;
  v_entry_found boolean;
begin
  select * into s from entry_submissions where id = p_submission_id;
  if not found then
    raise exception 'entry_submission not found: %', p_submission_id;
  end if;

  select id, account_id into v_entry_id, v_account_id
  from entries where bluesky_did = s.bluesky_did;
  v_entry_found := found;

  if v_entry_found then
    -- 既存エントリーの更新
    update entries
      set bluesky_handle    = s.bluesky_handle,
          twitter_handle    = p_twitter_handle,
          transition_status = s.transition_status,
          updated_at        = now()
      where id = v_entry_id;

    update accounts set display_name = s.account_name where id = v_account_id;

    -- 同じ分野なら分類を更新、異なる分野なら account_fields を追加
    perform 1 from account_fields
      where account_id = v_account_id and field_id = s.field_id;
    if found then
      if s.classification_id is not null then
        update account_fields
          set classification_id = s.classification_id
          where account_id = v_account_id and field_id = s.field_id;
      end if;
    else
      insert into account_fields (account_id, field_id, classification_id)
      values (v_account_id, s.field_id, s.classification_id);
    end if;
  else
    -- 新規作成
    insert into accounts (display_name, submitted_by)
    values (s.account_name, null)
    returning id into v_account_id;

    insert into entries (account_id, bluesky_did, bluesky_handle, twitter_handle, transition_status, approved_at)
    values (v_account_id, s.bluesky_did, s.bluesky_handle, p_twitter_handle, s.transition_status, now());

    insert into account_fields (account_id, field_id, classification_id)
    values (v_account_id, s.field_id, s.classification_id);
  end if;

  if s.evidence is not null and btrim(s.evidence) <> '' then
    insert into evidences (account_id, moderator_id, content)
    values (v_account_id, p_moderator_id, btrim(s.evidence));
  end if;

  insert into activities (moderator_id, action, payload)
  values (
    p_moderator_id,
    'approve',
    jsonb_build_object(
      'account_id',   v_account_id,
      'display_name', s.account_name,
      'field_id',     s.field_id
    )
  );

  -- entry_submissions.request_id → requests の FK があるため、申請を先に削除する
  delete from entry_submissions where id = p_submission_id;

  if s.request_id is not null then
    delete from requests where id = s.request_id;
  end if;
end;
$$;

alter table accounts           drop column old_category;
alter table entry_submissions  drop column old_category;
alter table request_submissions drop column old_category;

drop table old_categories;
