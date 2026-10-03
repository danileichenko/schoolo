---
id: T11
title: "Implement AcceptInvite use case"
layer: "app"
deps: ["T8"]
blocks: ["T14"]
acs: ["AC-05", "AC-06", "AC-06b", "AC-12"]
files_hint: ["apps/api/src/modules/users/app/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "M"
status: "done"
---

# T11 — Implement AcceptInvite use case

## Place in the sequence

- **Blocked by:** T8 — Wire users Prisma repos and EmailPort adapter · **Blocks:** T14 — Expose register, sign-in, and accept-invite HTTP ports · **Wave:** 5.
- **Lane:** shares users/app — serialized with T10/T12/T13.

## Why (user story)

> **As a** Teacher  
**I want** to complete my invitation and set credentials  
**So that** I can sign in to the correct school
>
> — `spec.md §4, US-03, verbatim` · full text: [spec.md](../spec.md)

Activates Teacher from a valid invite token and starts a session.

## Inlined context

> Accept invite: validate token → not expired/used → email not active elsewhere → create teacher + session → teacher workspace.
>
> — `sad.md §6, Accept invite, abridged` · full text: [sad.md](../sad.md)

> One email → one school enforced at the app-service boundary.
>
> — `adr/0005…md §Decision outcome, abridged` · full text: [0005](../adr/0005-split-api-into-schools-and-users-modules.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

Updates invite status → used; inserts `staff_members` (teacher/active); inserts `sessions`.

— `data-model.md §Entities, accept-invite writes, abridged` · full text: [data-model.md](../data-model.md)

## API contract

- `POST /api/v1/invites/{inviteToken}/accept` → `201 AuthSessionResponse` · errors: `400 invite.validation_failed`, `409 invite.email_elsewhere`, `410 invite.invalid`.

— `contracts/openapi.yaml, operationId acceptInvite, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

## Acceptance criteria

### AC-05 — happy path

> **Given** a pending Teacher invite for a specific school that is not expired  
**When** the invitee completes the invitation flow with an acceptable password  
**Then** the system activates their Teacher access for that school only and confirms they can open the teacher workspace
>
> — `spec.md §5, AC-05, verbatim` · full text: [spec.md](../spec.md)

### AC-06 — error

> **Given** a Teacher invite link that is expired or already used  
**When** the invitee attempts to complete setup  
**Then** the system blocks access and explains that they must request a new invite from their School Admin
>
> — `spec.md §5, AC-06, verbatim` · full text: [spec.md](../spec.md)

### AC-06b — cross-context

> **Given** a work email that is already active staff at another school  
**When** the invitee attempts to complete setup for a new school  
**Then** the system blocks activation and explains that the email is already tied to another school
>
> — `spec.md §5, AC-06b, verbatim` · full text: [spec.md](../spec.md)

### AC-12 — cross-context

> **Given** a Teacher invite issued for school A  
**When** the invitee attempts to complete setup while already active staff of school B  
**Then** the system blocks completion and explains that the email is already tied to another school
>
> — `spec.md §5, AC-12, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] AcceptInvite use case in users/app
- [ ] Mark invite used; create teacher; session
- [ ] App tests AC-05/06/06b/12

## Edge cases

| Case | Behaviour |
|---|---|
| Expired/used token | invite.invalid |
| Active at other school | invite.email_elsewhere |
| Password < 12 | invite.validation_failed |

## Definition of Done

- [ ] App tests for AC-05, AC-06, AC-06b, AC-12 pass
- [ ] No cross-school email enumeration beyond specified messages
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
