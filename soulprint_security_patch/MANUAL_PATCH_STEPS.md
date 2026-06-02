# Soulprint Security Patch Instructions

I could read your GitHub repo, but the GitHub integration returned `403 Resource not accessible by integration` when I tried to commit directly. Copy these files into the matching paths in your repo.

## Files included

1. `supabase/migrations/20260602000000_security_hardening.sql`
2. `app/api/uploads/signed-url/route.ts`
3. `app/api/stripe/create-checkout-session/route.ts`
4. `app/dashboard/vault/page.tsx`
5. `.env.example`

## After copying

Run locally:

```bash
npm install
npm run typecheck
npm run build
supabase db push
```

Then set these environment variables in Vercel/Netlify and Supabase Edge Function secrets as appropriate:

```bash
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_FAMILY_LEGACY_MONTHLY
STRIPE_PRICE_FAMILY_LEGACY_YEARLY
STRIPE_PRICE_FOREVER_ARCHIVE_MONTHLY
STRIPE_PRICE_FOREVER_ARCHIVE_YEARLY
```

## What this patch fixes

- Blocks users from adding themselves to arbitrary families as owner/admin/editor.
- Keeps public reads limited to truly public Soulprint profiles.
- Stops public tributes from leaking on private/family profiles.
- Adds private `storage.objects` policies for the `memory-assets` bucket.
- Makes checkout require a signed-in user before Stripe session creation.
- Makes upload signed URLs verify the logged-in user, family membership, role, real subscription tier, and storage usage before using the service-role key.
- Updates the vault page to use the real `assets` table instead of the missing `soulprint_assets` table.

## Still left after this patch

- Expand the Stripe webhook to handle `customer.subscription.updated`, `customer.subscription.deleted`, and payment-failure events.
- Add an admin-only family invitation flow.
- Add audit logging for membership changes, asset deletes, billing changes, and vault access.
- Consider moving signed downloads/deletes behind server routes if you want tighter control than direct Supabase storage policies.
