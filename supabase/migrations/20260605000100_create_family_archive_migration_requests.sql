-- Soulprint: Family Archive Migration quote requests
-- Creates the request table used by the front-end quote form.
-- This service is priced at $149-$299 one-time and should be reviewed before invoicing/quoting in Stripe.

create extension if not exists pgcrypto;

create table if not exists public.family_archive_migration_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,

  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  email text not null check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),

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

  -- Admin/Stripe follow-up fields. Leave null until reviewed.
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

create index if not exists family_archive_migration_requests_created_at_idx
  on public.family_archive_migration_requests (created_at desc);

create index if not exists family_archive_migration_requests_quote_status_idx
  on public.family_archive_migration_requests (quote_status);

create index if not exists family_archive_migration_requests_email_idx
  on public.family_archive_migration_requests (lower(email));

create or replace function public.set_family_archive_migration_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_family_archive_migration_requests_updated_at
  on public.family_archive_migration_requests;

create trigger set_family_archive_migration_requests_updated_at
before update on public.family_archive_migration_requests
for each row
execute function public.set_family_archive_migration_requests_updated_at();

alter table public.family_archive_migration_requests enable row level security;

-- Public website submissions should go through the Next.js API route using SUPABASE_SERVICE_ROLE_KEY.
-- That keeps database writes server-side and prevents exposing privileged keys in the browser.

-- Logged-in users may create requests tied to their own account if you later submit directly from the client.
create policy "Authenticated users can create their own migration requests"
  on public.family_archive_migration_requests
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Logged-in users may view their own requests.
create policy "Authenticated users can view their own migration requests"
  on public.family_archive_migration_requests
  for select
  to authenticated
  using (user_id = auth.uid());

-- Admin review should be handled through Supabase Dashboard, service-role server code,
-- or a future admin panel with stricter role-based policies.
