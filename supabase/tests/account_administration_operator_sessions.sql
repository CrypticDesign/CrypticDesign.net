\set ON_ERROR_STOP on

begin;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'active-operator@example.test', '', statement_timestamp(),
    '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()
  ),
  (
    '00000000-0000-4000-8000-000000000502',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'disabled-operator@example.test', '', statement_timestamp(),
    '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()
  ),
  (
    '00000000-0000-4000-8000-000000000503',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'capability-free-operator@example.test', '', statement_timestamp(),
    '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()
  ),
  (
    '00000000-0000-4000-8000-000000000504',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'inspection-target@example.test', '', statement_timestamp(),
    '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()
  ),
  (
    '00000000-0000-4000-8000-000000000505',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'other-target@example.test', '', statement_timestamp(),
    '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()
  );

insert into public.operator_principals (
  account_id, status, capabilities, added_by
) values
  (
    '00000000-0000-4000-8000-000000000501', 'active', array['account:inspect'],
    '00000000-0000-4000-8000-000000000501'
  ),
  (
    '00000000-0000-4000-8000-000000000502', 'disabled', array['account:inspect'],
    '00000000-0000-4000-8000-000000000501'
  ),
  (
    '00000000-0000-4000-8000-000000000503', 'active', '{}',
    '00000000-0000-4000-8000-000000000501'
  );

insert into public.characters (
  id, owner_account_id, kind, name, handle, archetype, provenance
) values (
  '00000000-0000-4000-8000-000000000701',
  '00000000-0000-4000-8000-000000000504',
  'member', 'Inspection Target', 'inspection-target', 'Builder', 'runtime-test'
);

do $$
declare
  v_issued_at timestamptz := statement_timestamp();
  v_revoked_at timestamptz;
