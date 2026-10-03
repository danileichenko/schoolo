---
id: T13
title: "Implement roster, revoke, and tenancy checks"
layer: "app"
deps: ["T7", "T8"]
blocks: ["T15"]
acs: ["AC-09", "AC-10", "AC-11"]
files_hint: ["apps/api/src/modules/users/app/", "apps/api/src/modules/schools/app/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "M"
status: "todo"
---

# T13 — Implement roster, revoke, and tenancy checks

## Place in the sequence

- **Blocked by:** T7 — Wire schools Prisma repository adapter · T8 — Wire users Prisma repos and EmailPort adapter · **Blocks:** T15 — Expose invite, reissue, roster, and revoke HTTP ports · **Wave:** 5.
- **Lane:** shares users/app + schools/app — serialized with T9–T12.

## Why (user story)

> **As a** School Admin  
**I want** to view the staff roster and revoke a Teacher's access  
**So that** departed staff lose access to our school
>
> — `spec.md §4, US-05, verbatim` · full text: [spec.md](../spec.md)

Staff roster reads, revoke, and school boundary enforcement for admin actions.

## Inlined context

> Tenancy checks (`school_id` + role) run on every authenticated staff action.
>
> — `sad.md §5, Building block view, verbatim` · full text: [sad.md](../sad.md)

> Immediate access revocation — revoked Teachers lose workspace access on the next request after revoke.
>
> — `sad.md §1, Top-3 quality goals, abridged` · full text: [sad.md](../sad.md)

> Revoke + Cross-school boundary flows in §6.
>
> — `sad.md §6, Revoke teacher access / Cross-school boundary, abridged` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

Reads roster (staff + invites by school_id). Revoke: staff status→inactive; sessions revoked_at set.

— `data-model.md §Entities + §Indexes, roster/revoke, abridged` · full text: [data-model.md](../data-model.md)

## API contract

- `GET /api/v1/schools/{schoolId}/staff-roster` → `200` · errors: `403 school.forbidden`.
- `POST /api/v1/schools/{schoolId}/staff/{staffMemberId}/revoke` → `200` · errors: `403 staff.forbidden`, `404 staff.not_found`.

— `contracts/openapi.yaml, listStaffRoster + revokeTeacher, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

## Acceptance criteria

### AC-09 — happy path

> **Given** a signed-in School Admin  
**When** they revoke an active Teacher's access  
**Then** the Teacher appears on the staff roster as inactive, and cannot open the teacher workspace on subsequent sign-in
>
> — `spec.md §5, AC-09, verbatim` · full text: [spec.md](../spec.md)

### AC-10 — authorization

> **Given** a signed-in Teacher  
**When** they attempt to invite another Teacher or revoke someone else's access  
**Then** the system denies the action and explains that only the School Admin may manage staff
>
> — `spec.md §5, AC-10, verbatim` · full text: [spec.md](../spec.md)

### AC-11 — authorization

> **Given** a signed-in School Admin or Teacher belonging to school A  
**When** they attempt to view or change administration data for school B  
**Then** the system denies access with a plain-language message and shows no data from school B
>
> — `spec.md §5, AC-11, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] ListStaffRoster + RevokeTeacher + tenancy guard helpers
- [ ] On revoke: inactive + revoke all sessions
- [ ] App tests AC-09/10/11

## Edge cases

| Case | Behaviour |
|---|---|
| Teacher manages staff | staff.forbidden |
| school B via school A session | school.forbidden, empty body |
| Already inactive | idempotent or not_found per contract |

## Definition of Done

- [ ] App tests for AC-09, AC-10, AC-11 pass
- [ ] Revoked sessions invalid on next request
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
