---
id: T18
title: "Build school administration staff roster screen"
layer: "ui"
deps: ["T16"]
blocks: []
acs: ["AC-03", "AC-04", "AC-09", "AC-10", "AC-11", "AC-13"]
files_hint: ["apps/web/app/(authenticated)/school-admin/", "apps/web/components/"]
owner: "Frontend Lead"
estimate: "L"
context_budget: "L"   # justified: SCR-04 multi-action roster + invite/revoke/reissue states in one screen
status: "done"
---

# T18 — Build school administration staff roster screen

## Place in the sequence

- **Blocked by:** T16 — Compose DI, session cookie middleware, and route registration · **Blocks:** — · **Wave:** 8.
- **Lane:** own lane under school-admin/ — may serialize with T17/T19 if components/ overlaps.

## Why (user story)

> **As a** School Admin  
**I want** to view the staff roster and revoke a Teacher's access  
**So that** departed staff lose access to our school
>
> — `spec.md §4, US-05, verbatim` · full text: [spec.md](../spec.md)

School Admin web UI for invite, reissue, revoke, and roster.

## Inlined context

> apps/web/app/(authenticated)/school-admin/
>
> — `sad.md §5, Internal decomposition, abridged` · full text: [sad.md](../sad.md)

> **SCR-04** School administration — states: default, loading, empty, error, validation, invite-error, invite-success, revoke-success, reissue-success.
>
> — `screens.md §Screens, SCR-04, abridged` · full text: [screens.md](../screens.md)

> NEW: AppShell, RosterTable, StatusBadge, EmptyState, SkeletonTable (+ shared fields/buttons).
>
> — `screens.md §New components, abridged` · full text: [screens.md](../screens.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

No DB changes.

## API contract

Calls `listStaffRoster`, `inviteTeacher`, `reissueTeacherInvite`, `revokeTeacher` with CookieAuth.

— `contracts/openapi.yaml, school staff ops, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

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

- [ ] School admin roster page + invite form
- [ ] Actions: invite, reissue, revoke with status badges
- [ ] Handle empty + error states from SCR-04

## Edge cases

| Case | Behaviour |
|---|---|
| school.forbidden | Alert, no foreign data |
| invite.duplicate | invite-error Alert |
| Teacher session | must not reach manage actions |

## Definition of Done

- [ ] SCR-04 default/empty/error/invite/revoke/reissue states implemented
- [ ] Staff.forbidden path covered if Teacher hits URL
- [ ] lint clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
