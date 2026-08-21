-- CRY-489: server-only, single-use invitation admission foundation.

create type public.launch_wave_status as enum ('draft', 'approved', 'open', 'paused', 'closed');
create type public.invitation_status as enum (
  'prepared', 'sent', 'checkout_pending', 'paid_eligible', 'auth_invited', 'accepted',
  'expired', 'revoked', 'failed'
);
create type public.payment_eligibility as enum ('pending', 'eligible', 'ineligible', 'reversed');
create type public.admission_actor_class as enum (
  'operator', 'payment_webhook', 'outbox_worker', 'subscriber', 'reconciler'
);

create table public.launch_waves (
  id uuid primary key default gen_random_uuid(),
  status public.launch_wave_status not null default 'draft',
  maximum_admissions integer not null check (maximum_admissions > 0),
  approved_by uuid references auth.users(id) on delete restrict,
  approved_at timestamptz,
  opened_at timestamptz,
  paused_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check ((status = 'draft' and approved_by is null and approved_at is null) or (status <> 'draft' and approved_by is not null and approved_at is not null))
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  launch_wave_id uuid not null references public.launch_waves(id) on delete restrict,
  normalized_email text not null check (normalized_email = lower(trim(normalized_email)) and normalized_email like '%@%'),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  status public.invitation_status not null default 'prepared',
  expires_at timestamptz not null,
  auth_user_id uuid unique references auth.users(id) on delete restrict,
  accepted_member_id uuid unique references public.member_profiles(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  sent_at timestamptz,
  token_consumed_at timestamptz,
  paid_eligible_at timestamptz,
  auth_invited_at timestamptz,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check (expires_at > created_at),
  check ((status = 'accepted' and auth_user_id is not null and accepted_member_id is not null and accepted_at is not null) or status <> 'accepted')
);

create unique index invitations_one_nonterminal_email_wave_idx
  on public.invitations (launch_wave_id, normalized_email)
  where status in ('prepared', 'sent', 'checkout_pending', 'paid_eligible', 'auth_invited');
create index invitations_wave_status_idx on public.invitations (launch_wave_id, status);
create index invitations_expires_at_idx on public.invitations (expires_at)
  where status in ('prepared', 'sent', 'checkout_pending', 'paid_eligible', 'auth_invited');

create table public.admission_payment_evidence (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.invitations(id) on delete restrict,
  provider text not null,
  provider_customer_id text,
  provider_checkout_id text unique,
  provider_subscription_id text unique,
  eligibility public.payment_eligibility not null default 'pending',
  last_provider_event_id text not null unique,
  eligible_at timestamptz,
  reversed_at timestamptz,
  recorded_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  check ((eligibility = 'eligible' and eligible_at is not null) or eligibility <> 'eligible'),
  check ((eligibility = 'reversed' and reversed_at is not null) or eligibility <> 'reversed')
);

create table public.admission_events (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete restrict,
  launch_wave_id uuid not null references public.launch_waves(id) on delete restrict,
  event_type text not null,
  prior_status public.invitation_status,
  next_status public.invitation_status,
  actor_class public.admission_actor_class not null,
  idempotency_key text not null unique,
  result_code text not null,
  occurred_at timestamptz not null default statement_timestamp()
);
create index admission_events_invitation_occurred_idx on public.admission_events (invitation_id, occurred_at desc);

create table public.admission_outbox (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete restrict,
  command_type text not null check (command_type in ('invite_auth_user', 'disable_unaccepted_auth_user', 'reconcile_auth_invite')),
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at timestamptz not null default statement_timestamp(),
  claimed_at timestamptz,
  completed_at timestamptz,
  last_result_code text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);
create index admission_outbox_claim_idx on public.admission_outbox (status, available_at, created_at);

alter table public.launch_waves enable row level security;
alter table public.invitations enable row level security;
alter table public.admission_payment_evidence enable row level security;
alter table public.admission_events enable row level security;
alter table public.admission_outbox enable row level security;

revoke all on public.launch_waves, public.invitations, public.admission_payment_evidence,
  public.admission_events, public.admission_outbox from public, anon, authenticated;
grant select, insert, update on public.launch_waves, public.invitations, public.admission_payment_evidence,
  public.admission_events, public.admission_outbox to service_role;

create function public.exchange_admission_token(p_token_digest text, p_idempotency_key text)
returns table (invitation_id uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invitation public.invitations%rowtype;
begin
  if p_token_digest !~ '^[0-9a-f]{64}$' or nullif(trim(p_idempotency_key), '') is null then
    return;
  end if;

  select i.* into v_invitation
  from public.admission_events e
  join public.invitations i on i.id = e.invitation_id
  where e.idempotency_key = p_idempotency_key
    and e.event_type = 'admission_token_exchanged'
    and i.token_hash = p_token_digest
  for update of i;
  if found then
    if v_invitation.status <> 'checkout_pending'
      or v_invitation.expires_at <= statement_timestamp()
      or not exists (
        select 1 from public.launch_waves w
        where w.id = v_invitation.launch_wave_id and w.status = 'open'
      ) then
      return;
    end if;
    return query select v_invitation.id;
    return;
  end if;

  -- A key already bound to another request is a collision, not an authenticated replay.
  if exists (
    select 1 from public.admission_events e
    where e.idempotency_key = p_idempotency_key
  ) then return; end if;

  select * into v_invitation
  from public.invitations
  where token_hash = p_token_digest
  for update;

  if not found or v_invitation.status <> 'sent' then return; end if;

  if v_invitation.expires_at <= statement_timestamp() then
    update public.invitations
    set status = 'expired', updated_at = statement_timestamp()
    where id = v_invitation.id;
    insert into public.admission_events (
      invitation_id, launch_wave_id, event_type, prior_status, next_status,
      actor_class, idempotency_key, result_code
    ) values (
      v_invitation.id, v_invitation.launch_wave_id, 'invitation_expired', v_invitation.status, 'expired',
      'subscriber', p_idempotency_key, 'INVITATION_EXPIRED'
    );
    return;
  end if;

  if not exists (
    select 1 from public.launch_waves w
    where w.id = v_invitation.launch_wave_id and w.status = 'open'
  ) then return; end if;

  update public.invitations
  set status = 'checkout_pending', token_consumed_at = statement_timestamp(), updated_at = statement_timestamp()
  where id = v_invitation.id;

  insert into public.admission_events (
    invitation_id, launch_wave_id, event_type, prior_status, next_status,
    actor_class, idempotency_key, result_code
  ) values (
    v_invitation.id, v_invitation.launch_wave_id, 'admission_token_exchanged', 'sent', 'checkout_pending',
    'subscriber', p_idempotency_key, 'ADMISSION_SESSION_CREATED'
  );

  return query select v_invitation.id;
end;
$$;

revoke all on function public.exchange_admission_token(text, text) from public, anon, authenticated;
grant execute on function public.exchange_admission_token(text, text) to service_role;
