\set ON_ERROR_STOP on

begin;

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'operator@example.test', '', statement_timestamp(),
    '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'invited@example.test', '', statement_timestamp(),
    '{}'::jsonb, '{"display_name":"Invited Member"}'::jsonb,
    statement_timestamp(), statement_timestamp()
  );

insert into public.tier_definitions (id, code, name, active)
values ('00000000-0000-4000-8000-000000000201', 'runtime-tier', 'Runtime Tier', true);

insert into public.price_definitions (
  id, tier_id, currency, amount_minor, billing_interval, provider, provider_price_id, active
) values (
  '00000000-0000-4000-8000-000000000202',
  '00000000-0000-4000-8000-000000000201',
  'USD', 1000, 'month', 'runtime-provider', 'runtime-price', true
);

insert into public.benefits (id, code, name, active)
values ('00000000-0000-4000-8000-000000000203', 'runtime-access', 'Runtime Access', true);

insert into public.tier_benefits (tier_id, benefit_id)
values (
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000203'
);

insert into public.launch_waves (
  id, status, maximum_admissions, approved_by, approved_at, opened_at
) values (
  '00000000-0000-4000-8000-000000000301', 'open', 1,
  '00000000-0000-4000-8000-000000000101', statement_timestamp(), statement_timestamp()
);

insert into public.invitations (
  id, launch_wave_id, normalized_email, token_hash, status, expires_at,
  auth_user_id, created_by, sent_at, paid_eligible_at, auth_invited_at
) values (
  '00000000-0000-4000-8000-000000000401',
  '00000000-0000-4000-8000-000000000301',
  'invited@example.test', repeat('a', 64), 'auth_invited',
  statement_timestamp() + interval '1 day',
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000101',
  statement_timestamp(), statement_timestamp(), statement_timestamp()
);

insert into public.admission_payment_evidence (
  invitation_id, provider, provider_customer_id, provider_checkout_id,
  provider_subscription_id, eligibility, last_provider_event_id, eligible_at,
  tier_id, price_id, current_period_starts_at, current_period_ends_at
) values (
  '00000000-0000-4000-8000-000000000401',
  'runtime-provider', 'runtime-customer', 'runtime-checkout', 'runtime-subscription',
  'eligible', 'runtime-payment-event', statement_timestamp(),
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000202',
  statement_timestamp(), statement_timestamp() + interval '1 month'
);

do $$
declare
  v_first record;
  v_replay record;
begin
  if not public.admission_invite_ready(
    '00000000-0000-4000-8000-000000000102', 'invited@example.test'
  ) then
    raise exception 'expected eligible invitation to be ready';
  end if;

  if public.admission_invite_ready(
    '00000000-0000-4000-8000-000000000102', 'wrong@example.test'
  ) then
    raise exception 'wrong email passed readiness';
  end if;

  begin
    perform * from public.accept_admission_invitation(
      '00000000-0000-4000-8000-000000000102',
      'wrong@example.test', 'Wrong Identity', 'runtime-negative-identity'
    );
    raise exception 'wrong email acceptance unexpectedly succeeded';
  exception when insufficient_privilege then
    null;
  end;

  select * into strict v_first from public.accept_admission_invitation(
    '00000000-0000-4000-8000-000000000102',
    'invited@example.test', 'Invited Member', 'runtime-acceptance-replay'
  );

  select * into strict v_replay from public.accept_admission_invitation(
    '00000000-0000-4000-8000-000000000102',
    'invited@example.test', 'Ignored Replay Name', 'runtime-acceptance-replay'
  );

  if v_first.accepted_member_id is null or v_first.subscription_id is null then
    raise exception 'acceptance did not return its projections';
  end if;
  if v_first.accepted_member_id <> v_replay.accepted_member_id
    or v_first.subscription_id <> v_replay.subscription_id then
    raise exception 'idempotent replay returned different projections';
  end if;
  if (select count(*) from public.member_profiles
      where account_id = '00000000-0000-4000-8000-000000000102') <> 1 then
    raise exception 'member projection was not exactly once';
  end if;
  if (select count(*) from public.subscriptions
      where provider_subscription_id = 'runtime-subscription' and status = 'active') <> 1 then
    raise exception 'subscription projection was not exactly once';
  end if;
  if (select count(*) from public.entitlement_grants
      where member_id = v_first.accepted_member_id and resource = 'runtime-access') <> 1 then
    raise exception 'entitlement projection was not exactly once';
  end if;
  if (select count(*) from public.admission_events
      where idempotency_key = 'runtime-acceptance-replay'
        and event_type = 'admission_accepted') <> 1 then
    raise exception 'acceptance audit event was not exactly once';
  end if;
  if (select status from public.invitations
      where id = '00000000-0000-4000-8000-000000000401') <> 'accepted' then
    raise exception 'invitation did not transition to accepted';
  end if;
  if has_function_privilege('anon',
      'public.accept_admission_invitation(uuid,text,text,text)', 'EXECUTE') then
    raise exception 'anon can execute acceptance';
  end if;
  if has_function_privilege('authenticated',
      'public.accept_admission_invitation(uuid,text,text,text)', 'EXECUTE') then
    raise exception 'authenticated can execute acceptance';
  end if;
  if not has_function_privilege('service_role',
      'public.accept_admission_invitation(uuid,text,text,text)', 'EXECUTE') then
    raise exception 'service role cannot execute acceptance';
  end if;
end;
$$;

rollback;

select 'admission acceptance runtime checks passed' as result;
