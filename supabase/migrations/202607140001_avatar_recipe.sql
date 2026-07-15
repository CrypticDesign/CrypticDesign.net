-- Portable schema proposal only. Applying production migrations remains separately gated.
alter table public.characters add column avatar_recipe jsonb not null default '{"schemaVersion":1,"rigId":"cryptic-humanoid-v1","skinTone":"copper","outfit":"signal","accent":"cyan","trait":"none"}'::jsonb;
alter table public.characters add constraint valid_avatar_recipe_v1 check (
  avatar_recipe->>'schemaVersion' = '1'
  and avatar_recipe->>'rigId' = 'cryptic-humanoid-v1'
  and avatar_recipe->>'skinTone' in ('umber','copper','sand','moon')
  and avatar_recipe->>'outfit' in ('signal','archive','drift')
  and avatar_recipe->>'accent' in ('cyan','gold','magenta','green')
  and avatar_recipe->>'trait' in ('none','crest','antennae')
);
