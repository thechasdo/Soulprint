# Soulprint Supabase Fresh-Start Setup

Revision date: June 7, 2026

This project now includes a single fresh-start Supabase migration:

```text
supabase/migrations/20260607000000_soulprint_fresh_start_complete_schema.sql
```

Use this on a new or empty Supabase project. It is designed to create the full Soulprint backend from scratch.

## What the migration includes

- Auth-linked user profiles
- Families and family memberships
- Internal Soulprint Profiles
- Public Soulprint-ready profile access
- Asset metadata and private storage policies
- Timeline events
- Tributes
- Estate Vault tables, disabled behind a feature flag
- Upload indexing tables
- Subscription records
- Subscription add-ons
- Family Archive Migration quote requests
- Official launch plan catalog
- Official launch add-on catalog
- Add-on price options for Stripe checkout
- Row Level Security policies
- Storage buckets and storage policies
- Compatibility view for older `soulprint_assets` code paths

## Official launch tiers included

| Plan | Monthly | Yearly | Core limits |
| --- | ---: | ---: | --- |
| Memory Seed | Free | $0/year | 1 Soulprint, 1 GB storage, 50 uploads, 3 contributors |
| Family Legacy | $8.99/month | $86.30/year | Up to 5 Soulprints, 25 GB storage, indexed uploads |
| Forever Archive | $19.99/month | $191.90/year | Up to 25 Soulprints, 100 GB storage, advanced indexing-ready |

## Premium add-ons included

| Add-on | Price | Type |
| --- | ---: | --- |
| Extra 25 GB Storage | $3/month or $28.80/year | Recurring |
| Extra 100 GB Storage | $8/month or $76.80/year | Recurring |
| AI Story Builder | $5/month or $48/year | Recurring |
| Soulprint QR Code Kit | $19 digital or $49 printed | One-time |
| Printed Memory Book | Starting at $79 | One-time |
| White-glove Setup | $99 | One-time |
| Family Archive Migration | $149, $199, or $299 | One-time |
| Estate Vault | Built now, disabled until launch | Future feature |

## Commands

From the project folder:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Then deploy the Edge Functions after your Stripe and Supabase secrets are set:

```bash
npm run functions:deploy
```

## Important naming standard

Use **Soulprint Profile** internally inside authenticated/admin areas.

Use **Soulprint** for public-facing profile pages and sharing.

Do not use “Memory Profile,” “Memorial Page,” or “Legacy Page” in customer-facing Soulprint UI.
