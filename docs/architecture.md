# NeuroLedger Architecture

Phase 1 establishes the deployable application foundation only.

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

The current routes are navigable boundaries for later subsystem work. They do not
implement authentication, uploads, blockchain, marketplace state, or admin actions.

Future subsystems should extend the existing folders instead of introducing
parallel architectures.
