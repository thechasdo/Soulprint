alter table if exists public.subscriptions
  add column if not exists upload_limit integer,
  add column if not exists estate_vault_enabled boolean not null default false,
  add column if not exists stripe_price_id text;

create table if not exists public.subscription_addons (
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

create unique index if not exists subscription_addons_recurring_unique
  on public.subscription_addons (user_id, addon_id, stripe_price_id)
  where billing_type = 'recurring';

create index if not exists subscription_addons_user_id_idx
  on public.subscription_addons (user_id);

create index if not exists subscription_addons_status_idx
  on public.subscription_addons (status);

alter table public.subscription_addons enable row level security;

create policy "Users can view their own add-ons"
  on public.subscription_addons
  for select
  using (auth.uid() = user_id);

create or replace view public.account_entitlements as
select
  s.user_id,
  s.tier,
  s.storage_limit_gb,
  s.profile_limit,
  s.upload_limit,
  s.estate_vault_enabled,
  coalesce(sum(case when sa.status in ('active', 'trialing', 'purchased') then sa.extra_storage_gb else 0 end), 0)::integer as extra_storage_gb,
  (s.storage_limit_gb + coalesce(sum(case when sa.status in ('active', 'trialing', 'purchased') then sa.extra_storage_gb else 0 end), 0))::integer as total_storage_limit_gb,
  bool_or(coalesce(sa.ai_story_builder_enabled, false) and sa.status in ('active', 'trialing', 'purchased')) as ai_story_builder_enabled
from public.subscriptions s
left join public.subscription_addons sa on sa.user_id = s.user_id
group by s.user_id, s.tier, s.storage_limit_gb, s.profile_limit, s.upload_limit, s.estate_vault_enabled;
