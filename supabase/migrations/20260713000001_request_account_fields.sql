-- ---------------------------------------------------------------------------
-- 来て欲しい申請の承認時にも account_fields（分野の割り当て）を作る。
--
-- 表側（fetchAccountList）は分野・分類を account_fields からしか読まない。
-- これまで approve_request_submission は requests 行に field_id を書くだけで
-- account_fields を作っていなかったため、新規承認した来て欲しいアカウントは
-- 表側で「未分野」に落ちてしまう（既存データは初期移行時に account_fields が
-- 作られていたため表面化していなかった）。
--
-- 分類（classification_id）は来て欲しいでは割り当てないので null＝「未分類」のまま。
-- ---------------------------------------------------------------------------
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

  -- 表側は account_fields から分野を読むため、来て欲しいでも分野の割り当てを作る。
  -- 分類は未割り当て（null）＝「未分類」。
  insert into account_fields (account_id, field_id, classification_id)
  values (v_account_id, s.field_id, null);

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
