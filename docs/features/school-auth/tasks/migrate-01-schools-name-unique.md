---
id: T1
title: "Promote unique schools.name migration"
layer: "migration"
deps: []
blocks: ["T2", "T3", "T7"]
acs: ["AC-02b"]
files_hint: ["docs/features/school-auth/migrations/01_unique_schools_name.up.sql", "docs/features/school-auth/migrations/01_unique_schools_name.down.sql", "apps/api/prisma/schema.prisma"]
owner: "Backend Lead"
estimate: "S"
context_budget: "S"
status: "done"
---

# T1 — Promote unique schools.name migration

## Place in the sequence

- **Blocked by:** — · **Blocks:** T2 — Promote staff_members table migration · T3 — Promote teacher_invites table migration · T7 — Wire schools Prisma repository adapter · **Wave:** 1.
- **Lane:** migration sequence (serialized).

## Why (user story)

> **As a** School Admin  
**I want** to register my school and create my administrator account  
**So that** our institution has an isolated tenant before inviting staff
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Adds the DB uniqueness that blocks duplicate school display names.

## Inlined context

> Unique display name for School tenants.
>
> — `data-model.md §Entities, schools.name UNIQUE, abridged` · full text: [data-model.md](../data-model.md)

> Hexagonal modules under `apps/api/src/modules/<context>/` (domain → app → infra → ports).
>
> — `sad.md §2, Constraints, verbatim` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

| Column | Type | Constraints | Change |
|---|---|---|---|
| `name` | TEXT | NOT NULL, UNIQUE | add UNIQUE index `schools_name_key` |

Staged pair: `docs/features/school-auth/migrations/01_unique_schools_name.up.sql` / `.down.sql`.

— `data-model.md §Entities + §Staged migrations, schools, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-02b — domain invariant

> **Given** a school tenant already exists with the same school display name  
**When** another prospective School Admin attempts to register that display name  
**Then** the system blocks registration and explains that the school name is already in use
>
> — `spec.md §5, AC-02b, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Promote staged SQL into Prisma migrate folder + update `apps/api/prisma/schema.prisma` (`@@unique([name])`)
- [ ] Apply migration against local Postgres; verify unique index exists
- [ ] Run down migration; verify index removed; re-apply

## Edge cases

| Case | Behaviour |
|---|---|
| Concurrent register same name | DB unique violation → map to school.name_taken upstream |

## Definition of Done

- [ ] Migration up+down succeeds locally
- [ ] Unit/integration not required beyond migrate apply/revert
- [ ] schema.prisma matches UNIQUE(name)
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
