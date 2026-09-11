\set ON_ERROR_STOP on

create extension if not exists dblink with schema extensions;

begin;

-- Make the disposable fixture recoverable after an interrupted prior run.
delete from public.entitlement_grants where member_id in (
  select id from public.member_profiles where account_id = '00000000-0000-4000-8000-000000000112'
);
delete from public.subscription_events where subscription_id in (
  select id from public.subscriptions where provider_subscription_id = 'concurrency-subscription'
);
delete from public.admission_events where invitation_id = '00000000-0000-4000-8000-000000000411';
delete from public.admission_outbox where invitation_id = '00000000-0000-4000-8000-000000000411';
delete from public.admission_payment_evidence where invitation_id = '00000000-0000-4000-8000-000000000411';
delete from public.invitations where id = '00000000-0000-4000-8000-000000000411';
delete from public.launch_waves where id = '00000000-0000-4000-8000-000000000311';
delete from public.subscriptions where provider_subscription_id = 'concurrency-subscription';
delete from public.member_profiles where account_id = '00000000-0000-4000-8000-000000000112';
delete from public.tier_benefits where tier_id = '00000000-0000-4000-8000-000000000211';
delete from public.price_definitions where id = '00000000-0000-4000-8000-000000000212';
delete from public.benefits where id = '00000000-0000-4000-8000-000000000213';
delete from public.tier_definitions where id = '00000000-0000-4000-8000-000000000211';
delete from auth.users where id in (
  '00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000112'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-4000-8000-000000000111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'operator-concurrency@example.test', '', statement_timestamp(),
   '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp()),
  ('00000000-0000-4000-8000-000000000112', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'concurrent@example.test', '', statement_timestamp(),
   '{}'::jsonb, '{}'::jsonb, statement_timestamp(), statement_timestamp());

insert into public.tier_definitions (id, code, name, active)
values ('00000000-0000-4000-8000-000000000211', 'concurrency-tier', 'Concurrency Tier', true);
insert into public.price_definitions (
  id, tier_id, currency, amount_minor, billing_interval, provider, provider_price_id, active
) values (
  '00000000-0000-4000-8000-000000000212', '00000000-0000-4000-8000-000000000211',
  'USD', 1000, 'month', 'concurrency-provider', 'concurrency-price', true
);
insert into public.benefits (id, code, name, active)
values ('00000000-0000-4000-8000-000000000213', 'concurrency-access', 'Concurrency Access', true);
insert into public.tier_benefits (tier_id, benefit_id)
values ('00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000213');

insert into public.launch_waves (
  id, status, maximum_admissions, approved_by, approved_at, opened_at
) values (
  '00000000-0000-4000-8000-000000000311', 'open', 1,
  '00000000-0000-4000-8000-000000000111', statement_timestamp(), statement_timestamp()
);
insert into public.invitations (
  id, launch_wave_id, normalized_email, token_hash, status, expires_at,
  auth_user_id, created_by, sent_at, paid_eligible_at, auth_invited_at
) values (
  '00000000-0000-4000-8000-000000000411', '00000000-0000-4000-8000-000000000311',
  'concurrent@example.test', repeat('b', 64), 'auth_invited', statement_timestamp() + interval '1 day',
  '00000000-0000-4000-8000-000000000112', '00000000-0000-4000-8000-000000000111',
  statement_timestamp(), statement_timestamp(), statement_timestamp()
);
insert into public.admission_payment_evidence (
  invitation_id, provider, provider_subscription_id, eligibility, last_provider_event_id,
  eligible_at, tier_id, price_id, current_period_starts_at, current_period_ends_at
) values (
  '00000000-0000-4000-8000-000000000411', 'concurrency-provider', 'concurrency-subscription',
  'eligible', 'concurrency-payment-event', statement_timestamp(),
  '00000000-0000-4000-8000-000000000211', '00000000-0000-4000-8000-000000000212',
  statement_timestamp(), statement_timestamp() + interval '1 month'
);

commit;

select extensions.dblink_connect(
  'accept_a', 'dbname=postgres user=postgres password=postgres host=host.docker.internal port=54322'
);
select extensions.dblink_connect(
  'accept_b', 'dbname=postgres user=postgres password=postgres host=host.docker.internal port=54322'
);
select extensions.dblink_send_query('accept_a', $$
  select * from public.accept_admission_invitation(
    '00000000-0000-4000-8000-000000000112', 'concurrent@example.test',
    'Concurrent Member', 'concurrent-accept-a'
  )
$$);
select extensions.dblink_send_query('accept_b', $$
  select * from public.accept_admission_invitation(
    '00000000-0000-4000-8000-000000000112', 'concurrent@example.test',
    'Concurrent Member', 'concurrent-accept-b'
  )
$$);

create temporary table concurrent_results (
  source text, accepted_member_id uuid, subscription_id uuid
);
insert into concurrent_results
select 'a', accepted_member_id, subscription_id
from extensions.dblink_get_result('accept_a') as result(accepted_member_id uuid, subscription_id uuid);
insert into concurrent_results
select 'b', accepted_member_id, subscription_id
from extensions.dblink_get_result('accept_b') as result(accepted_member_id uuid, subscription_id uuid);
select extensions.dblink_disconnect('accept_a');
select extensions.dblink_disconnect('accept_b');

do $$
begin
  if (select count(*) from concurrent_results) <> 2 then
    raise exception 'both concurrent callers did not receive a result';
  end if;
  if (select count(distinct accepted_member_id) from concurrent_results) <> 1
    or (select count(distinct subscription_id) from concurrent_results) <> 1 then
    raise exception 'concurrent callers received different projections';
  end if;
  if (select count(*) from public.member_profiles
      where account_id = '00000000-0000-4000-8000-000000000112') <> 1 then
    raise exception 'concurrent acceptance created duplicate members';
  end if;
  if (select count(*) from public.subscriptions
      where provider_subscription_id = 'concurrency-subscription') <> 1 then
    raise exception 'concurrent acceptance created duplicate subscriptions';
  end if;
  if (select count(*) from public.admission_events
      where invitation_id = '00000000-0000-4000-8000-000000000411'
        and event_type = 'admission_accepted') <> 1 then
    raise exception 'concurrent acceptance created duplicate audit events';
  end if;
end;
$$;

begin;
delete from public.entitlement_grants where member_id in (select accepted_member_id from concurrent_results);
delete from public.subscription_events where subscription_id in (select subscription_id from concurrent_results);
delete from public.admission_events where invitation_id = '00000000-0000-4000-8000-000000000411';
delete from public.admission_payment_evidence where invitation_id = '00000000-0000-4000-8000-000000000411';
delete from public.invitations where id = '00000000-0000-4000-8000-000000000411';
delete from public.launch_waves where id = '00000000-0000-4000-8000-000000000311';
delete from public.subscriptions where provider_subscription_id = 'concurrency-subscription';
delete from public.member_profiles where account_id = '00000000-0000-4000-8000-000000000112';
delete from public.tier_benefits where tier_id = '00000000-0000-4000-8000-000000000211';
delete from public.price_definitions where id = '00000000-0000-4000-8000-000000000212';
delete from public.benefits where id = '00000000-0000-4000-8000-000000000213';
delete from public.tier_definitions where id = '00000000-0000-4000-8000-000000000211';
delete from auth.users where id in (
  '00000000-0000-4000-8000-000000000111', '00000000-0000-4000-8000-000000000112'
);
commit;

select 'admission acceptance concurrency checks passed' as result;
