-- Schema proposal only. Do not apply until retention, youth, production provisioning,
-- and public progression policy gates are approved.
create type public.activity_event_type as enum ('release_discovered', 'media_completed', 'test_event_participated');
create type public.progression_entry_reason as enum ('activity_award', 'correction');

create table public.progression_rules (
  id text not null,
  version integer not null check (version > 0),
  activity_type public.activity_event_type not null,
  internal_units integer not null check (internal_units > 0),
  created_at timestamptz not null default now(),
  primary key (id, version),
  unique (activity_type, version)
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  account_id uuid not null references auth.users(id) on delete restrict,
  event_type public.activity_event_type not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now()
);

create table public.progression_ledger (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  source_event_id uuid not null references public.activity_events(id) on delete restrict,
  delta integer not null check (delta <> 0),
  rule_id text not null,
  rule_version integer not null,
  reason public.progression_entry_reason not null,
  reverses_entry_id uuid unique references public.progression_ledger(id) on delete restrict,
  recorded_at timestamptz not null default now(),
  foreign key (rule_id, rule_version) references public.progression_rules(id, version),
  check ((reason = 'activity_award' and reverses_entry_id is null and delta > 0) or (reason = 'correction' and reverses_entry_id is not null and delta < 0))
);

create table public.progression_idempotency (
  scope text not null,
  request_id text not null,
  payload_hash text not null,
  ledger_entry_id uuid not null references public.progression_ledger(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (scope, request_id)
);

insert into public.progression_rules (id, version, activity_type, internal_units) values
  ('sandbox-release-discovery', 1, 'release_discovered', 1),
  ('sandbox-media-completion', 1, 'media_completed', 2),
  ('sandbox-test-event', 1, 'test_event_participated', 3);

alter table public.progression_rules enable row level security;
alter table public.activity_events enable row level security;
alter table public.progression_ledger enable row level security;
alter table public.progression_idempotency enable row level security;
create policy "accounts read own activity events" on public.activity_events for select to authenticated using (account_id = (select auth.uid()));
create policy "accounts read own progression" on public.progression_ledger for select to authenticated using (character_id in (select id from public.characters where owner_account_id = (select auth.uid())));
revoke all on public.progression_rules, public.progression_idempotency from anon, authenticated;
revoke insert, update, delete on public.activity_events, public.progression_ledger from anon, authenticated;
