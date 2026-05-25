# NeuroLedger Architecture

Phase 1 established the deployable application foundation. Phase 2 added the
Supabase Auth subsystem. Phase 3 added the Supabase PostgreSQL schema, RLS
policies, seed script, generated-style types, and server-safe DB helpers. The
upload storage milestone added authenticated encrypted dataset upload processing
with Pinata/IPFS storage. The blockchain milestone adds Base Sepolia wallet
connection, DatasetRegistry ownership registration, DatasetEscrow funding, ABI
integration, deployment scripts, transaction persistence, ownership records, and
event synchronization utilities. Bounty submissions, AI validation, and admin
moderation actions remain out of scope.
The marketplace milestone adds browse/search/filter/sort/pagination APIs, dataset
detail pages, escrow purchase modal UI, purchase-state APIs, and dashboard
dataset management views.

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

## Uploads and IPFS storage

The upload subsystem is scoped to secure encrypted storage:

- `/upload` is protected by middleware and server-side auth verification.
- `POST /api/uploads/datasets` requires Supabase Auth.
- Metadata is validated with Zod and sanitized before persistence.
- File validation is centralized in `src/lib/upload` and checks extension, MIME
  type, executable signatures, size limits, malformed text content, CSV shape,
  JSON validity, JSONL row validity, and ZIP headers.
- Valid files are encrypted server-side with AES-256-GCM before storage.
- Encrypted files are pinned to Pinata/IPFS through the `UploadStorage`
  abstraction.
- Dataset records persist CID, storage provider, upload status, encrypted file
  size, encrypted checksum, storage metadata, and encryption metadata.
- If Supabase persistence fails after Pinata pinning, the API attempts to unpin
  the CID before returning a safe error.
- `blockchain_hash` is populated when the authenticated uploader registers the
  stored dataset with the DatasetRegistry contract.

## Blockchain

Contracts:

- `contracts/DatasetRegistry.sol` registers dataset owner, CID, dataset hash, and
  metadata URI with duplicate registration prevention.
- `contracts/DatasetEscrow.sol` funds escrowed purchases, prevents duplicate
  purchases per dataset/buyer, and releases payouts to verified sellers.

Application integration:

- Thirdweb powers wallet connection, MetaMask, WalletConnect, Base Sepolia chain
  switching, and transaction submission.
- Wallet linking requires a signed message bound to the authenticated Supabase
  user ID, wallet address, and chain ID.
- Server APIs verify transaction receipts through `BASE_SEPOLIA_RPC_URL` before
  persisting ownership and escrow state.
- Supabase tables `dataset_ownerships`, `escrow_states`, and `blockchain_events`
  provide durable ownership, escrow, and event sync records.

## Marketplace and dataset experience

- Marketplace browsing is backed by `src/lib/marketplace/queries.ts` and exposed
  through `/api/marketplace/datasets`.
- Dataset detail pages show safe metadata previews, truncated CID display,
  uploader reputation, ownership state, transaction history, related datasets, and
  purchase CTA.
- Purchase state checks are authenticated through `/api/marketplace/purchase-state`
  and prevent duplicate/self-purchase UI paths before escrow funding.
- Dashboard summaries use `/api/dashboard/summary` and shared query helpers to
  present uploaded, purchased, and owned datasets, wallet links, earnings,
  reputation, and blockchain transactions.
