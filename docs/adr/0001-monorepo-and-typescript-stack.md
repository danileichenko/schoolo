# ADR 0001: Monorepo and TypeScript stack

## Status

Accepted

## Context

schoolo needs a student mobile app, a teacher and admin web app, and one authoritative API backing mandatory school rollout. The team wants one language for shared validation rules and fast iteration on a greenfield repo.

## Decision

- pnpm workspaces monorepo at the repository root.
- Node.js 22 + TypeScript 5.x for `apps/api` (Fastify).
- Next.js 15 (App Router) for `apps/web`.
- Expo (React Native) for `apps/mobile`.
- Shared Zod schemas and types in `packages/shared`.
- Vitest for unit tests; integration tests use ephemeral PostgreSQL via Docker.
- Tailwind on web; NativeWind on mobile; shadcn/ui as the web component baseline.

## Consequences

- One toolchain and shared types reduce drift between surfaces.
- Mobile and web release on separate store and deploy cycles but share API contracts.
- Node API is the single write path for journal data in v1.
