---
id: T2
title: "Promote staff_members table migration"
layer: "migration"
deps: ["T1"]
blocks: ["T4", "T8"]
acs: ["AC-01", "AC-07"]
files_hint: ["docs/features/school-auth/migrations/02_create_staff_members.up.sql", "docs/features/school-auth/migrations/02_create_staff_members.down.sql", "apps/api/prisma/schema.prisma"]
owner: "Backend Lead"
estimate: "S"
context_budget: "M"
status: "done"
---

# T2 — Promote staff_members table migration

## Place in the sequence

- **Blocked by:** T1 — Promote unique schools.name migration · **Blocks:** T4 — Promote sessions table migration · T8 — Wire users Prisma repos and EmailPort adapter · **Wave:** 2.
- **Lane:** migration sequence (serialized after T1).

## Why (user story)

> **As a** School Admin  
**I want** to register my school and create my administrator account  
**So that** our institution has an isolated tenant before inviting staff
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Persists School Admin / Teacher identity rows registration and sign-in need.

## Inlined context

> StaffMember: role `school_admin`|`teacher`; status `active`|`inactive`; UNIQUE(work_email).
>
> — `data-model.md §Entities, staff_members, abridged` · full text: [data-model.md](../data-model.md)

> **Chosen:** Option 1. Tenancy lives in `schools`; credentials, invites, sessions, and roster live in `users`. Cross-context rules (one email → one school) enforced at the app-service boundary.
>
> — `adr/0005…md §Decision outcome, verbatim` · full text: [0005](../adr/0005-split-api-into-schools-and-users-modules.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

| Column | Type | Constraints | Change |
|---|---|---|---|
| `id` | TEXT | PK | added |
| `school_id` | TEXT | FK → schools | added |
| `work_email` | TEXT | UNIQUE | added |
| `password_hash` | TEXT | NOT NULL | added |
| `role` / `status` | TEXT | NOT NULL | added |
| `failed_sign_in_count` / `locked_until` | INT / TIMESTAMPTZ | lockout | added |

Staged pair: `02_create_staff_members.*.sql`.

— `data-model.md §Entities, staff_members, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-01 — happy path

> **Given** no school tenant exists yet with the same school display name being registered  
**When** a prospective School Admin completes registration with school display name, their work email, and an acceptable password  
**Then** the system creates the school tenant, assigns them as the School Admin, and confirms they can open school administration
>
> — `spec.md §5, AC-01, verbatim` · full text: [spec.md](../spec.md)

### AC-07 — happy path

> **Given** an active School Admin or Teacher with valid credentials  
**When** they sign in  
**Then** the system opens school administration for the School Admin or the teacher workspace for the Teacher, for their school only
>
> — `spec.md §5, AC-07, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Promote 02 staged pair + Prisma StaffMember model
- [ ] Apply/revert migration
- [ ] Confirm indexes school_id + work_email

## Edge cases

| Case | Behaviour |
|---|---|
| Duplicate work_email across schools | UNIQUE(work_email) rejects second active membership |

## Definition of Done

- [ ] Migration up+down clean
- [ ] Prisma model matches data-model columns
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
