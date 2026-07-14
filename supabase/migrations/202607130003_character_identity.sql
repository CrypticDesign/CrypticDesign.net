create type public.character_kind as enum ('member', 'system');
create type public.character_status as enum ('active', 'suspended', 'retired');

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_account_id uuid references auth.users(id) on delete restrict,
  kind public.character_kind not null default 'member',
  name text not null check (char_length(name) between 1 and 32),
  archetype text not null,
  bio text not null default '' check (char_length(bio) <= 280),
  affiliation text check (char_length(affiliation) <= 80),
  status public.character_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((kind = 'member' and owner_account_id is not null) or (kind = 'system' and owner_account_id is null))
);
create unique index one_member_character_per_account on public.characters (owner_account_id) where kind = 'member';

create table public.character_history (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete restrict,
  actor_account_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (event_type in ('created', 'profile_updated')),
  changed_fields text[] not null default '{}',
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now()
);

alter table public.characters enable row level security;
alter table public.character_history enable row level security;
create policy "accounts read own character" on public.characters for select to authenticated using (owner_account_id = (select auth.uid()));
create policy "accounts read own character history" on public.character_history for select to authenticated using (character_id in (select id from public.characters where owner_account_id = (select auth.uid())));
revoke insert, update, delete on public.characters, public.character_history from anon, authenticated;

