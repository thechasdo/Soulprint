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

This package uses the uploaded Soulprint logo as the core brand asset and places it across the marketing site, auth pages, dashboard, metadata, and memorial pages.

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

```bash
npm install
cp .env.example .env.local
npm run dev
```

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
