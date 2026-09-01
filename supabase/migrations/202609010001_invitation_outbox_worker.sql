-- CRY-489: transactional, service-role-only invitation outbox worker contract.

alter table public.admission_outbox
  add column claimed_by text;

create function public.claim_admission_outbox(p_worker_id text, p_limit integer default 5)
returns table (
  outbox_id uuid,
  invitation_id uuid,
  command_type text,
  idempotency_key text,
  attempt_count integer,
  normalized_email text,
  auth_user_id uuid,
  gates_open boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if nullif(trim(p_worker_id), '') is null or p_limit < 1 or p_limit > 10 then
    raise exception 'invalid worker claim';
  end if;

  -- A crashed worker's lease is recoverable. Auth-side ambiguity is resolved by
  -- invitation metadata before another invite is attempted.
  update public.admission_outbox
  set status = 'pending', claimed_at = null, claimed_by = null,
      available_at = statement_timestamp(), updated_at = statement_timestamp(),
      last_result_code = 'STALE_CLAIM_RECOVERED'
  where status = 'processing'
    and claimed_at < statement_timestamp() - interval '5 minutes';

  return query
  with candidates as (
    select o.id
    from public.admission_outbox o
    where o.status = 'pending'
      and o.available_at <= statement_timestamp()
      and o.attempt_count < 5
    order by o.available_at, o.created_at
    for update skip locked
    limit p_limit
  ), claimed as (
    update public.admission_outbox o
    set status = 'processing', claimed_at = statement_timestamp(),
        claimed_by = trim(p_worker_id), attempt_count = o.attempt_count + 1,
        updated_at = statement_timestamp()
    from candidates c
    where o.id = c.id
    returning o.*
  )
  select c.id, c.invitation_id, c.command_type, c.idempotency_key,
         c.attempt_count, i.normalized_email, i.auth_user_id,
         case when c.command_type = 'disable_unaccepted_auth_user' then true else
           i.status = 'paid_eligible'
           and i.expires_at > statement_timestamp()
           and exists (
             select 1 from public.admission_payment_evidence p
             where p.invitation_id = i.id and p.eligibility = 'eligible'
           )
           and exists (
             select 1 from public.launch_waves w
             where w.id = i.launch_wave_id and w.status = 'open'
               and (select count(*) from public.invitations admitted
                    where admitted.launch_wave_id = w.id
                      and admitted.status in ('auth_invited', 'accepted')) < w.maximum_admissions
           )
         end
  from claimed c
  join public.invitations i on i.id = c.invitation_id;
end;
$$;

create function public.complete_admission_auth_invite(
  p_outbox_id uuid,
  p_auth_user_id uuid,
  p_result_code text
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_outbox public.admission_outbox%rowtype;
  v_invitation public.invitations%rowtype;
  v_wave public.launch_waves%rowtype;
  v_payment public.admission_payment_evidence%rowtype;
  v_gates_open boolean;
begin
  if p_auth_user_id is null or nullif(trim(p_result_code), '') is null then
    raise exception 'invalid invite completion';
  end if;

  select * into v_outbox from public.admission_outbox
  where id = p_outbox_id for update;
  if not found or v_outbox.status <> 'processing'
    or v_outbox.command_type not in ('invite_auth_user', 'reconcile_auth_invite') then
    raise exception 'outbox command is not claimable for invite completion';
  end if;

  select * into v_invitation from public.invitations
  where id = v_outbox.invitation_id for update;

  -- Lock the wave before counting admitted users. The count runs in a later
  -- statement snapshot, so concurrent completions cannot both consume the last slot.
  select * into v_wave from public.launch_waves
  where id = v_invitation.launch_wave_id for update;
  select * into v_payment from public.admission_payment_evidence
  where invitation_id = v_invitation.id for update;

  select v_invitation.status = 'paid_eligible'
      and v_invitation.expires_at > statement_timestamp()
      and v_wave.status = 'open'
      and v_payment.eligibility = 'eligible'
      and (select count(*) from public.invitations admitted
           where admitted.launch_wave_id = v_wave.id
             and admitted.status in ('auth_invited', 'accepted')) < v_wave.maximum_admissions
    into v_gates_open;

  if coalesce(v_gates_open, false) then
    update public.invitations
    set auth_user_id = p_auth_user_id, status = 'auth_invited',
        auth_invited_at = statement_timestamp(), updated_at = statement_timestamp()
    where id = v_invitation.id;

    update public.admission_outbox
    set status = 'completed', completed_at = statement_timestamp(),
        last_result_code = trim(p_result_code), updated_at = statement_timestamp()
    where id = p_outbox_id;

    insert into public.admission_events (
      invitation_id, launch_wave_id, event_type, prior_status, next_status,
      actor_class, idempotency_key, result_code
    ) values (
      v_invitation.id, v_invitation.launch_wave_id, 'auth_user_invited',
      v_invitation.status, 'auth_invited', 'outbox_worker',
      'outbox:' || p_outbox_id::text || ':invite-completed', trim(p_result_code)
    ) on conflict (idempotency_key) do nothing;
    return 'AUTH_INVITED';
  end if;

  -- Auth may have succeeded immediately before eligibility changed. Persist the
  -- owned Auth id and enqueue a compensating, recoverable disable command.
  if v_invitation.status <> 'accepted' then
    update public.invitations
    set auth_user_id = coalesce(auth_user_id, p_auth_user_id), status = 'revoked',
        revoked_at = coalesce(revoked_at, statement_timestamp()),
        updated_at = statement_timestamp()
    where id = v_invitation.id;

    insert into public.admission_outbox (
      invitation_id, command_type, idempotency_key
    ) values (
      v_invitation.id, 'disable_unaccepted_auth_user',
      'disable:' || v_invitation.id::text || ':' || p_auth_user_id::text
    ) on conflict (idempotency_key) do nothing;
  end if;

  update public.admission_outbox
  set status = 'failed', completed_at = statement_timestamp(),
      last_result_code = 'ELIGIBILITY_CLOSED_AFTER_AUTH', updated_at = statement_timestamp()
  where id = p_outbox_id;
  return 'COMPENSATION_QUEUED';
end;
$$;

create function public.complete_admission_auth_disable(p_outbox_id uuid, p_result_code text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_outbox public.admission_outbox%rowtype;
  v_invitation public.invitations%rowtype;
begin
  if nullif(trim(p_result_code), '') is null then raise exception 'invalid disable completion'; end if;
  select * into v_outbox from public.admission_outbox where id = p_outbox_id for update;
  if not found or v_outbox.status <> 'processing'
    or v_outbox.command_type <> 'disable_unaccepted_auth_user' then
    raise exception 'outbox command is not claimable for disable completion';
  end if;
  select * into v_invitation from public.invitations
  where id = v_outbox.invitation_id for update;

  if v_invitation.status = 'accepted' then
    update public.admission_outbox
    set status = 'failed', completed_at = statement_timestamp(),
        last_result_code = 'ACCEPTED_USER_NOT_DISABLED', updated_at = statement_timestamp()
    where id = p_outbox_id;
    return 'ACCEPTED_USER_NOT_DISABLED';
  end if;

  update public.invitations
  set status = 'revoked', revoked_at = coalesce(revoked_at, statement_timestamp()),
      updated_at = statement_timestamp()
  where id = v_invitation.id;
  update public.admission_outbox
  set status = 'completed', completed_at = statement_timestamp(),
      last_result_code = trim(p_result_code), updated_at = statement_timestamp()
  where id = p_outbox_id;
  insert into public.admission_events (
    invitation_id, launch_wave_id, event_type, prior_status, next_status,
    actor_class, idempotency_key, result_code
  ) values (
    v_invitation.id, v_invitation.launch_wave_id, 'unaccepted_auth_user_disabled',
    v_invitation.status, 'revoked', 'outbox_worker',
    'outbox:' || p_outbox_id::text || ':disable-completed', trim(p_result_code)
  ) on conflict (idempotency_key) do nothing;
  return 'AUTH_USER_DISABLED';
end;
$$;

create function public.fail_admission_outbox(
  p_outbox_id uuid,
  p_result_code text,
  p_retryable boolean default true
)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_outbox public.admission_outbox%rowtype;
  v_terminal boolean;
begin
  if nullif(trim(p_result_code), '') is null or length(trim(p_result_code)) > 80 then
    raise exception 'invalid result code';
  end if;
  select * into v_outbox from public.admission_outbox where id = p_outbox_id for update;
  if not found or v_outbox.status <> 'processing' then
    raise exception 'outbox command is not processing';
  end if;
  v_terminal := not p_retryable or v_outbox.attempt_count >= 5;
  update public.admission_outbox
  set status = case when v_terminal then 'failed' else 'pending' end,
      available_at = case when v_terminal then available_at
        else statement_timestamp() + make_interval(secs => least(300, 5 * (2 ^ greatest(0, v_outbox.attempt_count - 1))::integer)) end,
      claimed_at = null, claimed_by = null,
      completed_at = case when v_terminal then statement_timestamp() else null end,
      last_result_code = trim(p_result_code), updated_at = statement_timestamp()
  where id = p_outbox_id;
  return case when v_terminal then 'FAILED' else 'RETRY_SCHEDULED' end;
end;
$$;

revoke all on function public.claim_admission_outbox(text, integer) from public, anon, authenticated;
revoke all on function public.complete_admission_auth_invite(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.complete_admission_auth_disable(uuid, text) from public, anon, authenticated;
revoke all on function public.fail_admission_outbox(uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.claim_admission_outbox(text, integer) to service_role;
grant execute on function public.complete_admission_auth_invite(uuid, uuid, text) to service_role;
grant execute on function public.complete_admission_auth_disable(uuid, text) to service_role;
grant execute on function public.fail_admission_outbox(uuid, text, boolean) to service_role;
