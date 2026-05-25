# NeuroLedger

NeuroLedger is a decentralized AI dataset marketplace. This repository currently
contains Phase 1 of the product build: the production-ready application
foundation and route architecture.

## Phase 1 scope

Implemented through Phase 2:

- Next.js 15 App Router
- Strict TypeScript configuration
- TailwindCSS and Shadcn/UI-compatible styling foundation
- ESLint and Prettier
- Vitest and React Testing Library
- Application providers and theme system
- Functional base routes
- Supabase Auth email/password signup, login, logout, forgot password, and reset
  password routes
- Middleware-backed dashboard protection
- Auth-aware navigation and reusable auth hooks/utilities
- Role structure for `user`, `admin`, and `moderator`
- Wallet-link data structure for the later blockchain phase
- Supabase PostgreSQL schema migration for users, datasets, purchases,
  transactions, bounties, submissions, reviews, notifications, reputation,
  reports, and admin actions
- Row Level Security policies, indexes, constraints, triggers, and seed data
- Generated-style database TypeScript types and server-safe database helpers
- Authenticated dataset upload workflow with metadata validation, drag-and-drop UI,
  upload progress, retry handling, encrypted Pinata/IPFS storage, CID
  persistence, rollback handling, and Supabase dataset metadata persistence
- Base Sepolia blockchain layer with Thirdweb wallet connection, MetaMask and
  WalletConnect support, Solidity DatasetRegistry and DatasetEscrow contracts,
  ABI integration, deployment scripts, transaction persistence, ownership records,
  escrow state records, and event sync utilities
- Environment variable template
- Architecture documentation

Intentionally not implemented yet:

- Marketplace purchasing UI
- AI validation
- Admin moderation tooling
- Bounty workflows

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment

Copy `.env.example` to `.env.local` before implementing integration-backed
subsystems. Authentication requires:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Server-only Supabase service-role credentials are documented for later backend
phases and are never imported into client-side auth code.

## Database

Phase 3 migration and seed files live in:

```text
supabase/migrations/20260525011000_create_core_schema.sql
supabase/seed.sql
```

Apply them with the Supabase CLI in an environment that has Docker/Postgres
available:

```bash
supabase db reset
```

The local seed accounts use password `NeuroLedger123`.

## Uploads and IPFS storage

The upload pipeline validates files and metadata before encrypted IPFS storage:

- `/upload` is protected and requires authentication.
- `POST /api/uploads/datasets` validates metadata and files server-side.
- Supported files: CSV, JSON, JSONL, TXT, ZIP.
- Files are encrypted server-side before storage.
- Encrypted files are pinned to Pinata/IPFS using server-only `PINATA_JWT`.
- Dataset records persist CID, storage metadata, upload status, and encryption
  metadata.
- Uploaded datasets can be registered on-chain after wallet connection.

## Blockchain

Compile contracts:

```bash
npm run contracts:compile
```

Deploy to Base Sepolia after setting `BASE_SEPOLIA_RPC_URL` and
`DEPLOYER_PRIVATE_KEY`:

```bash
npm run contracts:deploy:base-sepolia
```

After deployment, set:

- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_DATASET_REGISTRY_ADDRESS`
- `NEXT_PUBLIC_DATASET_ESCROW_ADDRESS`
- `BASE_SEPOLIA_RPC_URL`

Wallets are linked by a signed message. Dataset ownership registration and escrow
funding are persisted only after server-side transaction receipt verification.

## Documentation

- `docs/architecture.md` describes the current application foundation.
