---
id: T15
title: "Expose invite, reissue, roster, and revoke HTTP ports"
layer: "ports"
deps: ["T10", "T13"]
blocks: ["T16"]
acs: ["AC-03", "AC-04", "AC-09", "AC-10", "AC-11", "AC-13"]
files_hint: ["apps/api/src/modules/users/ports/", "apps/api/src/modules/schools/ports/", "packages/shared/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "M"
status: "done"
---

# T15 — Expose invite, reissue, roster, and revoke HTTP ports

## Place in the sequence

- **Blocked by:** T10 — Implement InviteTeacher and ReissueInvite use cases · T13 — Implement roster, revoke, and tenancy checks · **Blocks:** T16 — Compose DI, session cookie middleware, and route registration · **Wave:** 6.
- **Lane:** shares users/ports + packages/shared with T14 — serialize overlap / compile-coupled.

## Why (user story)

> **As a** School Admin  
**I want** to invite a Teacher by work email  
**So that** they can access our school's teacher workspace
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

Authenticated school-admin HTTP surface for staff management.

## Inlined context

> Tenancy checks (`school_id` + role) run on every authenticated staff action.
>
> — `sad.md §5, Building block view, verbatim` · full text: [sad.md](../sad.md)

> CookieAuth security scheme on school-scoped routes.
>
> — `contracts/openapi.yaml, security + school paths, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

No DB changes.

## API contract

- `POST …/teacher-invites`, `POST …/reissue`, `GET …/staff-roster`, `POST …/revoke`
- Errors: `staff.forbidden`, `school.forbidden`, `invite.duplicate`, `invite.not_found`, `staff.not_found`.

— `contracts/openapi.yaml, school staff operations, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

## Acceptance criteria

### AC-03 — happy path

> **Given** a signed-in School Admin for a school  
**When** they invite a Teacher using a valid work email with no pending or active Teacher record for that email at the school  
**Then** the system records a pending Teacher invite and shows it on the staff roster as awaiting acceptance
>
> — `spec.md §5, AC-03, verbatim` · full text: [spec.md](../spec.md)

### AC-04 — domain invariant

> **Given** a Teacher is already active for the school, or a pending invite exists for the same work email at the school  
**When** the School Admin attempts to invite that work email again  
**Then** the system blocks the duplicate and explains the person is already invited or active on the staff roster
>
> — `spec.md §5, AC-04, verbatim` · full text: [spec.md](../spec.md)

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

### AC-13 — happy path (reissue)

> **Given** a pending or expired Teacher invite for a work email at the school  
**When** the School Admin reissues an invite for that email  
**Then** the system creates a new pending invite, marks the prior invite invalid, and shows the new pending state on the staff roster
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Handlers for invite/reissue/roster/revoke
- [ ] Require session + school_id match
- [ ] HTTP tests AC-03/04/09/10/11/13

## Edge cases

| Case | Behaviour |
|---|---|
| Missing/invalid session | 401/403 per platform convention |
| Teacher caller | staff.forbidden |

## Definition of Done

- [ ] HTTP tests for listed ACs/codes pass
- [ ] No foreign school data in error bodies
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
