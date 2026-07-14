create type public.entitlement_source as enum (
  'tier', 'purchase', 'role', 'event', 'promotion', 'administration'
);

create table public.entitlement_grants (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete restrict,
  resource text not null check (char_length(resource) between 1 and 200),
  action text not null check (char_length(action) between 1 and 80),
  source public.entitlement_source not null,
  source_id text not null check (char_length(source_id) between 1 and 200),
  effective_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  check (expires_at is null or expires_at > effective_at),
  check ((revoked_at is null and revocation_reason is null) or
         (revoked_at is not null and char_length(revocation_reason) > 0)),
  unique (member_id, resource, action, source, source_id)
);

create table public.entitlement_decisions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.member_profiles(id) on delete set null,
  resource text not null,
  action text not null,
  allowed boolean not null,
  reason text not null check (reason in ('valid_grant', 'no_matching_grant', 'invalid_request')),
  grant_ids uuid[] not null default '{}',
  evaluated_at timestamptz not null,
  recorded_at timestamptz not null default now()
);

create index entitlement_grants_resolution_idx
  on public.entitlement_grants (member_id, resource, action, effective_at);
create index entitlement_decisions_member_recorded_idx
  on public.entitlement_decisions (member_id, recorded_at desc);

alter table public.entitlement_grants enable row level security;
alter table public.entitlement_decisions enable row level security;

create policy "members read own entitlement grants" on public.entitlement_grants
  for select to authenticated
  using (member_id in (
    select id from public.member_profiles where account_id = (select auth.uid())
  ));

create policy "members read own entitlement decisions" on public.entitlement_decisions
  for select to authenticated
  using (member_id in (
    select id from public.member_profiles where account_id = (select auth.uid())
  ));

revoke insert, update, delete on public.entitlement_grants, public.entitlement_decisions
  from anon, authenticated;

