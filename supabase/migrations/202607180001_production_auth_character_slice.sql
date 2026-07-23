-- CRY-335: free-member provisioning and transaction-safe, owner-scoped character writes.

create or replace function public.handle_new_member_account()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.member_profiles (account_id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1), 'Member'), 80)
  )
  on conflict (account_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_member_profile_after_signup on auth.users;
create trigger create_member_profile_after_signup
after insert on auth.users
for each row execute function public.handle_new_member_account();

create or replace function public.create_member_character(
  p_id uuid,
  p_name text,
  p_handle text,
  p_archetype text,
  p_bio text,
  p_portrait_url text,
  p_avatar_recipe jsonb,
  p_affiliation text,
  p_request_id text,
  p_occurred_at timestamptz
)
returns setof public.characters
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid := auth.uid();
  v_scope text;
  v_hash text;
  v_existing public.character_idempotency%rowtype;
begin
  if v_account_id is null then raise exception 'Authentication required'; end if;
  v_scope := 'create:' || v_account_id::text;
  v_hash := md5(jsonb_build_object('name', p_name, 'handle', p_handle, 'archetype', p_archetype, 'bio', p_bio, 'portrait', p_portrait_url, 'avatar', p_avatar_recipe, 'affiliation', p_affiliation)::text);

  select * into v_existing from public.character_idempotency where scope = v_scope and request_id = p_request_id;
  if found then
    if v_existing.payload_hash <> v_hash then raise exception 'Idempotency key was reused with different character data'; end if;
    return query select * from public.characters where id = v_existing.character_id;
    return;
  end if;
  if exists (select 1 from public.characters where owner_account_id = v_account_id and kind = 'member') then
    raise exception 'Account already has a character' using errcode = '23505';
  end if;

  insert into public.characters (id, owner_account_id, kind, name, handle, archetype, bio, portrait_url, avatar_recipe, affiliation, provenance, created_at, updated_at)
  values (p_id, v_account_id, 'member', p_name, p_handle, p_archetype, coalesce(p_bio, ''), p_portrait_url, p_avatar_recipe, p_affiliation, 'account-created', p_occurred_at, p_occurred_at);
  insert into public.character_history (character_id, actor_account_id, event_type, changed_fields, occurred_at)
  values (p_id, v_account_id, 'created', array['name','handle','archetype','bio','portraitUrl','avatarRecipe','affiliation'], p_occurred_at);
  insert into public.character_idempotency (scope, request_id, payload_hash, character_id)
  values (v_scope, p_request_id, v_hash, p_id);
  return query select * from public.characters where id = p_id;
end;
$$;

create or replace function public.update_member_character(
  p_character_id uuid,
  p_name text,
  p_handle text,
  p_archetype text,
  p_bio text,
  p_portrait_url text,
  p_avatar_recipe jsonb,
  p_affiliation text,
  p_presence public.character_presence,
  p_discoverable boolean,
  p_visibility public.character_visibility,
  p_publication_consent boolean,
  p_request_id text,
  p_occurred_at timestamptz
)
returns setof public.characters
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid := auth.uid();
  v_scope text;
  v_hash text;
  v_existing public.character_idempotency%rowtype;
begin
  if v_account_id is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.characters where id = p_character_id and owner_account_id = v_account_id and kind = 'member') then raise exception 'Character not found'; end if;
  v_scope := 'update:' || v_account_id::text || ':' || p_character_id::text;
  v_hash := md5(jsonb_build_object('name', p_name, 'handle', p_handle, 'archetype', p_archetype, 'bio', p_bio, 'portrait', p_portrait_url, 'avatar', p_avatar_recipe, 'affiliation', p_affiliation, 'presence', p_presence, 'discoverable', p_discoverable, 'visibility', p_visibility, 'consent', p_publication_consent)::text);
  select * into v_existing from public.character_idempotency where scope = v_scope and request_id = p_request_id;
  if found then
    if v_existing.payload_hash <> v_hash then raise exception 'Idempotency key was reused with different character data'; end if;
    return query select * from public.characters where id = p_character_id;
    return;
  end if;
  update public.characters set name = p_name, handle = p_handle, archetype = p_archetype, bio = coalesce(p_bio, ''), portrait_url = p_portrait_url, avatar_recipe = p_avatar_recipe, affiliation = p_affiliation, presence = p_presence, discoverable = p_discoverable, visibility = p_visibility, publication_consent = p_publication_consent, updated_at = p_occurred_at
  where id = p_character_id and owner_account_id = v_account_id;
  insert into public.character_history (character_id, actor_account_id, event_type, changed_fields, occurred_at)
  values (p_character_id, v_account_id, 'profile_updated', array['name','handle','archetype','bio','portraitUrl','avatarRecipe','affiliation','presence','discoverable','visibility','publicationConsent'], p_occurred_at);
  insert into public.character_idempotency (scope, request_id, payload_hash, character_id) values (v_scope, p_request_id, v_hash, p_character_id);
  return query select * from public.characters where id = p_character_id;
