# Soulprint Family Archive Migration Quote Form

This package adds a front-end quote flow for the Soulprint **Family Archive Migration** add-on.

The add-on should be displayed as:

- **Family Archive Migration**
- **Starting at $149**
- **One-time service**
- Final pricing range: **$149-$299**
- Front-end CTA: **Request Migration Quote**

Do **not** make this a direct checkout item. The customer submits a request, then Soulprint reviews the archive and sends the correct Stripe Quote or Invoice.

## Files included

```text
app/request-migration-quote/page.tsx
app/api/family-archive-migration/route.ts
components/FamilyArchiveMigrationCard.tsx
supabase/migrations/20260605000100_create_family_archive_migration_requests.sql
```

If your project uses `src/app` instead of `app`, place the two `app/...` files under `src/app/...` instead.

## Step 1: Add the SQL migration

Upload or copy this file into your repo:

```text
supabase/migrations/20260605000100_create_family_archive_migration_requests.sql
```

Then run one of these:

```bash
supabase db push
```

Or paste the SQL into the Supabase SQL Editor and run it manually.

## Step 2: Add the environment variable

Your API route writes to Supabase from the server. Add this to your `.env.local` and to your deployment environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Important: never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code. It belongs only in server routes, server actions, or Supabase Edge Functions.

## Step 3: Add the request page

Upload this file:

```text
app/request-migration-quote/page.tsx
```

The public URL will be:

```text
/request-migration-quote
```

## Step 4: Add the API route

Upload this file:

```text
app/api/family-archive-migration/route.ts
```

The form submits to:

```text
/api/family-archive-migration
```

## Step 5: Add the card to your pricing/add-ons section

Upload this component:

```text
components/FamilyArchiveMigrationCard.tsx
```

Then import it into the page/component where your add-ons are displayed:

```tsx
import FamilyArchiveMigrationCard from '@/components/FamilyArchiveMigrationCard';
```

Render it where the add-ons appear:

```tsx
<FamilyArchiveMigrationCard />
```

If your project does not use the `@/` alias, use a relative import instead.

## Step 6: Review requests in Supabase

New requests will appear in:

```text
public.family_archive_migration_requests
```

Use the details to decide whether the Stripe price should be:

```text
$149, $199, or $299
```

Then send the customer a Stripe Quote or Invoice manually from Stripe.

## Recommended Stripe handling

Create one Stripe product:

```text
Family Archive Migration
```

Add three one-time prices:

```text
Small Archive Migration — $149
Standard Archive Migration — $199
Large Archive Migration — $299
```

Public front-end button should stay:

```text
Request Migration Quote
```

Not:

```text
Buy Now
```
