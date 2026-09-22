-- CRY-522 temporary production acceptance grant.
-- Execute each section separately. Do not run this file as one batch.

-- 1. CREATE: one exact, automatically expiring grant for @robertkcroft.
with target_member as (
  select distinct mp.id
  from public.member_profiles mp
  join public.characters c on c.owner_account_id = mp.account_id
  where c.handle = 'robertkcroft'
    and c.kind = 'member'
)
insert into public.entitlement_grants (
  member_id,
  resource,
  action,
  source,
  source_id,
  effective_at,
  expires_at
)
select
  id,
  'experience:singularis',
  'execute-development',
  'administration',
  'cry-522-acceptance-2026-09-21',
  now(),
  now() + interval '30 minutes'
from target_member
where (select count(*) from target_member) = 1
returning resource, action, source, source_id, effective_at, expires_at, revoked_at;

-- 2. VERIFY: confirm the exact grant is active without exposing identifiers.
select
  count(*) as exact_grants_total,
  count(*) filter (
    where effective_at <= now()
      and (expires_at is null or expires_at > now())
      and revoked_at is null
  ) as active_exact_grants
from public.entitlement_grants
where resource = 'experience:singularis'
  and action = 'execute-development'
  and source = 'administration'
  and source_id = 'cry-522-acceptance-2026-09-21';

-- 3. REVOKE: execute immediately after the acceptance checks.
update public.entitlement_grants
set
  revoked_at = now(),
  revocation_reason = 'CRY-522 production acceptance verification completed'
where resource = 'experience:singularis'
  and action = 'execute-development'
  and source = 'administration'
  and source_id = 'cry-522-acceptance-2026-09-21'
  and revoked_at is null
returning resource, action, source, source_id, effective_at, expires_at, revoked_at;

-- 4. POST-REVOKE VERIFY: expect active_exact_grants = 0.
select
  count(*) as exact_grants_total,
  count(*) filter (
    where effective_at <= now()
      and (expires_at is null or expires_at > now())
      and revoked_at is null
  ) as active_exact_grants
from public.entitlement_grants
where resource = 'experience:singularis'
  and action = 'execute-development'
  and source = 'administration'
  and source_id = 'cry-522-acceptance-2026-09-21';
