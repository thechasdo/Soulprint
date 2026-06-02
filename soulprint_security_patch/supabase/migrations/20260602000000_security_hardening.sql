-- Soulprint security hardening migration
-- Date: 2026-06-02
-- Run after the original 20260529000000_soulprint_secure_schema.sql migration.

alter table public.assets
  add column if not exists asset_type text not null default 'other'
  check (asset_type in ('photo', 'voice', 'video', 'document', 'other'));

drop policy if exists "Users can insert own family membership" on public.family_memberships;

create policy "Family owners and admins can add safe memberships"
on public.family_memberships
for insert
with check (
  (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1
      from public.families f
      where f.id = family_id
        and f.owner_id = auth.uid()
    )
  )
  or
  (
    public.has_family_role(family_id, array['owner','admin']::app_role[])
    and role <> 'owner'
  )
);

drop policy if exists "Public can read public profiles" on public.soulprint_profiles;

create policy "Public can read public profiles"
on public.soulprint_profiles
for select
using (visibility = 'public');

create policy "Family members can read family profiles"
on public.soulprint_profiles
for select
using (public.is_family_member(family_id));

drop policy if exists "Public can submit tribute" on public.tributes;
drop policy if exists "Public can read approved tributes" on public.tributes;

create policy "Public can submit tribute to public profiles"
on public.tributes
for insert
with check (
  approved = false
  and exists (
    select 1
    from public.soulprint_profiles p
    where p.id = profile_id
      and p.visibility = 'public'
  )
);

create policy "Public can read approved tributes on public profiles"
on public.tributes
for select
using (
  approved = true
  and exists (
    select 1
    from public.soulprint_profiles p
    where p.id = profile_id
      and p.visibility = 'public'
  )
);

create policy "Family members can read approved family tributes"
on public.tributes
for select
using (
  approved = true
  and exists (
    select 1
    from public.soulprint_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

-- Private storage policies for memory-assets.
-- Required path convention: memory-assets/{family_id}/{profile_id}/{uuid}-{filename}
drop policy if exists "Members can read memory assets" on storage.objects;
drop policy if exists "Contributors can upload memory assets" on storage.objects;
drop policy if exists "Editors can update memory assets" on storage.objects;
drop policy if exists "Editors can delete memory assets" on storage.objects;

create policy "Members can read memory assets"
on storage.objects
for select
using (
  bucket_id = 'memory-assets'
  and public.is_family_member(((storage.foldername(name))[1])::uuid)
);

create policy "Contributors can upload memory assets"
on storage.objects
for insert
with check (
  bucket_id = 'memory-assets'
  and public.has_family_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','editor','contributor']::app_role[]
  )
);

create policy "Editors can update memory assets"
on storage.objects
for update
using (
  bucket_id = 'memory-assets'
  and public.has_family_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','editor']::app_role[]
  )
)
with check (
  bucket_id = 'memory-assets'
  and public.has_family_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','editor']::app_role[]
  )
);

create policy "Editors can delete memory assets"
on storage.objects
for delete
using (
  bucket_id = 'memory-assets'
  and public.has_family_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','editor']::app_role[]
  )
);
