-- Soulprint fresh-start Supabase schema
-- Revision date: 2026-06-07
-- Use this on a new/empty Supabase project.
-- Public wording: internal authenticated records are Soulprint Profiles; public pages are Soulprint pages.

create extension if not exists pgcrypto;
create extension if not exists vector;

create type public.app_role as enum (
  'owner',
  'admin',
  'editor',
  'contributor',
  'viewer',
  'legacy_contact',
  'executor_viewer'
);

create type public.profile_visibility as enum (
  'public',
  'unlisted',
  'family',
  'private'
);

create type public.subscription_tier as enum (
  'free',
  'family_legacy',
  'forever_archive'
);

create type public.asset_status as enum (
  'pending_upload',
  'pending_index',
  'indexed',
  'failed',
  'quarantined'
);

create type public.estate_feature_status as enum (
  'disabled',
  'beta',
  'enabled'
);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_memberships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'viewer',
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(family_id, user_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  tier public.subscription_tier not null default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  billing_status text not null default 'free',
  current_period_end timestamptz,
  storage_limit_gb integer not null default 1,
  profile_limit integer not null default 1,
  upload_limit integer,
  estate_vault_enabled boolean not null default false,
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
  visibility public.profile_visibility not null default 'private',
  cover_asset_id uuid,
  ancestry_url text,
  familysearch_url text,
  myheritage_url text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint soulprint_profiles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
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
  size_bytes bigint not null check (size_bytes > 0),
  asset_type text not null default 'other' check (asset_type in ('photo', 'voice', 'video', 'document', 'other')),
  title text,
  description text,
  tags text[] not null default '{}',
  status public.asset_status not null default 'pending_index',
  extracted_text text,
  indexed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(bucket, storage_path)
);

