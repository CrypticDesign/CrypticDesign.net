create type public.subscription_status as enum (
  'pending', 'incomplete', 'trialing', 'active', 'past_due', 'grace', 'paused',
  'canceled', 'expired', 'refunded', 'disputed', 'terminated'
);

create table public.member_profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.benefits (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  active boolean not null default true
);

create table public.tier_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0
);

create table public.tier_benefits (
  tier_id uuid not null references public.tier_definitions(id) on delete cascade,
  benefit_id uuid not null references public.benefits(id) on delete cascade,
  primary key (tier_id, benefit_id)
);

create table public.price_definitions (
  id uuid primary key default gen_random_uuid(),
  tier_id uuid not null references public.tier_definitions(id) on delete restrict,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  amount_minor integer not null check (amount_minor >= 0),
  billing_interval text not null check (billing_interval in ('month', 'year')),
  provider text,
  provider_price_id text,
  active boolean not null default true,
  unique nulls not distinct (provider, provider_price_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.member_profiles(id) on delete restrict,
  tier_id uuid not null references public.tier_definitions(id) on delete restrict,
  price_id uuid not null references public.price_definitions(id) on delete restrict,
  status public.subscription_status not null default 'incomplete',
  provider text,
  provider_subscription_id text,
  current_period_starts_at timestamptz,
  current_period_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (provider, provider_subscription_id)
);

create table public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  provider_event_id text unique,
  from_status public.subscription_status not null,
  to_status public.subscription_status not null,
  reason text not null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now()
);

create index subscriptions_member_id_idx on public.subscriptions(member_id);
create index subscription_events_subscription_id_occurred_at_idx on public.subscription_events(subscription_id, occurred_at desc);

alter table public.member_profiles enable row level security;
alter table public.benefits enable row level security;
alter table public.tier_definitions enable row level security;
alter table public.tier_benefits enable row level security;
alter table public.price_definitions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_events enable row level security;

create policy "members read own profile" on public.member_profiles for select to authenticated
  using (account_id = (select auth.uid()));
create policy "members update own profile" on public.member_profiles for update to authenticated
  using (account_id = (select auth.uid())) with check (account_id = (select auth.uid()));

create policy "anyone reads active benefits" on public.benefits for select to anon, authenticated using (active);
create policy "anyone reads active tiers" on public.tier_definitions for select to anon, authenticated using (active);
create policy "anyone reads active tier benefits" on public.tier_benefits for select to anon, authenticated using (true);
create policy "anyone reads active prices" on public.price_definitions for select to anon, authenticated using (active);

create policy "members read own subscriptions" on public.subscriptions for select to authenticated
  using (member_id in (select id from public.member_profiles where account_id = (select auth.uid())));
create policy "members read own subscription events" on public.subscription_events for select to authenticated
  using (subscription_id in (
    select s.id from public.subscriptions s
    join public.member_profiles m on m.id = s.member_id
    where m.account_id = (select auth.uid())
  ));

revoke insert, update, delete on public.benefits, public.tier_definitions, public.tier_benefits,
  public.price_definitions, public.subscriptions, public.subscription_events from anon, authenticated;
