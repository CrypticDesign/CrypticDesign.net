-- CRY-491: provider-created Auth identities must not become usable members.

drop trigger if exists create_member_profile_after_signup on auth.users;
drop function if exists public.handle_new_member_account();

revoke insert, update, delete on public.member_profiles from public, anon, authenticated;

create or replace function public.create_member_character(
  p_id uuid,
  p_name text,
  p_handle text,
  p_archetype text,
  p_bio text,
  p_portrait_url text,
  p_avatar_recipe jsonb,
  p_affiliation text,
  p_request_id text
)
returns setof public.characters
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid := auth.uid();
  v_occurred_at timestamptz := statement_timestamp();
  v_scope text;
  v_hash text;
  v_existing public.character_idempotency%rowtype;
begin
  if v_account_id is null then raise exception 'Authentication required'; end if;
  if not exists (
    select 1 from public.member_profiles where account_id = v_account_id
  ) then
    raise exception 'Approved member profile required' using errcode = '42501';
  end if;
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
  values (p_id, v_account_id, 'member', p_name, p_handle, p_archetype, coalesce(p_bio, ''), p_portrait_url, p_avatar_recipe, p_affiliation, 'account-created', v_occurred_at, v_occurred_at);
  insert into public.character_history (character_id, actor_account_id, event_type, changed_fields, occurred_at)
  values (p_id, v_account_id, 'created', array['name','handle','archetype','bio','portraitUrl','avatarRecipe','affiliation'], v_occurred_at);
  insert into public.character_idempotency (scope, request_id, payload_hash, character_id)
  values (v_scope, p_request_id, v_hash, p_id);
  return query select * from public.characters where id = p_id;
end;
$$;

revoke all on function public.create_member_character(uuid,text,text,text,text,text,jsonb,text,text) from public, anon;
grant execute on function public.create_member_character(uuid,text,text,text,text,text,jsonb,text,text) to authenticated;