alter table public.soulprint_profiles
  add constraint soulprint_profiles_cover_asset_id_fkey
  foreign key (cover_asset_id) references public.assets(id) on delete set null;

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tributes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.soulprint_profiles(id) on delete cascade,
  author_name text not null,
  author_email text,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  feature_status public.estate_feature_status not null default 'disabled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscription_addons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  addon_id text not null,
  addon_name text not null,
  billing_type text not null check (billing_type in ('recurring', 'one_time')),
  billing_interval text not null check (billing_interval in ('monthly', 'yearly', 'one_time')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text,
  stripe_price_id text not null,
  status text not null default 'active',
  extra_storage_gb integer not null default 0,
  ai_story_builder_enabled boolean not null default false,
  fulfillment_required boolean not null default false,
  fulfillment_status text not null default 'not_required',
  current_period_end timestamptz,
  purchased_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_archive_migration_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  email text not null check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  current_plan text not null default 'Not sure' check (
    current_plan in ('Memory Seed', 'Family Legacy', 'Forever Archive', 'Not a customer yet', 'Not sure')
  ),
  approximate_file_count text not null default 'Not sure' check (
    approximate_file_count in ('Under 500', '500-2,000', '2,000-5,000', '5,000+', 'Not sure')
  ),
  estimated_archive_size text not null default 'Not sure' check (
    estimated_archive_size in ('Under 5 GB', '5-25 GB', '25-100 GB', '100+ GB', 'Not sure')
  ),
  file_types text[] not null default '{}',
  current_storage_location text,
  organization_help_needed boolean,
  migration_level text not null default 'not_sure' check (
    migration_level in ('upload_only', 'full_migration', 'not_sure')
  ),
  notes text,
  recommended_price integer check (recommended_price in (149, 199, 299)),
  quote_status text not null default 'new' check (
    quote_status in ('new', 'reviewing', 'quoted', 'invoiced', 'paid', 'completed', 'cancelled')
  ),
  stripe_customer_id text,
  stripe_quote_id text,
  stripe_invoice_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table public.plan_catalog (
  id public.subscription_tier primary key,
  public_name text not null,
  badge text,
  best_for text not null,
  monthly_price_cents integer not null default 0,
  yearly_price_cents integer not null default 0,
  annual_savings_claim text,
  storage_limit_gb integer not null,
  profile_limit integer not null,
  upload_limit integer,
  contributor_limit integer,
  search_level text not null,
  permissions_level text not null,
  genealogy_level text not null,
  estate_vault_access text not null,
  recommended boolean not null default false,
  features jsonb not null default '[]'::jsonb,
  revision_version text not null default 'v1.0',
  revision_date date not null default date '2026-06-04',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addon_catalog (
  id text primary key,
  public_name text not null,
  price_label text not null,
  billing_type text not null check (billing_type in ('recurring', 'one_time', 'future')),
  notes text not null,
  availability text not null default 'available',
  is_enabled boolean not null default true,
  entitlement jsonb not null default '{}'::jsonb,
  revision_version text not null default 'v1.0',
  revision_date date not null default date '2026-06-04',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addon_price_options (
  id text primary key,
  addon_id text not null references public.addon_catalog(id) on delete cascade,
  option_id text not null,
  public_label text not null,
  amount_cents integer,
  recurring_interval text check (recurring_interval in ('monthly', 'yearly', 'one_time')),
  stripe_env text,
  checkout_enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(addon_id, option_id)
);

insert into public.plan_catalog (
  id, public_name, badge, best_for, monthly_price_cents, yearly_price_cents, annual_savings_claim,
  storage_limit_gb, profile_limit, upload_limit, contributor_limit,
  search_level, permissions_level, genealogy_level, estate_vault_access, recommended, features
)
values
  (
    'free', 'Memory Seed', 'Free Starter Plan', 'trying Soulprint', 0, 0, null,
    1, 1, 50, 3,
    'Basic keyword', '3 contributors', 'Basic profile', 'Not included', false,
    '["1 Soulprint", "1 GB secure storage", "50 memory uploads", "Basic Soulprint", "Photos, written stories, and documents", "Basic timeline and search", "3 invited contributors"]'::jsonb
  ),
  (
    'family_legacy', 'Family Legacy', 'Recommended', 'most families', 899, 8630, '20% savings compared with monthly billing',
    25, 5, null, null,
    'Indexed uploads', 'Family roles', 'Family links', 'Future add-on', true,
    '["Up to 5 Soulprints", "25 GB secure storage", "Photos, videos, audio, and documents", "Timeline builder and prompts", "Private family permissions", "Indexed uploads for search", "QR code sharing", "Annual export tools"]'::jsonb
  ),
  (
    'forever_archive', 'Forever Archive', 'Premium Archive', 'serious preservation', 1999, 19190, '20% savings compared with monthly billing',
    100, 25, null, null,
    'Advanced indexing-ready', 'Legacy contacts', 'Ancestry links', 'Included when released', false,
    '["Up to 25 Soulprints", "100 GB secure storage", "Advanced upload indexing", "OCR/transcription-ready architecture", "Legacy contact access controls", "Family tree and Ancestry link fields", "Premium Soulprint themes", "Estate Vault access when released"]'::jsonb
  );

insert into public.addon_catalog (id, public_name, price_label, billing_type, notes, availability, is_enabled, entitlement)
values
  ('extra_25gb_storage', 'Extra 25 GB Storage', '$3/mo or $28.80/yr', 'recurring', 'Additional storage block for accounts that need more space.', 'available', true, '{"extraStorageGb": 25}'::jsonb),
  ('extra_100gb_storage', 'Extra 100 GB Storage', '$8/mo or $76.80/yr', 'recurring', 'Larger storage block for heavier photo, video, audio, and document archives.', 'available', true, '{"extraStorageGb": 100}'::jsonb),
  ('ai_story_builder', 'AI Story Builder', '$5/mo or $48/yr', 'recurring', 'Premium storytelling assistant for turning memories into written stories.', 'available', true, '{"aiStoryBuilder": true}'::jsonb),
  ('soulprint_qr_code_kit', 'Soulprint QR Code Kit', '$19 digital / $49 printed', 'one_time', 'Digital QR kit or printed QR keepsake option for Soulprint sharing.', 'available', true, '{"fulfillmentRequired": true}'::jsonb),
  ('printed_memory_book', 'Printed Memory Book', 'Starting at $79', 'one_time', 'Printed keepsake book. Final cost may vary by print specifications.', 'available', true, '{"fulfillmentRequired": true}'::jsonb),
  ('white_glove_setup', 'White-glove Setup', '$99 one-time', 'one_time', 'Assisted onboarding and setup support.', 'available', true, '{"fulfillmentRequired": true}'::jsonb),
  ('family_archive_migration', 'Family Archive Migration', '$149-$299 one-time', 'one_time', 'Migration support priced by archive size and complexity.', 'available', true, '{"fulfillmentRequired": true}'::jsonb),
  ('estate_vault', 'Estate Vault', 'Built now; disabled until launch', 'future', 'Future add-on for lower tiers. Included with Forever Archive when released.', 'disabled_until_launch', false, '{"estateVault": true}'::jsonb);

insert into public.addon_price_options (id, addon_id, option_id, public_label, amount_cents, recurring_interval, stripe_env, checkout_enabled, sort_order)
values
  ('extra_25gb_storage_monthly', 'extra_25gb_storage', 'monthly', 'Extra 25 GB Storage - Monthly', 300, 'monthly', 'STRIPE_PRICE_EXTRA_25GB_STORAGE_MONTHLY', true, 10),
  ('extra_25gb_storage_yearly', 'extra_25gb_storage', 'yearly', 'Extra 25 GB Storage - Annual', 2880, 'yearly', 'STRIPE_PRICE_EXTRA_25GB_STORAGE_YEARLY', true, 20),
  ('extra_100gb_storage_monthly', 'extra_100gb_storage', 'monthly', 'Extra 100 GB Storage - Monthly', 800, 'monthly', 'STRIPE_PRICE_EXTRA_100GB_STORAGE_MONTHLY', true, 10),
  ('extra_100gb_storage_yearly', 'extra_100gb_storage', 'yearly', 'Extra 100 GB Storage - Annual', 7680, 'yearly', 'STRIPE_PRICE_EXTRA_100GB_STORAGE_YEARLY', true, 20),
  ('ai_story_builder_monthly', 'ai_story_builder', 'monthly', 'AI Story Builder - Monthly', 500, 'monthly', 'STRIPE_PRICE_AI_STORY_BUILDER_MONTHLY', true, 10),
  ('ai_story_builder_yearly', 'ai_story_builder', 'yearly', 'AI Story Builder - Annual', 4800, 'yearly', 'STRIPE_PRICE_AI_STORY_BUILDER_YEARLY', true, 20),
  ('soulprint_qr_code_kit_digital', 'soulprint_qr_code_kit', 'digital', 'Soulprint QR Code Kit - Digital', 1900, 'one_time', 'STRIPE_PRICE_SOULPRINT_QR_KIT_DIGITAL', true, 10),
  ('soulprint_qr_code_kit_printed', 'soulprint_qr_code_kit', 'printed', 'Soulprint QR Code Kit - Printed', 4900, 'one_time', 'STRIPE_PRICE_SOULPRINT_QR_KIT_PRINTED', true, 20),
  ('printed_memory_book_starting', 'printed_memory_book', 'starting', 'Printed Memory Book - Starting Price', 7900, 'one_time', 'STRIPE_PRICE_PRINTED_MEMORY_BOOK_STARTING', true, 10),
  ('white_glove_setup_standard', 'white_glove_setup', 'standard', 'White-glove Setup', 9900, 'one_time', 'STRIPE_PRICE_WHITE_GLOVE_SETUP', true, 10),
  ('family_archive_migration_standard', 'family_archive_migration', 'standard', 'Family Archive Migration - Standard', 14900, 'one_time', 'STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_STANDARD', true, 10),
  ('family_archive_migration_plus', 'family_archive_migration', 'plus', 'Family Archive Migration - Plus', 19900, 'one_time', 'STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_PLUS', true, 20),
  ('family_archive_migration_large', 'family_archive_migration', 'large', 'Family Archive Migration - Large Archive', 29900, 'one_time', 'STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_LARGE', true, 30);

insert into public.feature_flags (key, enabled, description)
values
  ('estate_vault', false, 'Estate planning and legal document vault. Disabled until legal review/partner launch.'),
  ('ai_story_builder', false, 'AI story drafting and family story organization.'),
  ('advanced_indexing', true, 'Upload indexing queue and searchable extracted content.')
on conflict (key) do nothing;

create index families_owner_id_idx on public.families(owner_id);
create index family_memberships_user_id_idx on public.family_memberships(user_id);
create index family_memberships_family_id_idx on public.family_memberships(family_id);
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index soulprint_profiles_family_id_idx on public.soulprint_profiles(family_id);
create index soulprint_profiles_visibility_idx on public.soulprint_profiles(visibility);
create index soulprint_profiles_slug_idx on public.soulprint_profiles(slug);
create index assets_family_profile_idx on public.assets(family_id, profile_id);
create index assets_uploaded_by_idx on public.assets(uploaded_by);
create index assets_status_idx on public.assets(status);
create index assets_search_idx on public.assets using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(extracted_text,'')));
create index asset_chunks_family_idx on public.asset_chunks(family_id);
create index timeline_events_profile_idx on public.timeline_events(profile_id, event_date);
create index tributes_profile_approved_idx on public.tributes(profile_id, approved);
create index subscription_addons_user_id_idx on public.subscription_addons(user_id);
create index subscription_addons_status_idx on public.subscription_addons(status);
create unique index subscription_addons_recurring_unique
  on public.subscription_addons (user_id, addon_id, stripe_price_id)
  where billing_type = 'recurring';
create index family_archive_migration_requests_created_at_idx on public.family_archive_migration_requests (created_at desc);
create index family_archive_migration_requests_quote_status_idx on public.family_archive_migration_requests (quote_status);
create index family_archive_migration_requests_email_idx on public.family_archive_migration_requests (lower(email));
create index addon_price_options_addon_id_idx on public.addon_price_options(addon_id);
create index addon_price_options_checkout_enabled_idx on public.addon_price_options(checkout_enabled);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_profiles_updated_at before update on public.user_profiles for each row execute function public.set_updated_at();
create trigger set_families_updated_at before update on public.families for each row execute function public.set_updated_at();
create trigger set_family_memberships_updated_at before update on public.family_memberships for each row execute function public.set_updated_at();
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger set_soulprint_profiles_updated_at before update on public.soulprint_profiles for each row execute function public.set_updated_at();
create trigger set_assets_updated_at before update on public.assets for each row execute function public.set_updated_at();
create trigger set_timeline_events_updated_at before update on public.timeline_events for each row execute function public.set_updated_at();
create trigger set_tributes_updated_at before update on public.tributes for each row execute function public.set_updated_at();
create trigger set_estate_vault_items_updated_at before update on public.estate_vault_items for each row execute function public.set_updated_at();
create trigger set_feature_flags_updated_at before update on public.feature_flags for each row execute function public.set_updated_at();
create trigger set_subscription_addons_updated_at before update on public.subscription_addons for each row execute function public.set_updated_at();
create trigger set_family_archive_migration_requests_updated_at before update on public.family_archive_migration_requests for each row execute function public.set_updated_at();
create trigger set_plan_catalog_updated_at before update on public.plan_catalog for each row execute function public.set_updated_at();
create trigger set_addon_catalog_updated_at before update on public.addon_catalog for each row execute function public.set_updated_at();
create trigger set_addon_price_options_updated_at before update on public.addon_price_options for each row execute function public.set_updated_at();

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_memberships
    where family_id = target_family_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_family_role(target_family_id uuid, allowed_roles public.app_role[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_memberships
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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_family_id uuid;
  display text;
begin
  display := coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1), 'Soulprint');

  insert into public.user_profiles (id, display_name, avatar_url)
  values (new.id, display, new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, tier, billing_status, storage_limit_gb, profile_limit, upload_limit, estate_vault_enabled)
  values (new.id, 'free', 'free', 1, 1, 50, false)
  on conflict (user_id) do nothing;

  insert into public.families (name, owner_id)
  values (display || '''s Family', new.id)
  returning id into default_family_id;

  insert into public.family_memberships (family_id, user_id, role)
  values (default_family_id, new.id, 'owner')
  on conflict (family_id, user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

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
alter table public.subscription_addons enable row level security;
alter table public.family_archive_migration_requests enable row level security;
alter table public.plan_catalog enable row level security;
alter table public.addon_catalog enable row level security;
alter table public.addon_price_options enable row level security;

create policy "Users can read own user profile" on public.user_profiles
for select using (id = auth.uid());

create policy "Users can insert own user profile" on public.user_profiles
for insert with check (id = auth.uid());

create policy "Users can update own user profile" on public.user_profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Family members can read families" on public.families
for select using (public.is_family_member(id));

create policy "Users can create owned families" on public.families
for insert with check (owner_id = auth.uid());

create policy "Family owners can update families" on public.families
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Family owners can delete families" on public.families
for delete using (owner_id = auth.uid());

create policy "Family members can read memberships" on public.family_memberships
for select using (public.is_family_member(family_id));

create policy "Owners and admins can add safe memberships" on public.family_memberships
for insert with check (
  (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from public.families f
      where f.id = family_id
        and f.owner_id = auth.uid()
    )
  )
  or
  (
    public.has_family_role(family_id, array['owner','admin']::public.app_role[])
    and role <> 'owner'
  )
);

create policy "Owners and admins can remove memberships" on public.family_memberships
for delete using (public.has_family_role(family_id, array['owner','admin']::public.app_role[]));

create policy "Users can read own subscription" on public.subscriptions
for select using (user_id = auth.uid());

create policy "Public can read public and unlisted Soulprint pages" on public.soulprint_profiles
for select using (
  visibility in ('public', 'unlisted')
  or public.is_family_member(family_id)
);

create policy "Editors can create Soulprint Profiles" on public.soulprint_profiles
for insert with check (
  public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[])
  and created_by = auth.uid()
);

create policy "Editors can update Soulprint Profiles" on public.soulprint_profiles
for update using (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]))
with check (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]));

create policy "Editors can delete Soulprint Profiles" on public.soulprint_profiles
for delete using (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]));

create policy "Family members can read relationships" on public.profile_relationships
for select using (public.is_family_member(family_id));

create policy "Editors can manage relationships" on public.profile_relationships
for all using (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]))
with check (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]));

create policy "Members and public Soulprint pages can read asset metadata" on public.assets
for select using (
  public.is_family_member(family_id)
  or exists (
    select 1 from public.soulprint_profiles p
    where p.id = profile_id
      and p.visibility in ('public', 'unlisted')
  )
);

create policy "Contributors can add assets" on public.assets
for insert with check (
  public.has_family_role(family_id, array['owner','admin','editor','contributor']::public.app_role[])
  and uploaded_by = auth.uid()
);

create policy "Editors can update asset metadata" on public.assets
for update using (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]))
with check (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]));

create policy "Editors can delete assets" on public.assets
for delete using (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]));

create policy "Family members can read indexed chunks" on public.asset_chunks
for select using (public.is_family_member(family_id));

create policy "Members and public Soulprint pages can read timeline" on public.timeline_events
for select using (
  public.is_family_member(family_id)
  or exists (
    select 1 from public.soulprint_profiles p
    where p.id = profile_id
      and p.visibility in ('public', 'unlisted')
  )
);

create policy "Editors can manage timeline" on public.timeline_events
for all using (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]))
with check (public.has_family_role(family_id, array['owner','admin','editor']::public.app_role[]));

create policy "Public can submit tributes to public Soulprint pages" on public.tributes
for insert with check (
  approved = false
  and exists (
    select 1 from public.soulprint_profiles p
    where p.id = profile_id
      and p.visibility in ('public', 'unlisted')
  )
);

create policy "Public can read approved tributes on public Soulprint pages" on public.tributes
for select using (
  approved = true
  and exists (
    select 1 from public.soulprint_profiles p
    where p.id = profile_id
      and p.visibility in ('public', 'unlisted')
  )
);

create policy "Family members can read approved family tributes" on public.tributes
for select using (
  approved = true
  and exists (
    select 1 from public.soulprint_profiles p
    where p.id = profile_id
      and public.is_family_member(p.family_id)
  )
);

create policy "Editors can manage family tributes" on public.tributes
for all using (
  exists (
    select 1 from public.soulprint_profiles p
    where p.id = profile_id
      and public.has_family_role(p.family_id, array['owner','admin','editor']::public.app_role[])
  )
)
with check (
  exists (
    select 1 from public.soulprint_profiles p
    where p.id = profile_id
      and public.has_family_role(p.family_id, array['owner','admin','editor']::public.app_role[])
  )
);

create policy "Family members can read vault while enabled" on public.estate_vault_items
for select using (
  public.is_family_member(family_id)
  and exists (select 1 from public.feature_flags where key = 'estate_vault' and enabled = true)
);

create policy "Owners and admins can manage vault while enabled" on public.estate_vault_items
for all using (
  public.has_family_role(family_id, array['owner','admin']::public.app_role[])
  and exists (select 1 from public.feature_flags where key = 'estate_vault' and enabled = true)
)
with check (
  public.has_family_role(family_id, array['owner','admin']::public.app_role[])
  and exists (select 1 from public.feature_flags where key = 'estate_vault' and enabled = true)
);

create policy "Owners and admins can read audit logs" on public.audit_logs
for select using (family_id is not null and public.has_family_role(family_id, array['owner','admin']::public.app_role[]));

create policy "Anyone can read feature flags" on public.feature_flags
for select using (true);

create policy "Anyone can read launch plans" on public.plan_catalog
for select using (true);

create policy "Anyone can read launch add-ons" on public.addon_catalog
for select using (true);

create policy "Anyone can read checkout-enabled add-on options" on public.addon_price_options
for select using (checkout_enabled = true);

create policy "Users can view their own add-ons" on public.subscription_addons
for select using (auth.uid() = user_id);

create policy "Authenticated users can create their own migration requests" on public.family_archive_migration_requests
for insert to authenticated with check (user_id = auth.uid());

create policy "Authenticated users can view their own migration requests" on public.family_archive_migration_requests
for select to authenticated using (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memory-assets',
  'memory-assets',
  false,
  1073741824,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/x-wav',
    'application/pdf',
    'text/plain'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public)
values ('brand', 'brand', true)
on conflict (id) do update set public = true;

create policy "Public can read brand storage" on storage.objects
for select using (bucket_id = 'brand');

create policy "Family members can read private Soulprint assets" on storage.objects
for select using (
  bucket_id = 'memory-assets'
  and public.is_family_member(((storage.foldername(name))[1])::uuid)
);

create policy "Contributors can upload private Soulprint assets" on storage.objects
for insert with check (
  bucket_id = 'memory-assets'
  and public.has_family_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','editor','contributor']::public.app_role[]
  )
);

create policy "Editors can update private Soulprint assets" on storage.objects
for update using (
  bucket_id = 'memory-assets'
  and public.has_family_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','editor']::public.app_role[]
  )
)
with check (
  bucket_id = 'memory-assets'
  and public.has_family_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','editor']::public.app_role[]
  )
);

create policy "Editors can delete private Soulprint assets" on storage.objects
for delete using (
  bucket_id = 'memory-assets'
  and public.has_family_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','editor']::public.app_role[]
  )
);

create or replace view public.account_entitlements
with (security_invoker = true)
as
select
  s.user_id,
  s.tier,
  s.storage_limit_gb,
  s.profile_limit,
  s.upload_limit,
  s.estate_vault_enabled,
  coalesce(sum(case when sa.status in ('active', 'trialing', 'purchased') then sa.extra_storage_gb else 0 end), 0)::integer as extra_storage_gb,
  (s.storage_limit_gb + coalesce(sum(case when sa.status in ('active', 'trialing', 'purchased') then sa.extra_storage_gb else 0 end), 0))::integer as total_storage_limit_gb,
  coalesce(bool_or(coalesce(sa.ai_story_builder_enabled, false) and sa.status in ('active', 'trialing', 'purchased')), false) as ai_story_builder_enabled
from public.subscriptions s
left join public.subscription_addons sa on sa.user_id = s.user_id
group by s.user_id, s.tier, s.storage_limit_gb, s.profile_limit, s.upload_limit, s.estate_vault_enabled;

-- Compatibility view for older code paths. New app code should query public.assets directly.
create or replace view public.soulprint_assets
with (security_invoker = true)
as
select
  a.*,
  a.original_filename as file_name
from public.assets a;

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all routines in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select on public.feature_flags to anon, authenticated;
grant select on public.soulprint_profiles to anon, authenticated;
grant select on public.assets to anon, authenticated;
grant select on public.soulprint_assets to anon, authenticated;
grant select on public.account_entitlements to authenticated;
grant select on public.plan_catalog to anon, authenticated;
grant select on public.addon_catalog to anon, authenticated;
grant select on public.addon_price_options to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
