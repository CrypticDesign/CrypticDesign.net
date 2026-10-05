-- CRY-400 Gate 2: unapplied draft for short-lived, digest-only operator sessions.
-- This migration is local design evidence only until Robert explicitly approves application.

create table public.operator_access_sessions (
  id uuid primary key,
  token_digest text not null unique check (token_digest ~ '^[a-f0-9]{64}$'),
  operator_account_id uuid not null references public.operator_principals(account_id) on delete restrict,
  auth_session_reference_digest text not null check (auth_session_reference_digest ~ '^[a-f0-9]{64}$'),
  reauthenticated_at timestamptz not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  check (expires_at > issued_at),
  check (expires_at <= issued_at + interval '15 minutes'),
  check (reauthenticated_at <= issued_at + interval '1 minute'),
  check (reauthenticated_at >= issued_at - interval '5 minutes'),
  check (revoked_at is null or revoked_at >= issued_at)
);

create index operator_access_sessions_operator_account_id_idx
on public.operator_access_sessions (operator_account_id);

create table public.operator_access_session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.operator_access_sessions(id) on delete restrict,
  operator_account_id uuid not null references public.operator_principals(account_id) on delete restrict,
  event_type text not null check (event_type in ('issued', 'revoked')),
  reason_code text not null check (reason_code in ('OPERATOR_SESSION_ISSUED', 'OPERATOR_SESSION_REVOKED')),
  occurred_at timestamptz not null default statement_timestamp(),
  unique (session_id, event_type)
);

create function public.reject_operator_access_session_event_change()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception 'Operator access session events are immutable';
end;
$$;

create trigger operator_access_session_events_immutable
before update or delete on public.operator_access_session_events
for each row execute function public.reject_operator_access_session_event_change();

alter table public.operator_access_sessions enable row level security;
alter table public.operator_access_session_events enable row level security;

revoke all on public.operator_access_sessions, public.operator_access_session_events
from public, anon, authenticated, service_role;

-- The service role may read the bounded records used by the server-only adapter.
-- Creation, revocation, and event writes remain RPC-only so the session and event
-- records change atomically.
grant select on public.operator_access_sessions, public.operator_access_session_events
to service_role;

create function public.create_operator_access_session(
  p_session_id uuid,
  p_token_digest text,
  p_operator_account_id uuid,
  p_auth_session_reference_digest text,
  p_reauthenticated_at timestamptz,
  p_issued_at timestamptz,
  p_expires_at timestamptz,
  p_required_capability text
)
returns timestamptz
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_occurred_at timestamptz;
begin
  if p_token_digest !~ '^[a-f0-9]{64}$'
    or p_auth_session_reference_digest !~ '^[a-f0-9]{64}$'
    or p_required_capability not in (
      'account:inspect', 'account:suspend', 'account:restore', 'account:revoke_sessions',
      'character:suspend', 'character:restore', 'protected_targets:mutate'
    )
    or p_issued_at < statement_timestamp() - interval '1 minute'
    or p_issued_at > statement_timestamp() + interval '1 minute'
    or p_reauthenticated_at < p_issued_at - interval '5 minutes'
    or p_reauthenticated_at > p_issued_at + interval '1 minute'
    or p_expires_at <= p_issued_at
    or p_expires_at > p_issued_at + interval '15 minutes'
  then
    raise exception 'Operator access session issuance denied';
  end if;

  if not exists (
    select 1 from public.operator_principals o
    where o.account_id = p_operator_account_id
      and o.status = 'active'
      and p_required_capability = any(o.capabilities)
  ) then
    raise exception 'Operator access session issuance denied';
  end if;

  insert into public.operator_access_sessions (
    id, token_digest, operator_account_id, auth_session_reference_digest,
    reauthenticated_at, issued_at, expires_at
  ) values (
    p_session_id, p_token_digest, p_operator_account_id, p_auth_session_reference_digest,
    p_reauthenticated_at, p_issued_at, p_expires_at
  );

  insert into public.operator_access_session_events (
    session_id, operator_account_id, event_type, reason_code
  ) values (
    p_session_id, p_operator_account_id, 'issued', 'OPERATOR_SESSION_ISSUED'
  ) returning occurred_at into v_occurred_at;

  return v_occurred_at;
end;
$$;

create function public.revoke_operator_access_session(
  p_session_id uuid,
  p_operator_account_id uuid,
  p_revoked_at timestamptz
)
returns timestamptz
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session public.operator_access_sessions%rowtype;
  v_occurred_at timestamptz;
begin
  select * into v_session
  from public.operator_access_sessions
  where id = p_session_id and operator_account_id = p_operator_account_id
  for update;

  if not found then
    raise exception 'Operator access session revocation denied';
  end if;

  if v_session.revoked_at is not null then
    return v_session.revoked_at;
  end if;

  if p_revoked_at < v_session.issued_at
    or p_revoked_at > statement_timestamp() + interval '1 minute'
  then
    raise exception 'Operator access session revocation denied';
  end if;

  update public.operator_access_sessions
  set revoked_at = p_revoked_at
  where id = p_session_id and revoked_at is null;

  insert into public.operator_access_session_events (
    session_id, operator_account_id, event_type, reason_code, occurred_at
  ) values (
    p_session_id, p_operator_account_id, 'revoked', 'OPERATOR_SESSION_REVOKED', p_revoked_at
  ) returning occurred_at into v_occurred_at;

  return v_occurred_at;
end;
$$;

revoke all on function public.create_operator_access_session(
  uuid, text, uuid, text, timestamptz, timestamptz, timestamptz, text
) from public, anon, authenticated, service_role;
revoke all on function public.revoke_operator_access_session(uuid, uuid, timestamptz)
from public, anon, authenticated, service_role;

grant execute on function public.create_operator_access_session(
  uuid, text, uuid, text, timestamptz, timestamptz, timestamptz, text
) to service_role;
grant execute on function public.revoke_operator_access_session(uuid, uuid, timestamptz)
to service_role;