begin
  if has_table_privilege('anon', 'public.operator_access_sessions', 'SELECT')
    or has_table_privilege('authenticated', 'public.operator_access_sessions', 'SELECT')
    or has_table_privilege('anon', 'public.operator_access_session_events', 'SELECT')
    or has_table_privilege('authenticated', 'public.operator_access_session_events', 'SELECT')
    or has_table_privilege('anon', 'public.account_administration_inspection_events', 'SELECT')
    or has_table_privilege('authenticated', 'public.account_administration_inspection_events', 'SELECT')
  then
    raise exception 'ordinary API roles can read operator administration records';
  end if;

  if not has_table_privilege('service_role', 'public.operator_access_sessions', 'SELECT')
    or not has_table_privilege('service_role', 'public.operator_access_session_events', 'SELECT')
    or not has_table_privilege('service_role', 'public.account_administration_inspection_events', 'SELECT')
  then
    raise exception 'service role cannot read operator administration records';
  end if;

  if has_table_privilege('service_role', 'public.operator_access_sessions', 'INSERT')
    or has_table_privilege('service_role', 'public.operator_access_sessions', 'UPDATE')
    or has_table_privilege('service_role', 'public.operator_access_sessions', 'DELETE')
    or has_table_privilege('service_role', 'public.operator_access_session_events', 'INSERT')
    or has_table_privilege('service_role', 'public.operator_access_session_events', 'UPDATE')
    or has_table_privilege('service_role', 'public.operator_access_session_events', 'DELETE')
  then
    raise exception 'service role can bypass the operator session RPC boundary';
  end if;

  if has_function_privilege(
      'anon',
      'public.create_operator_access_session(uuid,text,uuid,text,timestamptz,timestamptz,timestamptz,text)',
      'EXECUTE'
    )
    or has_function_privilege(
      'authenticated',
      'public.create_operator_access_session(uuid,text,uuid,text,timestamptz,timestamptz,timestamptz,text)',
      'EXECUTE'
    )
    or not has_function_privilege(
      'service_role',
      'public.create_operator_access_session(uuid,text,uuid,text,timestamptz,timestamptz,timestamptz,text)',
      'EXECUTE'
    )
    or has_function_privilege(
      'anon',
      'public.revoke_operator_access_session(uuid,uuid,timestamptz)',
      'EXECUTE'
    )
    or has_function_privilege(
      'authenticated',
      'public.revoke_operator_access_session(uuid,uuid,timestamptz)',
      'EXECUTE'
    )
    or not has_function_privilege(
      'service_role',
      'public.revoke_operator_access_session(uuid,uuid,timestamptz)',
      'EXECUTE'
    )
    or has_function_privilege(
      'anon',
      'public.record_account_administration_inspection(uuid,uuid,uuid,uuid)',
      'EXECUTE'
    )
    or has_function_privilege(
      'authenticated',
      'public.record_account_administration_inspection(uuid,uuid,uuid,uuid)',
      'EXECUTE'
    )
    or not has_function_privilege(
      'service_role',
      'public.record_account_administration_inspection(uuid,uuid,uuid,uuid)',
      'EXECUTE'
    )
  then
    raise exception 'operator administration function grants are incorrect';
  end if;

  perform public.record_account_administration_inspection(
    '00000000-0000-4000-8000-000000000801',
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-4000-8000-000000000504',
    '00000000-0000-4000-8000-000000000701'
  );

  if (select count(*) from public.account_administration_inspection_events
      where inspection_id = '00000000-0000-4000-8000-000000000801'
        and operator_account_id = '00000000-0000-4000-8000-000000000501'
        and target_account_id = '00000000-0000-4000-8000-000000000504'
        and target_character_id = '00000000-0000-4000-8000-000000000701') <> 1
  then
    raise exception 'authorized account and Character inspection was not recorded';
  end if;

  begin
    perform public.record_account_administration_inspection(
      '00000000-0000-4000-8000-000000000802',
      '00000000-0000-4000-8000-000000000502',
      '00000000-0000-4000-8000-000000000504',
      '00000000-0000-4000-8000-000000000701'
    );
    raise exception 'disabled operator unexpectedly recorded an inspection';
  exception when others then
    if sqlerrm = 'disabled operator unexpectedly recorded an inspection' then raise; end if;
    if sqlerrm <> 'Account inspection audit authorization denied' then
      raise exception 'disabled inspection failed for the wrong reason: %', sqlerrm;
    end if;
  end;

  begin
    perform public.record_account_administration_inspection(
      '00000000-0000-4000-8000-000000000803',
      '00000000-0000-4000-8000-000000000503',
      '00000000-0000-4000-8000-000000000504',
      '00000000-0000-4000-8000-000000000701'
    );
    raise exception 'capability-free operator unexpectedly recorded an inspection';
  exception when others then
    if sqlerrm = 'capability-free operator unexpectedly recorded an inspection' then raise; end if;
    if sqlerrm <> 'Account inspection audit authorization denied' then
      raise exception 'capability-free inspection failed for the wrong reason: %', sqlerrm;
    end if;
  end;

  begin
    perform public.record_account_administration_inspection(
      '00000000-0000-4000-8000-000000000804',
      '00000000-0000-4000-8000-000000000501',
      '00000000-0000-4000-8000-000000000505',
      '00000000-0000-4000-8000-000000000701'
    );
    raise exception 'mismatched Character ownership unexpectedly recorded an inspection';
  exception when others then
    if sqlerrm = 'mismatched Character ownership unexpectedly recorded an inspection' then raise; end if;
    if sqlerrm <> 'Account inspection audit target mismatch' then
      raise exception 'mismatched inspection failed for the wrong reason: %', sqlerrm;
    end if;
  end;

  begin
    update public.account_administration_inspection_events
    set projection = 'account_administration_summary_v1'
    where inspection_id = '00000000-0000-4000-8000-000000000801';
    raise exception 'inspection audit event update unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'inspection audit event update unexpectedly succeeded' then raise; end if;
    if sqlerrm <> 'Account administration inspection audit events are immutable' then
      raise exception 'inspection audit update failed for the wrong reason: %', sqlerrm;
    end if;
  end;

  begin
    delete from public.account_administration_inspection_events
    where inspection_id = '00000000-0000-4000-8000-000000000801';
    raise exception 'inspection audit event delete unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'inspection audit event delete unexpectedly succeeded' then raise; end if;
    if sqlerrm <> 'Account administration inspection audit events are immutable' then
      raise exception 'inspection audit delete failed for the wrong reason: %', sqlerrm;
    end if;
  end;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'operator_access_sessions'
      and column_name in ('token', 'raw_token', 'auth_session_reference')
  ) or not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'operator_access_sessions'
      and column_name = 'token_digest'
  ) or not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'operator_access_sessions'
      and column_name = 'auth_session_reference_digest'
  ) then
    raise exception 'operator session storage is not digest-only';
  end if;

  perform public.create_operator_access_session(
    '00000000-0000-4000-8000-000000000601', repeat('a', 64),
    '00000000-0000-4000-8000-000000000501', repeat('b', 64),
    v_issued_at, v_issued_at, v_issued_at + interval '10 minutes', 'account:inspect'
  );

  if (select count(*) from public.operator_access_sessions
      where id = '00000000-0000-4000-8000-000000000601'
        and token_digest = repeat('a', 64)
        and auth_session_reference_digest = repeat('b', 64)
        and revoked_at is null) <> 1
    or (select count(*) from public.operator_access_session_events
        where session_id = '00000000-0000-4000-8000-000000000601'
          and event_type = 'issued'
          and reason_code = 'OPERATOR_SESSION_ISSUED') <> 1
  then
    raise exception 'active capable operator session was not issued atomically';
  end if;

  begin
    perform public.create_operator_access_session(
      '00000000-0000-4000-8000-000000000602', repeat('a', 64),
      '00000000-0000-4000-8000-000000000501', repeat('c', 64),
      v_issued_at, v_issued_at, v_issued_at + interval '10 minutes', 'account:inspect'
    );
    raise exception 'duplicate token digest unexpectedly succeeded';
  exception
    when unique_violation then null;
    when others then
      if sqlerrm = 'duplicate token digest unexpectedly succeeded' then raise; end if;
      raise exception 'duplicate token failed for the wrong reason: %', sqlerrm;
  end;

  begin
    perform public.create_operator_access_session(
      '00000000-0000-4000-8000-000000000603', repeat('d', 64),
      '00000000-0000-4000-8000-000000000502', repeat('e', 64),
      v_issued_at, v_issued_at, v_issued_at + interval '10 minutes', 'account:inspect'
    );
    raise exception 'disabled operator unexpectedly received a session';
  exception when others then
    if sqlerrm = 'disabled operator unexpectedly received a session' then raise; end if;
    if sqlerrm <> 'Operator access session issuance denied' then
      raise exception 'disabled operator failed for the wrong reason: %', sqlerrm;
    end if;
  end;

  begin
    perform public.create_operator_access_session(
      '00000000-0000-4000-8000-000000000604', repeat('f', 64),
      '00000000-0000-4000-8000-000000000503', repeat('0', 64),
      v_issued_at, v_issued_at, v_issued_at + interval '10 minutes', 'account:inspect'
    );
    raise exception 'capability-free operator unexpectedly received a session';
  exception when others then
    if sqlerrm = 'capability-free operator unexpectedly received a session' then raise; end if;
    if sqlerrm <> 'Operator access session issuance denied' then
      raise exception 'capability-free operator failed for the wrong reason: %', sqlerrm;
    end if;
  end;

  begin
    perform public.create_operator_access_session(
      '00000000-0000-4000-8000-000000000605', repeat('1', 64),
      '00000000-0000-4000-8000-000000000501', repeat('2', 64),
      v_issued_at, v_issued_at, v_issued_at + interval '15 minutes 1 second', 'account:inspect'
    );
    raise exception 'overlong operator session unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'overlong operator session unexpectedly succeeded' then raise; end if;
    if sqlerrm <> 'Operator access session issuance denied' then
      raise exception 'overlong session failed for the wrong reason: %', sqlerrm;
    end if;
  end;

  v_revoked_at := public.revoke_operator_access_session(
    '00000000-0000-4000-8000-000000000601',
    '00000000-0000-4000-8000-000000000501',
    statement_timestamp()
  );

  if v_revoked_at is null
    or (select revoked_at from public.operator_access_sessions
        where id = '00000000-0000-4000-8000-000000000601') is null
    or (select count(*) from public.operator_access_session_events
        where session_id = '00000000-0000-4000-8000-000000000601'
          and event_type = 'revoked'
          and reason_code = 'OPERATOR_SESSION_REVOKED') <> 1
  then
    raise exception 'operator session revocation was not applied atomically';
  end if;

  perform public.revoke_operator_access_session(
    '00000000-0000-4000-8000-000000000601',
    '00000000-0000-4000-8000-000000000501',
    statement_timestamp()
  );

  if (select count(*) from public.operator_access_session_events
      where session_id = '00000000-0000-4000-8000-000000000601'
        and event_type = 'revoked') <> 1
  then
    raise exception 'idempotent revocation created a duplicate event';
  end if;

  begin
    update public.operator_access_session_events
    set reason_code = 'OPERATOR_SESSION_REVOKED'
    where session_id = '00000000-0000-4000-8000-000000000601'
      and event_type = 'issued';
    raise exception 'operator session audit event update unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'operator session audit event update unexpectedly succeeded' then raise; end if;
    if sqlerrm <> 'Operator access session events are immutable' then
      raise exception 'audit event update failed for the wrong reason: %', sqlerrm;
    end if;
  end;

  begin
    delete from public.operator_access_session_events
    where session_id = '00000000-0000-4000-8000-000000000601'
      and event_type = 'revoked';
    raise exception 'operator session audit event delete unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'operator session audit event delete unexpectedly succeeded' then raise; end if;
    if sqlerrm <> 'Operator access session events are immutable' then
      raise exception 'audit event delete failed for the wrong reason: %', sqlerrm;
    end if;
  end;
end;
$$;

rollback;

select 'account administration runtime checks passed' as result;
