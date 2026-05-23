# NeuroLedger

NeuroLedger is a decentralized AI dataset marketplace. This repository currently
contains Phase 1 of the product build: the production-ready application
foundation and route architecture.

## Phase 1 scope

Implemented in this phase:

- Next.js 15 App Router
- Strict TypeScript configuration
- TailwindCSS and Shadcn/UI-compatible styling foundation
- ESLint and Prettier
- Vitest and React Testing Library
- Application providers and theme system
- Functional base routes
- Environment variable template
- Architecture documentation

Intentionally not implemented in Phase 1:

- Authentication
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
subsystems. Phase 1 does not require live credentials to boot.

## Documentation

- `docs/architecture.md` describes the current application foundation.
