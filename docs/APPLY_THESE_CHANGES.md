# Apply Soulprint Pricing/Add-on Code Updates

The direct GitHub write failed due a repository integration permission error, so this package contains the updated files.

## How to apply

Copy each file in this package into the same path in your Soulprint repo, replacing existing files when present.

Then run:

```bash
npm install
npm run typecheck
supabase db push
npm run functions:deploy
```

## Files included

- `lib/pricing.ts`
- `components/PricingCards.tsx`
- `app/(marketing)/pricing/page.tsx`
- `app/api/stripe/create-checkout-session/route.ts`
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/migrations/20260604000000_pricing_addons.sql`
- `.env.example`
- `docs/STRIPE_PRODUCTS_AND_PRICING.md`

## What this update does

- Keeps the three official tiers: Memory Seed, Family Legacy, Forever Archive.
- Adds monthly/yearly checkout links for paid plans.
- Makes recurring add-ons purchasable through Stripe subscription mode.
- Makes one-time add-ons purchasable through Stripe payment mode.
- Adds Stripe environment variables for every official add-on.
- Updates the webhook to record plan subscriptions, recurring add-ons, and one-time purchases.
- Adds a `subscription_addons` table and account entitlement view.
