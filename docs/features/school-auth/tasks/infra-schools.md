---
id: T7
title: "Wire schools Prisma repository adapter"
layer: "infra"
deps: ["T1", "T5"]
blocks: ["T9", "T13"]
acs: ["AC-02b"]
files_hint: ["apps/api/src/modules/schools/infra/"]
owner: "Backend Lead"
estimate: "S"
context_budget: "S"
status: "todo"
---

# T7 — Wire schools Prisma repository adapter

## Place in the sequence

- **Blocked by:** T1 — Promote unique schools.name migration · T5 — Implement School domain unique-name rules · **Blocks:** T9 — Implement RegisterSchool use case · T13 — Implement roster, revoke, and tenancy checks · **Wave:** 4.
- **Lane:** own lane after T1/T5.

## Why (user story)

> **As a** School Admin  
**I want** to register my school and create my administrator account  
**So that** our institution has an isolated tenant before inviting staff
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Persistence adapter for School aggregate.

## Inlined context

> schools/infra — Prisma adapters
>
> — `sad.md §5, Internal decomposition, abridged` · full text: [sad.md](../sad.md)

> Persistence / DB access: Prisma client only in infra adapters; domain stays persistence-ignorant.
>
> — `docs/architecture-map.md §Cross-cutting, abridged` · full text: [architecture-map.md](../../../architecture-map.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

Reads/writes `schools` (`id`, `name`, `created_at`). No schema change beyond T1.

— `data-model.md §Entities, schools, abridged` · full text: [data-model.md](../data-model.md)

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

- [ ] Implement SchoolRepository Prisma adapter in `schools/infra/`
- [ ] Repo test for insert + unique conflict
- [ ] Map DB unique to domain error type

## Edge cases

| Case | Behaviour |
|---|---|
| Unique violation on name | surface as name-taken domain/app error |

## Definition of Done

- [ ] Repo test for unique name conflict passes
- [ ] Adapter only used from app layer
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
