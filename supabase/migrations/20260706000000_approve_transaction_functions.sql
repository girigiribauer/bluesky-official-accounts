-- ---------------------------------------------------------------------------
-- 承認処理をトランザクション化する。
-- これまで承認は複数の insert/delete を非トランザクションで順次実行しており、
-- 途中失敗で「entry の無い account」等の中途半端な状態が残りうる（postmortem 型）。
-- 一連を関数に閉じ込め（＝1トランザクション）、supabase.rpc() から1回で呼ぶ。
--
-- URL パース等の純粋ロジックは TS 側に残し、関数には解決済みの値を渡す。
-- ---------------------------------------------------------------------------

-- 登録申請の承認。
-- DID が既登録なら更新、未登録なら新規作成。来て欲しいリストに紐付いていれば削除。
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
    insert into accounts (display_name, old_category, submitted_by)
    values (s.account_name, s.old_category, null)
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

-- 来て欲しいアカウント申請の承認。
create or replace function approve_request_submission(
  p_submission_id uuid,
  p_moderator_id  uuid
) returns void
language plpgsql
as $$
declare
  s            request_submissions%rowtype;
  v_account_id uuid;
begin
  select * into s from request_submissions where id = p_submission_id;
  if not found then
    raise exception 'request_submission not found: %', p_submission_id;
  end if;

  insert into accounts (display_name, submitted_by)
  values (s.display_name, null)
  returning id into v_account_id;

  insert into requests (account_id, twitter_handle, field_id)
  values (v_account_id, s.twitter_handle, s.field_id);

  insert into activities (moderator_id, action, payload)
  values (
    p_moderator_id,
    'approve',
    jsonb_build_object(
      'account_id',   v_account_id,
      'display_name', s.display_name,
      'field_id',     s.field_id
    )
  );

  delete from request_submissions where id = p_submission_id;
end;
$$;
