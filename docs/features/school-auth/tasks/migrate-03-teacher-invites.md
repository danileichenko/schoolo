---
id: T3
title: "Promote teacher_invites table migration"
layer: "migration"
deps: ["T1"]
blocks: ["T8"]
acs: ["AC-03", "AC-05", "AC-13"]
files_hint: ["docs/features/school-auth/migrations/03_create_teacher_invites.up.sql", "docs/features/school-auth/migrations/03_create_teacher_invites.down.sql", "apps/api/prisma/schema.prisma"]
owner: "Backend Lead"
estimate: "S"
context_budget: "M"
status: "todo"
---

# T3 — Promote teacher_invites table migration

## Place in the sequence

- **Blocked by:** T1 — Promote unique schools.name migration · **Blocks:** T8 — Wire users Prisma repos and EmailPort adapter · **Wave:** 2.
- **Lane:** migration sequence (parallel with T2 after T1; shares schema.prisma with T2/T4 — serialize with T2/T4).

## Why (user story)

> **As a** School Admin  
**I want** to invite a Teacher by work email  
**So that** they can access our school's teacher workspace
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

Stores pending/expired/used/invalid invites for roster and accept flow.

## Inlined context

> Invite status `pending`|`expired`|`used`|`invalid`; expires_at 14-day validity; UNIQUE(token_hash).
>
> — `data-model.md §Entities, teacher_invites, abridged` · full text: [data-model.md](../data-model.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

| Column | Type | Constraints | Change |
|---|---|---|---|
| `token_hash` | TEXT | UNIQUE | added |
| `status` | TEXT | NOT NULL | added |
| `expires_at` | TIMESTAMPTZ | NOT NULL | added |
| `school_id`+`work_email`+`status` | index | duplicate checks | added |

Staged pair: `03_create_teacher_invites.*.sql`.

— `data-model.md §Entities + §Indexes, teacher_invites, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-03 — happy path

> **Given** a signed-in School Admin for a school  
**When** they invite a Teacher using a valid work email with no pending or active Teacher record for that email at the school  
**Then** the system records a pending Teacher invite and shows it on the staff roster as awaiting acceptance
>
> — `spec.md §5, AC-03, verbatim` · full text: [spec.md](../spec.md)

### AC-05 — happy path

> **Given** a pending Teacher invite for a specific school that is not expired  
**When** the invitee completes the invitation flow with an acceptable password  
**Then** the system activates their Teacher access for that school only and confirms they can open the teacher workspace
>
> — `spec.md §5, AC-05, verbatim` · full text: [spec.md](../spec.md)

### AC-13 — happy path (reissue)

> **Given** a pending or expired Teacher invite for a work email at the school  
**When** the School Admin reissues an invite for that email  
**Then** the system creates a new pending invite, marks the prior invite invalid, and shows the new pending state on the staff roster
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Promote 03 staged pair + Prisma TeacherInvite model
- [ ] Apply/revert
- [ ] Confirm token_hash unique + school/email/status index

## Edge cases

| Case | Behaviour |
|---|---|
| Reissue | prior invite status → invalid; new pending row |

## Definition of Done

- [ ] Migration up+down clean
- [ ] Prisma model matches
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
