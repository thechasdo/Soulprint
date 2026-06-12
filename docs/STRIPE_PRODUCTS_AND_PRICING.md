# Soulprint Stripe Product Setup

Source of truth: **Soulprint Official Plans, Pricing & Premium Add-ons v1.0 — Revision Date June 4, 2026**

## Launch plans

Create these Stripe Products and recurring Prices:

| Product | Monthly Price | Yearly Price | Environment variables |
|---|---:|---:|---|
| Family Legacy | $8.99/mo | $86.30/yr | `STRIPE_PRICE_FAMILY_LEGACY_MONTHLY`, `STRIPE_PRICE_FAMILY_LEGACY_YEARLY` |
| Forever Archive | $19.99/mo | $191.90/yr | `STRIPE_PRICE_FOREVER_ARCHIVE_MONTHLY`, `STRIPE_PRICE_FOREVER_ARCHIVE_YEARLY` |

Memory Seed is the free in-app plan and does not need a paid Stripe Checkout Price.

## Recurring add-ons

| Product | Monthly Price | Yearly Price | Environment variables |
|---|---:|---:|---|
| Extra 25 GB Storage | $3/mo | $28.80/yr | `STRIPE_PRICE_EXTRA_25GB_STORAGE_MONTHLY`, `STRIPE_PRICE_EXTRA_25GB_STORAGE_YEARLY` |
| Extra 100 GB Storage | $8/mo | $76.80/yr | `STRIPE_PRICE_EXTRA_100GB_STORAGE_MONTHLY`, `STRIPE_PRICE_EXTRA_100GB_STORAGE_YEARLY` |
| AI Story Builder | $5/mo | $48/yr | `STRIPE_PRICE_AI_STORY_BUILDER_MONTHLY`, `STRIPE_PRICE_AI_STORY_BUILDER_YEARLY` |

## One-time add-ons

| Product | Price | Environment variable |
|---|---:|---|
| Soulprint QR Code Kit - Digital | $19 | `STRIPE_PRICE_SOULPRINT_QR_KIT_DIGITAL` |
| Soulprint QR Code Kit - Printed | $49 | `STRIPE_PRICE_SOULPRINT_QR_KIT_PRINTED` |
| Printed Memory Book - Starting Price | $79 | `STRIPE_PRICE_PRINTED_MEMORY_BOOK_STARTING` |
| White-glove Setup | $99 | `STRIPE_PRICE_WHITE_GLOVE_SETUP` |
| Family Archive Migration - Standard | $149 | `STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_STANDARD` |
| Family Archive Migration - Plus | $199 | `STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_PLUS` |
| Family Archive Migration - Large | $299 | `STRIPE_PRICE_FAMILY_ARCHIVE_MIGRATION_LARGE` |

## Webhook events to enable

Enable these events in Stripe:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Deployment order

1. Create Stripe Products and Prices.
2. Copy every `price_...` ID into the matching environment variable.
3. Run Supabase migration `20260604000000_pricing_addons.sql`.
4. Deploy the app.
5. Deploy Supabase Edge Functions.
6. Test all monthly, yearly, and one-time checkout paths in Stripe test mode.
