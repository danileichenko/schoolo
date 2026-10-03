---
id: T4
title: "Promote sessions table migration"
layer: "migration"
deps: ["T2"]
blocks: ["T8"]
acs: ["AC-07", "AC-09"]
files_hint: ["docs/features/school-auth/migrations/04_create_sessions.up.sql", "docs/features/school-auth/migrations/04_create_sessions.down.sql", "apps/api/prisma/schema.prisma"]
owner: "Backend Lead"
estimate: "S"
context_budget: "S"
status: "done"
---

# T4 — Promote sessions table migration

## Place in the sequence

- **Blocked by:** T2 — Promote staff_members table migration · **Blocks:** T8 — Wire users Prisma repos and EmailPort adapter · **Wave:** 3.
- **Lane:** migration sequence (after T2; shares schema.prisma).

## Why (user story)

> **As a** School Admin or Teacher  
**I want** to sign in on later visits  
**So that** I can reach school administration or the teacher workspace for my school
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

Server-side session store for HTTP-only cookie auth and immediate revoke.

## Inlined context

> **Chosen:** Option 1. Instant revoke and lockout need a server-side session authority.
>
> — `adr/0003…md §Decision outcome, verbatim` · full text: [0003](../adr/0003-use-http-only-cookie-with-server-side-sessions.md)

> Session: token_hash UNIQUE; revoked_at nullable; FK staff_member_id CASCADE.
>
> — `data-model.md §Entities, sessions, abridged` · full text: [data-model.md](../data-model.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

| Column | Type | Constraints | Change |
|---|---|---|---|
| `token_hash` | TEXT | UNIQUE | added |
| `expires_at` | TIMESTAMPTZ | NOT NULL | added |
| `revoked_at` | TIMESTAMPTZ | NULL | added |
| `staff_member_id` | TEXT | FK CASCADE | added |

Staged pair: `04_create_sessions.*.sql`.

— `data-model.md §Entities, sessions, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-07 — happy path

> **Given** an active School Admin or Teacher with valid credentials  
**When** they sign in  
**Then** the system opens school administration for the School Admin or the teacher workspace for the Teacher, for their school only
>
> — `spec.md §5, AC-07, verbatim` · full text: [spec.md](../spec.md)

### AC-09 — happy path

> **Given** a signed-in School Admin  
**When** they revoke an active Teacher's access  
**Then** the Teacher appears on the staff roster as inactive, and cannot open the teacher workspace on subsequent sign-in
>
> — `spec.md §5, AC-09, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Promote 04 staged pair + Prisma Session model
- [ ] Apply/revert
- [ ] Confirm token_hash + staff_member_id indexes

## Edge cases

| Case | Behaviour |
|---|---|
| Revoke teacher | set revoked_at on all sessions for staff_member_id |

## Definition of Done

- [ ] Migration up+down clean
- [ ] Prisma model matches
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
