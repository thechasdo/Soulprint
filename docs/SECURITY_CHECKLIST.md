# Soulprint Security Checklist

Soulprint handles deeply personal family memories. Treat it like a trust product, not a content app.

## Must-pass before launch

- RLS enabled on every user-data table.
- No client-side policies that allow users to update:
  - `subscriptions.tier`
  - `subscriptions.storage_limit_gb`
  - `subscriptions.profile_limit`
  - `family_memberships.role`
  - billing status
- `SUPABASE_SERVICE_ROLE_KEY` exists only in server runtimes.
- Storage buckets for memories are private.
- Public memorial pages only expose approved public/unlisted records.
- Stripe webhooks verify signatures before updating subscriptions.
- Uploads enforce file type and size limits by tier.
- Upload indexing runs through a server function.
- Estate Vault remains disabled until legal review or partner integration.
- Audit logs record role changes, deletion requests, billing changes, and vault access.
- Export tools exist before promising long-term preservation.

## Recommended commands

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run security:audit
supabase db push
```

## 100-year wording

Use this wording:

> Soulprint’s 100-Year Preservation Pledge means the platform is designed for long-term legacy preservation through secure storage, backups, export tools, and archival planning.

Do not claim an unconditional 100-year guarantee until legal, financial, and operational support exists.
