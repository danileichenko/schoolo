# schoolo — developer conventions

Monorepo for the Smart School platform (student mobile, teacher/admin web, shared API).

## Layout

- `apps/api` — Fastify HTTP API, hexagonal modules under `src/modules/<context>/` (`domain`, `app`, `infra`, `ports`).
- `apps/web` — Next.js App Router (teacher and admin write path).
- `apps/mobile` — Expo Router (student mobile).
- `packages/shared` — Zod schemas and shared types.

## Commands (from repo root)

- `pnpm build` — build all packages via Turbo.
- `pnpm test` — Vitest (unit + smoke).
- `pnpm lint` — typecheck/lint per package.
- `pnpm dev:api` — run API in watch mode.

## Data

- PostgreSQL via Prisma in `apps/api/prisma/`.
- Migrations: `pnpm --filter @schoolo/api db:migrate` (requires `DATABASE_URL`; see `.env.example`).
- IDs: ULID strings assigned in the application layer.

## Errors

- API returns Problem Details-style JSON for errors (see ADR 0002).

## Local database

```bash
docker compose up -d postgres
cp .env.example .env
pnpm --filter @schoolo/api db:migrate
```

## Tests

- Unit tests colocated as `*.test.ts`.
- Integration tests against PostgreSQL (Docker) — add under `apps/api` as features land.
