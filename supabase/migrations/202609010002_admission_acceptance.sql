-- CRY-491: transactional acceptance of an eligible, server-created Auth invite.

alter table public.admission_payment_evidence
  add column tier_id uuid references public.tier_definitions(id) on delete restrict,
  add column price_id uuid references public.price_definitions(id) on delete restrict,
  add column current_period_starts_at timestamptz,
  add column current_period_ends_at timestamptz;

alter table public.admission_payment_evidence
  add constraint admission_eligible_subscription_projection_check check (
    eligibility <> 'eligible' or (
      tier_id is not null
      and price_id is not null
      and provider_subscription_id is not null
      and eligible_at is not null
      and current_period_starts_at is not null
      and current_period_ends_at is not null
      and current_period_ends_at > current_period_starts_at
    )
  );

create function public.admission_invite_ready(p_account_id uuid, p_normalized_email text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.invitations i
    join public.launch_waves w on w.id = i.launch_wave_id
    join public.admission_payment_evidence p on p.invitation_id = i.id
    join auth.users u on u.id = i.auth_user_id
    where i.auth_user_id = p_account_id
      and i.normalized_email = lower(trim(p_normalized_email))
      and lower(trim(u.email)) = i.normalized_email
      and u.email_confirmed_at is not null
      and i.status = 'auth_invited'
      and i.expires_at > statement_timestamp()
      and w.status = 'open'
      and p.eligibility = 'eligible'
      and p.tier_id is not null
      and p.price_id is not null
      and p.provider_subscription_id is not null
  );
$$;

