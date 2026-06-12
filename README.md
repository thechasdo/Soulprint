# Soulprint — Memories Live On

Soulprint is a branded, secure, trust-first family legacy platform.

It is designed to preserve:

- stories
- photos
- videos
- voices
- letters
- documents
- timelines
- family history
- future estate-vault records

This package uses the uploaded Soulprint logo as the core brand asset and places it across the marketing site, auth pages, dashboard, metadata, and Soulprint pages.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage, RLS
- Stripe Billing
- Supabase Edge Functions

## Launch pricing

- Memory Seed — Free
- Family Legacy — $8.99/month or $86.30/year
- Forever Archive — $19.99/month or $191.90/year

Yearly plans save 20%.

## Setup

Use Node.js 20.9 or newer. Node 22 LTS is a good choice.

```bash
npm ci
cp .env.example .env.local
npm run typecheck
npm run lint
npm run dev
```

Before running a production build, fill in at least these values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For Stripe checkout, signed uploads, and Supabase Edge Functions, also fill in the server-only values in `.env.local` and in your Supabase function secrets. Never commit `.env.local`.

## Supabase

```bash
supabase init
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Upload the logo to Supabase Storage if desired:

```text
bucket: brand
path: soulprint-logo.png
```

The local app already includes:

```text
public/soulprint-logo.png
```

## Security

Read:

```text
docs/SECURITY_CHECKLIST.md
```

## Important

This is a strong branded platform foundation, not a throwaway starter template. It includes a polished interface, pricing, dashboard shell, RLS schema, private upload rules, Stripe-ready checkout paths, indexing architecture, and estate-vault feature flagging.
