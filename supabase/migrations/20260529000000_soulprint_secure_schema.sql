-- Soulprint secure production-minded schema
-- Run with Supabase CLI: supabase db push

create extension if not exists pgcrypto;
create extension if not exists vector;

create type app_role as enum ('owner', 'admin', 'editor', 'contributor', 'viewer', 'legacy_contact', 'executor_viewer');
create type profile_visibility as enum ('public', 'unlisted', 'family', 'private');
create type subscription_tier as enum ('free', 'family_legacy', 'forever_archive');
create type asset_status as enum ('pending_upload', 'pending_index', 'indexed', 'failed', 'quarantined');
create type estate_feature_status as enum ('disabled', 'beta', 'enabled');

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'viewer',
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique(family_id, user_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  tier subscription_tier not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  billing_status text not null default 'free',
  current_period_end timestamptz,
  storage_limit_gb integer not null default 1,
  profile_limit integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.soulprint_profiles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  slug text not null unique,
  full_name text not null,
  headline text,
  birth_date date,
  death_date date,
  biography text,
  visibility profile_visibility not null default 'private',
  cover_asset_id uuid,
  ancestry_url text,
  familysearch_url text,
  myheritage_url text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_relationships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  from_profile_id uuid not null references public.soulprint_profiles(id) on delete cascade,
  to_profile_id uuid not null references public.soulprint_profiles(id) on delete cascade,
  relationship_type text not null,
  created_at timestamptz not null default now(),
  constraint no_self_relationship check (from_profile_id <> to_profile_id)
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  profile_id uuid references public.soulprint_profiles(id) on delete set null,
  uploaded_by uuid not null references auth.users(id),
  bucket text not null default 'memory-assets',
  storage_path text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  title text,
  description text,
  tags text[] not null default '{}',
  status asset_status not null default 'pending_index',
  extracted_text text,
  indexed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(bucket, storage_path)
);

create table public.asset_chunks (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  unique(asset_id, chunk_index)
);

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  profile_id uuid not null references public.soulprint_profiles(id) on delete cascade,
  title text not null,
  body text,
  event_date date,
  asset_id uuid references public.assets(id) on delete set null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.tributes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.soulprint_profiles(id) on delete cascade,
  author_name text not null,
  author_email text,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.estate_vault_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid references public.soulprint_profiles(id) on delete set null,
  title text not null,
  item_type text not null,
  notes text,
  asset_id uuid references public.assets(id) on delete set null,
  feature_status estate_feature_status not null default 'disabled',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  created_at timestamptz not null default now()
);

insert into public.feature_flags (key, enabled, description)
values
  ('estate_vault', false, 'Estate planning and legal document vault. Disabled until legal review/partner launch.'),
  ('ai_story_builder', false, 'AI story drafting and memory organization.'),
  ('advanced_indexing', true, 'Upload indexing queue and searchable extracted content.')
on conflict (key) do nothing;

