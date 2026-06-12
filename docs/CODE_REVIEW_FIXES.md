# Soulprint Code Review Fixes

Revision date: June 7, 2026

## Fixed

- Aligned the app on the current stable React/Next pairing in this project: Next.js 16.2.7, React 19.2.7, and React DOM 19.2.7.
- Pinned dependency versions instead of using `latest`, so installs are more predictable.
- Replaced the removed `next lint` command with `eslint .` and added an ESLint flat config for ESLint 9 / Next 16.
- Fixed the TypeScript checkout-session error around add-on `optionId` metadata.
- Corrected the design-token CSS imports in `app/globals.css` so they point to `src/styles`.
- Updated Tailwind aliases used throughout the UI: `navy`, `seafoam`, `sunset`, `orange`, `cream`, `rounded-brand`, and `shadow-glow`.
- Removed accidental nested duplicate routes from `app/app/...`.
- Promoted the safer upload route and vault page that use the real `assets` table, family membership permission checks, service-role-only signed upload generation, and storage usage checks.
- Removed local/cache files from the cleaned handoff: `.env.local`, `.next`, `node_modules`, backups, and TypeScript build info.
- Expanded `.env.example` to include all Stripe plan and add-on price IDs used by the code.
- Added a single fresh-start Supabase migration with the complete launch schema, RLS policies, storage buckets, official plan catalog, add-on catalog, and Stripe price option catalog.
- Renamed public-facing QR kit and public route language to Soulprint. Internal profile wording uses Soulprint Profile.

## Verified

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run build` was not re-run after the final Supabase/pricing additions because local validation used a temporary dependency symlink/copy; `npm run typecheck` and `npm run lint` passed after the final code edits.

## Notes

- A full production `next build` requires real environment values, especially `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The client auth/dashboard pages create a Supabase browser client and the build/prerender step will fail without those public values.
- No real secrets were found in the uploaded source scan. The uploaded `.env.local` only contained blank keys, but `.env.local` has been removed from this cleaned package because real environment files should never be committed or shared.
