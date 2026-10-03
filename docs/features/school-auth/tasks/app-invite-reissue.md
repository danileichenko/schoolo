---
id: T10
title: "Implement InviteTeacher and ReissueInvite use cases"
layer: "app"
deps: ["T8"]
blocks: ["T15"]
acs: ["AC-03", "AC-04", "AC-13"]
files_hint: ["apps/api/src/modules/users/app/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "M"
status: "done"
---

# T10 — Implement InviteTeacher and ReissueInvite use cases

## Place in the sequence

- **Blocked by:** T8 — Wire users Prisma repos and EmailPort adapter · **Blocks:** T15 — Expose invite, reissue, roster, and revoke HTTP ports · **Wave:** 5.
- **Lane:** shares users/app with T11–T13 — serialized overlap lane.

## Why (user story)

> **As a** School Admin  
**I want** to invite a Teacher by work email  
**So that** they can access our school's teacher workspace
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

Creates and reissues Teacher invites and updates roster-visible state.

## Inlined context

> Invite teacher: School Admin only; duplicate pending/active blocked; EmailPort send; roster shows awaiting acceptance.
>
> — `sad.md §6, Invite teacher, abridged` · full text: [sad.md](../sad.md)

> **Chosen:** Option 1. Keep invite lifecycle in domain; treat the mail vendor as an external system behind a port. Local/dev may use a logging adapter implementing the same port.
>
> — `adr/0004…md §Decision outcome, verbatim` · full text: [0004](../adr/0004-send-invites-via-email-port-and-provider.md)

> users/app — InviteTeacher, … Roster
>
> — `sad.md §5, Internal decomposition, abridged` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

Writes `teacher_invites` (pending; reissue → prior invalid + new pending). Reads `staff_members` for active duplicate check.

— `data-model.md §Entities, teacher_invites, abridged` · full text: [data-model.md](../data-model.md)

## API contract

- `POST /api/v1/schools/{schoolId}/teacher-invites` → `201` · errors: `403 staff.forbidden`, `403 school.forbidden`, `409 invite.duplicate`.
- `POST /api/v1/schools/{schoolId}/teacher-invites/{inviteId}/reissue` → `201` · errors: `403 staff.forbidden`, `404 invite.not_found`.

— `contracts/openapi.yaml, inviteTeacher + reissueTeacherInvite, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

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

### AC-13 — happy path (reissue)

> **Given** a pending or expired Teacher invite for a work email at the school  
**When** the School Admin reissues an invite for that email  
**Then** the system creates a new pending invite, marks the prior invite invalid, and shows the new pending state on the staff roster
>
> — `spec.md §5, AC-13, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] InviteTeacher + ReissueInvite in users/app
- [ ] Call EmailPort after pending row
- [ ] App tests AC-03/04/13

## Edge cases

| Case | Behaviour |
|---|---|
| Teacher role caller | staff.forbidden |
| Wrong schoolId | school.forbidden |
| Duplicate email | invite.duplicate |

## Definition of Done

- [ ] App tests for AC-03, AC-04, AC-13 pass
- [ ] EmailPort invoked on invite/reissue
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
