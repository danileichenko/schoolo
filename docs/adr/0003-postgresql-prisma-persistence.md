# ADR 0003: PostgreSQL and Prisma persistence

## Status

Accepted

## Context

School journal data is relational, tenant-scoped per school, and must support transactional grade and homework updates. The foundation needs a mainstream migration story for a TypeScript API.

## Decision

- PostgreSQL as the sole primary datastore for v1.
- Prisma schema in `apps/api/prisma/schema.prisma`; migrations via Prisma Migrate.
- Primary keys are ULID strings assigned in the application layer.
- Row-level tenancy via `school_id` on tenant tables; enforce in app services.

## Consequences

- Prisma accelerates schema iteration early; complex reporting may later need raw SQL in infra adapters.
- ULIDs sort roughly by time and avoid coordination for ID generation.
- Changing database engine later is a major rewrite — acceptable for v1 focus.
