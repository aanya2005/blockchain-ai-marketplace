# NeuroLedger Architecture

Phase 1 established the deployable application foundation. Phase 2 added the
Supabase Auth subsystem. Phase 3 added the Supabase PostgreSQL schema, RLS
policies, seed script, generated-style types, and server-safe DB helpers. Phase 4
adds authenticated local dataset upload processing without starting IPFS,
blockchain, marketplace purchasing, bounty submissions, AI validation, or admin
moderation actions.

## Runtime

- Next.js 15 App Router
- React 19
- Strict TypeScript
- TailwindCSS
- Shadcn/UI-compatible component aliases
- `next-themes` provider for light/dark mode

## Source Layout

```text
src/
  app/                 Route tree and global layout
  components/          Layout, provider, theme, and UI primitives
  lib/                 Shared utilities, constants, and configuration metadata
  test/                Shared test helpers
```

## Phase Boundaries

The marketplace, upload, bounty, and admin routes remain navigable boundaries for
later subsystem work. Dashboard access is now protected by Supabase Auth
middleware and server-side user verification.

Future subsystems should extend the existing folders instead of introducing
parallel architectures.

## Authentication

- Client sessions use Supabase Auth browser APIs with the public anon key only.
- Server components and middleware use `@supabase/ssr` to read and refresh
  cookies safely.
- `/dashboard` redirects unauthenticated users to `/auth/login`.
- Auth pages are implemented at `/auth/login`, `/auth/signup`,
  `/auth/forgot-password`, and `/auth/reset-password`.
- Roles are derived from Supabase user metadata with `user` as the safe default.
- Wallet-link types exist for the later blockchain phase, but no wallet
  transaction or linking flow is active.

## Database

The core schema is defined in
`supabase/migrations/20260525011000_create_core_schema.sql`.

Tables:

- `users`
- `wallet_links`
- `datasets`
- `purchases`
- `transactions`
- `bounties`
- `submissions`
- `reviews`
- `notifications`
- `reputation_scores`
- `reports`
- `admin_actions`

Security model:

- Public reads are limited by RLS to approved public datasets, public reviews for
  approved datasets, and open bounties.
- Users can manage their own profile, wallet links, datasets, notifications, and
  reports within policy limits.
- Purchase and transaction visibility is scoped to relevant buyers, creators,
  uploaders, and moderators.
- Role elevation and dataset moderation changes are guarded by policies and
  triggers.
- Admin action records are append-only for moderators/admins.

Type-safe helpers live under `src/lib/db`. They intentionally avoid implementing
feature workflows and only centralize current-user, wallet-link, reputation, and
role-capability access patterns.

## Uploads

The upload subsystem is scoped to secure local processing:

- `/upload` is protected by middleware and server-side auth verification.
- `POST /api/uploads/datasets` requires Supabase Auth.
- Metadata is validated with Zod and sanitized before persistence.
- File validation is centralized in `src/lib/upload` and checks extension, MIME
  type, executable signatures, size limits, malformed text content, CSV shape,
  JSON validity, JSONL row validity, and ZIP headers.
- Valid files are written to local temporary storage through the
  `UploadStorage` abstraction. This is the seam where Pinata/IPFS storage should
  replace local temp storage in Phase 5.
- Only dataset metadata is persisted to Supabase in Phase 4; `cid` and
  `blockchain_hash` remain null placeholders.