create index assets_family_profile_idx on public.assets(family_id, profile_id);
create index asset_chunks_family_idx on public.asset_chunks(family_id);
create index soulprint_profiles_visibility_idx on public.soulprint_profiles(visibility);
create index timeline_events_profile_idx on public.timeline_events(profile_id, event_date);
create index assets_search_idx on public.assets using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(extracted_text,'')));

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.family_memberships
    where family_id = target_family_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_family_role(target_family_id uuid, allowed_roles app_role[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.family_memberships
    where family_id = target_family_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create or replace function public.prevent_privilege_escalation()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and old.role is distinct from new.role then
    raise exception 'Role changes must be performed by a secure server function.';
  end if;
  return new;
end;
$$;

create trigger family_memberships_no_client_role_update
before update of role on public.family_memberships
for each row execute function public.prevent_privilege_escalation();

alter table public.user_profiles enable row level security;
alter table public.families enable row level security;
alter table public.family_memberships enable row level security;
alter table public.subscriptions enable row level security;
alter table public.soulprint_profiles enable row level security;
alter table public.profile_relationships enable row level security;
alter table public.assets enable row level security;
alter table public.asset_chunks enable row level security;
alter table public.timeline_events enable row level security;
alter table public.tributes enable row level security;
alter table public.estate_vault_items enable row level security;
alter table public.audit_logs enable row level security;
alter table public.feature_flags enable row level security;

create policy "Users can read own profile"
on public.user_profiles for select
using (id = auth.uid());

create policy "Users can insert own profile"
on public.user_profiles for insert
with check (id = auth.uid());

create policy "Users can update own non-privileged profile"
on public.user_profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Members can read families"
on public.families for select
using (public.is_family_member(id));

create policy "Users can insert own family"
on public.families for insert
with check (owner_id = auth.uid());

create policy "Family owners can update family"
on public.families for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Members can read memberships"
on public.family_memberships for select
using (public.is_family_member(family_id));

create policy "Users can insert own family membership"
on public.family_memberships for insert
with check (
  user_id = auth.uid() 
  or public.has_family_role(family_id, array['owner','admin']::app_role[])
);

create policy "Users can read own subscription"
on public.subscriptions for select
using (user_id = auth.uid());

-- No client insert/update/delete policies on subscriptions.
-- Billing tier, storage limit, and subscription status are only updated by Stripe webhook using service role.

create policy "Public can read public profiles"
on public.soulprint_profiles for select
using (visibility in ('public', 'unlisted') or public.is_family_member(family_id));

create policy "Editors can create profiles"
on public.soulprint_profiles for insert
with check (
  public.has_family_role(family_id, array['owner','admin','editor']::app_role[])
  and created_by = auth.uid()
);

create policy "Editors can update profiles"
on public.soulprint_profiles for update
using (public.has_family_role(family_id, array['owner','admin','editor']::app_role[]))
with check (public.has_family_role(family_id, array['owner','admin','editor']::app_role[]));

create policy "Members can read relationships"
on public.profile_relationships for select
using (public.is_family_member(family_id));

create policy "Editors can manage relationships"
on public.profile_relationships for all
using (public.has_family_role(family_id, array['owner','admin','editor']::app_role[]))
with check (public.has_family_role(family_id, array['owner','admin','editor']::app_role[]));

create policy "Members can read assets"
on public.assets for select
using (public.is_family_member(family_id));

create policy "Contributors can add assets"
on public.assets for insert
with check (
  public.has_family_role(family_id, array['owner','admin','editor','contributor']::app_role[])
  and uploaded_by = auth.uid()
);

create policy "Editors can update asset metadata"
on public.assets for update
using (public.has_family_role(family_id, array['owner','admin','editor']::app_role[]))
with check (public.has_family_role(family_id, array['owner','admin','editor']::app_role[]));

create policy "Members can read indexed chunks"
on public.asset_chunks for select
using (public.is_family_member(family_id));

create policy "Members can read timeline"
on public.timeline_events for select
using (public.is_family_member(family_id));

create policy "Editors can manage timeline"
on public.timeline_events for all
using (public.has_family_role(family_id, array['owner','admin','editor']::app_role[]))
with check (public.has_family_role(family_id, array['owner','admin','editor']::app_role[]));

create policy "Public can submit tribute"
on public.tributes for insert
with check (true);

create policy "Public can read approved tributes"
on public.tributes for select
using (approved = true);

create policy "Members can read vault only while feature enabled"
on public.estate_vault_items for select
using (
  public.is_family_member(family_id)
  and exists (select 1 from public.feature_flags where key = 'estate_vault' and enabled = true)
);

create policy "Members can read relevant audit logs"
on public.audit_logs for select
using (family_id is not null and public.has_family_role(family_id, array['owner','admin']::app_role[]));

create policy "Anyone can read feature flags"
on public.feature_flags for select
using (true);

-- Storage policies for private bucket memory-assets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-assets',
  'memory-assets',
  false,
  1073741824,
  array['image/jpeg','image/png','image/webp','video/mp4','audio/mpeg','audio/mp4','application/pdf','text/plain']
)
on conflict (id) do update
set public = false,
    file_size_limit = 1073741824,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public)
values ('brand', 'brand', true)
on conflict (id) do update set public = true;
