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
- Environment variable template
- Architecture documentation

Intentionally not implemented yet:

- Database schema
- Upload workflows
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

## Documentation

- `docs/architecture.md` describes the current application foundation.
