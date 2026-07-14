-- Portable schema proposal only. Do not apply until production provisioning,
-- privacy, retention, youth safety, and public reward policy are approved.

create type public.rpg_entry_reason as enum ('verified_activity', 'correction');
create type public.rpg_condition_scope as enum ('global', 'campaign', 'session');
create type public.quest_run_status as enum ('available', 'active', 'completed', 'failed', 'abandoned', 'expired');
create type public.achievement_award_status as enum ('earned', 'revoked', 'superseded', 'hidden');

create table public.rpg_experience_events (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  account_id uuid not null references auth.users(id) on delete restrict,
  experience_id text not null,
  experience_version integer not null check (experience_version > 0),
  session_id text not null,
  source text not null check (source in ('sandbox-server', 'approved-fixture')),
  verified_active_minutes integer not null check (verified_active_minutes between 0 and 720),
  context jsonb not null,
  challenge_factor numeric not null,
  novelty_factor numeric not null,
  value_factor numeric not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  unique (experience_id, session_id)
);

create table public.rpg_time_ledger (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  source_event_id uuid not null references public.rpg_experience_events(id) on delete restrict,
  delta integer not null check (delta <> 0),
  reason public.rpg_entry_reason not null,
  reverses_entry_id uuid unique references public.rpg_time_ledger(id) on delete restrict,
  time_rule_id text not null,
  time_rule_version integer not null,
  level_rule_id text not null,
  level_rule_version integer not null,
  recorded_at timestamptz not null default now(),
  check ((reason = 'verified_activity' and delta > 0 and reverses_entry_id is null) or (reason = 'correction' and delta < 0 and reverses_entry_id is not null))
);

create table public.rpg_attribute_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  source_event_id uuid not null references public.rpg_experience_events(id) on delete restrict,
  usage jsonb not null,
  reason public.rpg_entry_reason not null,
  reverses_entry_id uuid unique references public.rpg_attribute_usage_ledger(id) on delete restrict,
  rule_id text not null,
  rule_version integer not null,
  recorded_at timestamptz not null default now()
);

create table public.rpg_conditions (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  definition_id text not null,
  definition_version integer not null,
  scope public.rpg_condition_scope not null,
  campaign_id text,
  session_id text,
  severity integer not null check (severity > 0),
  attribute_modifiers jsonb not null default '{}',
  source_event_id uuid not null references public.rpg_experience_events(id) on delete restrict,
  effective_at timestamptz not null,
  expires_at timestamptz,
  removed_at timestamptz
);

create table public.quest_definitions (
  id text not null,
  version integer not null,
  title text not null,
  issuer_character_id uuid not null references public.characters(id) on delete restrict,
  objectives jsonb not null,
  starts_at timestamptz,
  ends_at timestamptz,
  repeatable boolean not null default false,
  primary key (id, version)
);

create table public.quest_runs (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  quest_id text not null,
  quest_version integer not null,
  repeat_window text not null,
  status public.quest_run_status not null,
  progress jsonb not null default '[]',
  started_at timestamptz,
  resolved_at timestamptz,
  resolution_reason text,
  foreign key (quest_id, quest_version) references public.quest_definitions(id, version),
  unique (character_id, quest_id, quest_version, repeat_window)
);

create table public.achievement_definitions (
  id text not null,
  version integer not null,
  title text not null,
  evidence_type text not null,
  primary key (id, version)
);

create table public.achievement_awards (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  definition_id text not null,
  definition_version integer not null,
  status public.achievement_award_status not null,
  evidence_event_ids uuid[] not null,
  explanation text not null,
  awarded_at timestamptz not null,
  supersedes_award_id uuid references public.achievement_awards(id) on delete restrict,
  foreign key (definition_id, definition_version) references public.achievement_definitions(id, version)
);

create table public.rpg_collectible_grants (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  collectible_id text not null,
  definition_version integer not null,
  source_event_id uuid not null references public.rpg_experience_events(id) on delete restrict,
  granted_at timestamptz not null,
  revoked_at timestamptz,
  transferable boolean not null default false check (transferable = false)
);

alter table public.rpg_experience_events enable row level security;
alter table public.rpg_time_ledger enable row level security;
alter table public.rpg_attribute_usage_ledger enable row level security;
alter table public.rpg_conditions enable row level security;
alter table public.quest_definitions enable row level security;
alter table public.quest_runs enable row level security;
alter table public.achievement_definitions enable row level security;
alter table public.achievement_awards enable row level security;
alter table public.rpg_collectible_grants enable row level security;

create policy "accounts read own RPG events" on public.rpg_experience_events for select to authenticated using (account_id = (select auth.uid()));
create policy "accounts read own Time" on public.rpg_time_ledger for select to authenticated using (character_id in (select id from public.characters where owner_account_id = (select auth.uid())));
create policy "accounts read own attribute usage" on public.rpg_attribute_usage_ledger for select to authenticated using (character_id in (select id from public.characters where owner_account_id = (select auth.uid())));
create policy "accounts read own conditions" on public.rpg_conditions for select to authenticated using (character_id in (select id from public.characters where owner_account_id = (select auth.uid())));
create policy "accounts read own quest runs" on public.quest_runs for select to authenticated using (character_id in (select id from public.characters where owner_account_id = (select auth.uid())));
create policy "accounts read own achievements" on public.achievement_awards for select to authenticated using (character_id in (select id from public.characters where owner_account_id = (select auth.uid())));
create policy "accounts read own collectibles" on public.rpg_collectible_grants for select to authenticated using (character_id in (select id from public.characters where owner_account_id = (select auth.uid())));

revoke all on public.quest_definitions, public.achievement_definitions from anon, authenticated;
revoke insert, update, delete on public.rpg_experience_events, public.rpg_time_ledger, public.rpg_attribute_usage_ledger, public.rpg_conditions, public.quest_runs, public.achievement_awards, public.rpg_collectible_grants from anon, authenticated;