create function public.accept_admission_invitation(
  p_account_id uuid,
  p_normalized_email text,
  p_display_name text,
  p_idempotency_key text
)
returns table (accepted_member_id uuid, subscription_id uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invitation public.invitations%rowtype;
  v_wave public.launch_waves%rowtype;
  v_payment public.admission_payment_evidence%rowtype;
  v_price public.price_definitions%rowtype;
  v_tier public.tier_definitions%rowtype;
  v_member public.member_profiles%rowtype;
  v_subscription public.subscriptions%rowtype;
  v_auth_email text;
  v_display_name text;
begin
  if p_account_id is null
    or p_normalized_email is null
    or p_normalized_email <> lower(trim(p_normalized_email))
    or p_normalized_email not like '%@%'
    or nullif(trim(p_idempotency_key), '') is null
    or length(trim(p_idempotency_key)) > 200 then
    raise exception 'invalid admission acceptance request' using errcode = '22023';
  end if;

  -- A key already used for another authority mutation is a collision.
  if exists (
    select 1 from public.admission_events e
    where e.idempotency_key = p_idempotency_key
      and e.event_type <> 'admission_accepted'
  ) then
    raise exception 'idempotency key collision' using errcode = '23505';
  end if;

  -- Return an already committed acceptance without creating duplicate authority.
  select m.* into v_member
  from public.admission_events e
  join public.invitations i on i.id = e.invitation_id
  join public.member_profiles m on m.id = i.accepted_member_id
  where e.idempotency_key = p_idempotency_key
    and e.event_type = 'admission_accepted'
    and i.auth_user_id = p_account_id
    and i.normalized_email = p_normalized_email
  limit 1;
  if found then
    select s.* into v_subscription
    from public.invitations i
    join public.admission_payment_evidence p on p.invitation_id = i.id
    join public.subscriptions s
      on s.member_id = v_member.id
     and s.provider_subscription_id = p.provider_subscription_id
     and s.provider = p.provider
    where i.auth_user_id = p_account_id
      and i.normalized_email = p_normalized_email
    order by s.created_at
    limit 1;
    if not found then
      raise exception 'committed admission projection is incomplete' using errcode = '55000';
    end if;
    return query select v_member.id, v_subscription.id;
    return;
  end if;

  select lower(trim(u.email)) into v_auth_email
  from auth.users u
  where u.id = p_account_id and u.email_confirmed_at is not null;
  if not found or v_auth_email <> p_normalized_email then
    raise exception 'authenticated identity does not match invitation' using errcode = '42501';
  end if;

  select * into v_invitation
  from public.invitations
  where auth_user_id = p_account_id and normalized_email = p_normalized_email
  for update;
  if not found then raise exception 'eligible invitation not found' using errcode = '42501'; end if;

  if v_invitation.status = 'accepted' then
    select * into v_member from public.member_profiles where id = v_invitation.accepted_member_id;
    select s.* into v_subscription
    from public.subscriptions s
    join public.admission_payment_evidence p
      on p.invitation_id = v_invitation.id
     and p.provider_subscription_id = s.provider_subscription_id
     and p.provider = s.provider
    where s.member_id = v_member.id
    order by s.created_at limit 1;
    if v_subscription.id is null then raise exception 'accepted projection is incomplete'; end if;
    return query select v_member.id, v_subscription.id;
    return;
  end if;

  if v_invitation.status <> 'auth_invited'
    or v_invitation.expires_at <= statement_timestamp()
    or v_invitation.revoked_at is not null then
    raise exception 'invitation is not acceptable' using errcode = '42501';
  end if;

  -- Wave lock serializes acceptance with operator pause/close decisions.
  select * into v_wave from public.launch_waves
  where id = v_invitation.launch_wave_id for update;
  if not found or v_wave.status <> 'open' then
    raise exception 'launch wave is not open' using errcode = '42501';
  end if;

  select * into v_payment from public.admission_payment_evidence
  where invitation_id = v_invitation.id for update;
  if not found or v_payment.eligibility <> 'eligible'
    or v_payment.tier_id is null or v_payment.price_id is null
    or v_payment.provider_subscription_id is null
    or v_payment.current_period_starts_at is null
    or v_payment.current_period_ends_at is null then
    raise exception 'payment is not eligible' using errcode = '42501';
  end if;

  select * into v_tier from public.tier_definitions
  where id = v_payment.tier_id and active for share;
  select * into v_price from public.price_definitions
  where id = v_payment.price_id and tier_id = v_payment.tier_id
    and provider = v_payment.provider and active for share;
  if v_tier.id is null or v_price.id is null then
    raise exception 'subscription definition is not active' using errcode = '42501';
  end if;

  if exists (select 1 from public.member_profiles where account_id = p_account_id) then
    raise exception 'account already has a member profile' using errcode = '23505';
  end if;
  if exists (
    select 1 from public.subscriptions
    where provider = v_payment.provider
      and provider_subscription_id = v_payment.provider_subscription_id
  ) then
    raise exception 'provider subscription is already linked' using errcode = '23505';
  end if;

  v_display_name := left(coalesce(
    nullif(trim(p_display_name), ''),
    nullif(split_part(p_normalized_email, '@', 1), ''),
    'Member'
  ), 80);

  insert into public.member_profiles (account_id, display_name)
  values (p_account_id, v_display_name)
  returning * into v_member;

  insert into public.subscriptions (
    member_id, tier_id, price_id, status, provider, provider_subscription_id,
    current_period_starts_at, current_period_ends_at
  ) values (
    v_member.id, v_tier.id, v_price.id, 'active', v_payment.provider,
    v_payment.provider_subscription_id, v_payment.current_period_starts_at,
    v_payment.current_period_ends_at
  ) returning * into v_subscription;

  insert into public.subscription_events (
    subscription_id, provider_event_id, from_status, to_status, reason, occurred_at
  ) values (
    v_subscription.id, 'admission:' || v_payment.last_provider_event_id,
    'pending', 'active', 'eligible_invitation_accepted', statement_timestamp()
  );

  insert into public.entitlement_grants (
    member_id, resource, action, source, source_id,
    effective_at, expires_at, created_by
  )
  select v_member.id, b.code, 'access', 'tier', v_subscription.id::text,
         v_payment.current_period_starts_at, v_payment.current_period_ends_at,
         p_account_id
  from public.tier_benefits tb
  join public.benefits b on b.id = tb.benefit_id and b.active
  where tb.tier_id = v_tier.id;

  update public.invitations
  set status = 'accepted', accepted_member_id = v_member.id,
      accepted_at = statement_timestamp(), updated_at = statement_timestamp()
  where id = v_invitation.id;

  insert into public.admission_events (
    invitation_id, launch_wave_id, event_type, prior_status, next_status,
    actor_class, idempotency_key, result_code
  ) values (
    v_invitation.id, v_invitation.launch_wave_id, 'admission_accepted',
    'auth_invited', 'accepted', 'subscriber', trim(p_idempotency_key),
    'MEMBER_SUBSCRIPTION_ENTITLEMENTS_ACTIVE'
  );

  return query select v_member.id, v_subscription.id;
end;
$$;

revoke all on function public.admission_invite_ready(uuid, text) from public, anon, authenticated;
revoke all on function public.accept_admission_invitation(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.admission_invite_ready(uuid, text) to service_role;
grant execute on function public.accept_admission_invitation(uuid, text, text, text) to service_role;