end;
$$;

create or replace function public.set_member_character_status(
  p_character_id uuid,
  p_status public.character_status,
  p_request_id text,
  p_occurred_at timestamptz
)
returns setof public.characters
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid := auth.uid();
  v_scope text;
  v_hash text;
  v_existing public.character_idempotency%rowtype;
begin
  if v_account_id is null then raise exception 'Authentication required'; end if;
  if p_status not in ('active', 'retired') then raise exception 'Members may only activate or retire their character'; end if;
  if not exists (select 1 from public.characters where id = p_character_id and owner_account_id = v_account_id and kind = 'member' and status <> 'suspended') then raise exception 'Character not found'; end if;
  v_scope := 'status:' || v_account_id::text || ':' || p_character_id::text;
  v_hash := md5(jsonb_build_object('status', p_status)::text);
  select * into v_existing from public.character_idempotency where scope = v_scope and request_id = p_request_id;
  if found then
    if v_existing.payload_hash <> v_hash then raise exception 'Idempotency key was reused with a different lifecycle action'; end if;
    return query select * from public.characters where id = p_character_id;
    return;
  end if;
  update public.characters set status = p_status, presence = case when p_status = 'retired' then 'offline'::public.character_presence else presence end, discoverable = case when p_status = 'retired' then false else discoverable end, updated_at = p_occurred_at where id = p_character_id and owner_account_id = v_account_id;
  insert into public.character_history (character_id, actor_account_id, event_type, changed_fields, occurred_at) values (p_character_id, v_account_id, 'status_changed', array['status','presence','discoverable'], p_occurred_at);
  insert into public.character_idempotency (scope, request_id, payload_hash, character_id) values (v_scope, p_request_id, v_hash, p_character_id);
  return query select * from public.characters where id = p_character_id;
end;
$$;

revoke all on function public.create_member_character(uuid,text,text,text,text,text,jsonb,text,text,timestamptz) from public, anon;
revoke all on function public.update_member_character(uuid,text,text,text,text,text,jsonb,text,public.character_presence,boolean,public.character_visibility,boolean,text,timestamptz) from public, anon;
revoke all on function public.set_member_character_status(uuid,public.character_status,text,timestamptz) from public, anon;
grant execute on function public.create_member_character(uuid,text,text,text,text,text,jsonb,text,text,timestamptz) to authenticated;
grant execute on function public.update_member_character(uuid,text,text,text,text,text,jsonb,text,public.character_presence,boolean,public.character_visibility,boolean,text,timestamptz) to authenticated;
grant execute on function public.set_member_character_status(uuid,public.character_status,text,timestamptz) to authenticated;

-- Automatic table exposure is disabled for this project. Grant only the reads
-- already constrained by the checked-in RLS policies; writes remain RPC-only.
grant select on public.member_profiles, public.characters, public.character_history to authenticated;
grant select on public.benefits, public.tier_definitions, public.tier_benefits, public.price_definitions to anon, authenticated;
grant select on public.subscriptions, public.subscription_events, public.entitlement_grants, public.entitlement_decisions to authenticated;
