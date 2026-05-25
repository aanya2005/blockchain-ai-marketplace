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
  upload progress, retry handling, local temporary server storage, and Supabase
  dataset metadata persistence
- Environment variable template
- Architecture documentation

Intentionally not implemented yet:

- IPFS integration
- Blockchain contracts or wallet flows
- Marketplace state
- Bounties
- AI validation
- Admin actions

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

## Uploads

Phase 4 implements secure local upload processing only:

- `/upload` is protected and requires authentication.
- `POST /api/uploads/datasets` validates metadata and files server-side.
- Supported files: CSV, JSON, JSONL, TXT, ZIP.
- Files are written to secure local temporary storage for this phase.
- Dataset metadata is persisted to the existing `datasets` table.
- IPFS and blockchain registration are intentionally deferred.

## Documentation

- `docs/architecture.md` describes the current application foundation.
