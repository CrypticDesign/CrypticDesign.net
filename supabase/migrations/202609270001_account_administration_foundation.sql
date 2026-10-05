-- CRY-400: default-deny operator registry and durable account-administration command audit.

create type public.operator_principal_status as enum ('disabled', 'active');
create type public.account_administration_action as enum (
  'suspend_account', 'restore_account', 'revoke_sessions',
  'suspend_character', 'restore_character'
);
create type public.account_administration_status as enum ('pending', 'succeeded', 'failed');

create table public.operator_principals (
  account_id uuid primary key references auth.users(id) on delete restrict,
  status public.operator_principal_status not null default 'disabled',
  capabilities text[] not null default '{}',
  added_by uuid not null references auth.users(id) on delete restrict,
  added_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check (capabilities <@ array[
    'account:inspect', 'account:suspend', 'account:restore', 'account:revoke_sessions',
    'character:suspend', 'character:restore', 'protected_targets:mutate'
  ]::text[])
);

create table public.protected_account_targets (
  account_id uuid primary key references auth.users(id) on delete restrict,
  reason text not null check (char_length(trim(reason)) between 12 and 500),
  added_by uuid not null references auth.users(id) on delete restrict,
  added_at timestamptz not null default statement_timestamp()
);

create table public.account_administration_commands (
  request_id text primary key check (request_id ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{15,127}$'),
  request_fingerprint text not null check (request_fingerprint ~ '^[a-f0-9]{64}$'),
  action public.account_administration_action not null,
  operator_account_id uuid not null references public.operator_principals(account_id) on delete restrict,
  target_account_id uuid not null references auth.users(id) on delete restrict,
  target_character_id uuid references public.characters(id) on delete restrict,
  reason text not null check (char_length(trim(reason)) between 12 and 500),
  status public.account_administration_status not null default 'pending',
  result_code text,
  requested_at timestamptz not null,
  reconciliation_started_at timestamptz,
  reconciliation_attempt_count integer not null default 0 check (reconciliation_attempt_count >= 0),
  completed_at timestamptz,
  check (
    (action in ('suspend_character', 'restore_character') and target_character_id is not null)
    or (action not in ('suspend_character', 'restore_character') and target_character_id is null)
  ),
  check (
    (status = 'pending' and result_code is null and completed_at is null)
    or (status <> 'pending' and result_code ~ '^[A-Z][A-Z0-9_]{2,63}$' and completed_at is not null)
  )
);

create table public.account_administration_events (
  id uuid primary key default gen_random_uuid(),
  command_request_id text not null references public.account_administration_commands(request_id) on delete restrict,
  event_type text not null check (event_type in ('claimed', 'reconciliation_started', 'succeeded', 'failed')),
  result_code text not null check (result_code ~ '^[A-Z][A-Z0-9_]{2,63}$'),
  attempt_number integer not null default 0 check (attempt_number >= 0),
  occurred_at timestamptz not null default statement_timestamp(),
  unique (command_request_id, event_type, attempt_number)
);

create table public.account_administration_inspection_events (
  inspection_id uuid primary key,
  operator_account_id uuid not null references public.operator_principals(account_id) on delete restrict,
  target_account_id uuid not null references auth.users(id) on delete restrict,
  target_character_id uuid references public.characters(id) on delete restrict,
  projection text not null default 'account_administration_summary_v1'
    check (projection = 'account_administration_summary_v1'),
  occurred_at timestamptz not null default statement_timestamp()
);

create function public.reject_account_administration_event_change()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'Account administration audit events are immutable';
end;
$$;

create trigger account_administration_events_immutable
before update or delete on public.account_administration_events
for each row execute function public.reject_account_administration_event_change();

create function public.reject_account_administration_inspection_event_change()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'Account administration inspection audit events are immutable';
end;
$$;

create trigger account_administration_inspection_events_immutable
before update or delete on public.account_administration_inspection_events
for each row execute function public.reject_account_administration_inspection_event_change();

alter table public.operator_principals enable row level security;
alter table public.protected_account_targets enable row level security;
alter table public.account_administration_commands enable row level security;
alter table public.account_administration_events enable row level security;
alter table public.account_administration_inspection_events enable row level security;

revoke all on public.operator_principals, public.protected_account_targets,
  public.account_administration_commands, public.account_administration_events,
  public.account_administration_inspection_events
from public, anon, authenticated, service_role;

grant select, insert, update, delete on public.operator_principals, public.protected_account_targets to service_role;
grant select on public.account_administration_commands, public.account_administration_events to service_role;
grant select on public.account_administration_inspection_events to service_role;

create function public.record_account_administration_inspection(
  p_inspection_id uuid,
  p_operator_account_id uuid,
  p_target_account_id uuid,
  p_target_character_id uuid
)
returns timestamptz
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_occurred_at timestamptz;
begin
  if not exists (
    select 1 from public.operator_principals o
    where o.account_id = p_operator_account_id
      and o.status = 'active'
      and 'account:inspect' = any(o.capabilities)
  ) or not exists (
    select 1 from auth.users u where u.id = p_target_account_id
  ) then
    raise exception 'Account inspection audit authorization denied';
  end if;

  if p_target_character_id is not null and not exists (
    select 1 from public.characters c
    where c.id = p_target_character_id
      and c.owner_account_id = p_target_account_id
      and c.kind = 'member'
  ) then
    raise exception 'Account inspection audit target mismatch';
  end if;

  insert into public.account_administration_inspection_events (
    inspection_id, operator_account_id, target_account_id, target_character_id
  ) values (
    p_inspection_id, p_operator_account_id, p_target_account_id, p_target_character_id
  ) returning occurred_at into v_occurred_at;
  return v_occurred_at;
end;
$$;

create function public.claim_account_administration_command(
  p_request_id text,
  p_request_fingerprint text,
  p_action public.account_administration_action,
  p_operator_account_id uuid,
  p_target_account_id uuid,
  p_target_character_id uuid,
  p_reason text,
  p_confirmation text,
  p_authenticated_at timestamptz
)
returns table (claim_kind text, command_status public.account_administration_status, command_result_code text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.account_administration_commands%rowtype;
  v_required_capability text;
  v_confirmation_target uuid;
  v_reconciliation_attempt integer;
begin
  v_required_capability := case p_action
    when 'suspend_account' then 'account:suspend'
    when 'restore_account' then 'account:restore'
    when 'revoke_sessions' then 'account:revoke_sessions'
    when 'suspend_character' then 'character:suspend'
    when 'restore_character' then 'character:restore'
  end;

  if p_request_id !~ '^[A-Za-z0-9][A-Za-z0-9:_-]{15,127}$'
    or p_request_fingerprint !~ '^[a-f0-9]{64}$'
    or char_length(trim(coalesce(p_reason, ''))) not between 12 and 500
    or p_authenticated_at > statement_timestamp() + interval '1 minute'
    or p_authenticated_at < statement_timestamp() - interval '15 minutes'
  then return query select 'denied', null::public.account_administration_status, null::text; return; end if;

  if not exists (
    select 1 from public.operator_principals o
    where o.account_id = p_operator_account_id
      and o.status = 'active'
      and v_required_capability = any(o.capabilities)
  ) then return query select 'denied', null::public.account_administration_status, null::text; return; end if;

  if p_operator_account_id = p_target_account_id
    or not exists (select 1 from auth.users u where u.id = p_target_account_id)
    or (
      exists (select 1 from public.protected_account_targets p where p.account_id = p_target_account_id)
      and not exists (
        select 1 from public.operator_principals o
        where o.account_id = p_operator_account_id and 'protected_targets:mutate' = any(o.capabilities)
      )
    )
  then return query select 'denied', null::public.account_administration_status, null::text; return; end if;

  if p_action in ('suspend_character', 'restore_character') then
    if p_target_character_id is null or not exists (
      select 1 from public.characters c
      where c.id = p_target_character_id and c.owner_account_id = p_target_account_id and c.kind = 'member'
    ) then return query select 'denied', null::public.account_administration_status, null::text; return; end if;
    v_confirmation_target := p_target_character_id;
  else
    if p_target_character_id is not null then return query select 'denied', null::public.account_administration_status, null::text; return; end if;
    v_confirmation_target := p_target_account_id;
  end if;

  if p_confirmation <> p_action::text || ':' || v_confirmation_target::text
  then return query select 'denied', null::public.account_administration_status, null::text; return; end if;

  -- Serialize commands for the same account so an older ambiguous Auth write
  -- can never be reconciled over a newer operator decision.
  perform pg_advisory_xact_lock(hashtextextended('account-administration:' || p_target_account_id::text, 0));

  select * into v_existing
  from public.account_administration_commands
  where request_id = p_request_id;

  if not found and exists (
    select 1 from public.account_administration_commands c
    where c.target_account_id = p_target_account_id and c.status = 'pending'
  ) then
    return query select 'target_busy', null::public.account_administration_status, null::text;
    return;
  end if;

  if not found then
    insert into public.account_administration_commands (
      request_id, request_fingerprint, action, operator_account_id, target_account_id,
      target_character_id, reason, requested_at
    ) values (
      p_request_id, p_request_fingerprint, p_action, p_operator_account_id, p_target_account_id,
      p_target_character_id, trim(p_reason), statement_timestamp()
    ) on conflict (request_id) do nothing;

    if found then
      insert into public.account_administration_events (command_request_id, event_type, result_code)
      values (p_request_id, 'claimed', 'OPERATOR_ACTION_CLAIMED');
      return query select 'claimed', 'pending'::public.account_administration_status, null::text;
      return;
    end if;

    select * into v_existing from public.account_administration_commands where request_id = p_request_id;
  end if;

  if v_existing.request_fingerprint <> p_request_fingerprint then
    return query select 'collision', v_existing.status, v_existing.result_code;
  elsif v_existing.status = 'pending' then
    if v_existing.action in ('suspend_account', 'restore_account')
      and v_existing.requested_at <= statement_timestamp() - interval '2 minutes'
      and (
        v_existing.reconciliation_started_at is null
        or v_existing.reconciliation_started_at <= statement_timestamp() - interval '2 minutes'
      )
    then
      update public.account_administration_commands
      set reconciliation_started_at = statement_timestamp(),
          reconciliation_attempt_count = reconciliation_attempt_count + 1
      where request_id = p_request_id and status = 'pending'
      returning reconciliation_attempt_count into v_reconciliation_attempt;
      insert into public.account_administration_events (command_request_id, event_type, result_code, attempt_number)
      values (p_request_id, 'reconciliation_started', 'ACCOUNT_ACTION_RECONCILIATION_STARTED', v_reconciliation_attempt);
      return query select 'reconcile', v_existing.status, v_existing.result_code;
      return;
    end if;
    return query select 'in_progress', v_existing.status, v_existing.result_code;
  else
    return query select 'replay', v_existing.status, v_existing.result_code;
  end if;
end;
$$;

create function public.complete_account_administration_command(
  p_request_id text,
  p_request_fingerprint text,
  p_status public.account_administration_status,
  p_result_code text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_command public.account_administration_commands%rowtype;
begin
  if p_status = 'pending' or p_result_code !~ '^[A-Z][A-Z0-9_]{2,63}$' then return false; end if;
  update public.account_administration_commands
  set status = p_status, result_code = p_result_code, completed_at = statement_timestamp()
  where request_id = p_request_id and request_fingerprint = p_request_fingerprint and status = 'pending'
  returning * into v_command;

  if found then
    insert into public.account_administration_events (command_request_id, event_type, result_code)
    values (p_request_id, p_status::text, p_result_code)
    on conflict do nothing;
    return true;
  end if;

  select * into v_command from public.account_administration_commands where request_id = p_request_id;
  return found
    and v_command.request_fingerprint = p_request_fingerprint
    and v_command.status = p_status
    and v_command.result_code = p_result_code;
end;
$$;

create function public.apply_character_administration_command(
  p_request_id text,
  p_request_fingerprint text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_command public.account_administration_commands%rowtype;
  v_target_status public.character_status;
  v_result_code text;
begin
  select * into v_command
  from public.account_administration_commands
  where request_id = p_request_id and request_fingerprint = p_request_fingerprint
  for update;

  if not found or v_command.status <> 'pending'
    or v_command.action not in ('suspend_character', 'restore_character')
    or v_command.target_character_id is null
  then raise exception 'Character administration command is unavailable'; end if;

  v_target_status := case v_command.action
    when 'suspend_character' then 'suspended'::public.character_status
    else 'active'::public.character_status
  end;
  v_result_code := case v_command.action
    when 'suspend_character' then 'CHARACTER_SUSPENDED'
    else 'CHARACTER_RESTORED'
  end;

  update public.characters
  set status = v_target_status,
      presence = case when v_target_status = 'suspended' then 'offline'::public.character_presence else presence end,
      discoverable = case when v_target_status = 'suspended' then false else discoverable end
  where id = v_command.target_character_id
    and owner_account_id = v_command.target_account_id
    and kind = 'member'
    and status = case v_command.action
      when 'suspend_character' then 'active'::public.character_status
      else 'suspended'::public.character_status
    end;
  if not found then raise exception 'Character state changed before command application'; end if;

  insert into public.character_history (
    character_id, actor_account_id, actor_kind, event_type, changed_fields, occurred_at
  ) values (
    v_command.target_character_id, v_command.operator_account_id, 'operator', 'status_changed',
    array['status','presence','discoverable'], statement_timestamp()
  );

  update public.account_administration_commands
  set status = 'succeeded', result_code = v_result_code, completed_at = statement_timestamp()
  where request_id = p_request_id;
  insert into public.account_administration_events (command_request_id, event_type, result_code)
  values (p_request_id, 'succeeded', v_result_code);
  return v_result_code;
end;
$$;

revoke all on function public.claim_account_administration_command(
  text, text, public.account_administration_action, uuid, uuid, uuid, text, text, timestamptz
) from public, anon, authenticated;
revoke all on function public.complete_account_administration_command(
  text, text, public.account_administration_status, text
) from public, anon, authenticated;
revoke all on function public.apply_character_administration_command(text, text)
from public, anon, authenticated;
revoke all on function public.record_account_administration_inspection(uuid, uuid, uuid, uuid)
from public, anon, authenticated;
grant execute on function public.claim_account_administration_command(
  text, text, public.account_administration_action, uuid, uuid, uuid, text, text, timestamptz
) to service_role;
grant execute on function public.complete_account_administration_command(
  text, text, public.account_administration_status, text
) to service_role;
grant execute on function public.apply_character_administration_command(text, text)
to service_role;
grant execute on function public.record_account_administration_inspection(uuid, uuid, uuid, uuid)
to service_role;
