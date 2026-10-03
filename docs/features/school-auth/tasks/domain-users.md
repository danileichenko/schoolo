---
id: T6
title: "Implement staff, invite, and session domain rules"
layer: "domain"
deps: []
blocks: ["T8"]
acs: ["AC-04", "AC-05", "AC-06", "AC-06b", "AC-08", "AC-09"]
files_hint: ["apps/api/src/modules/users/domain/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "M"
status: "done"
---

# T6 — Implement staff, invite, and session domain rules

## Place in the sequence

- **Blocked by:** — · **Blocks:** T8 — Wire users Prisma repos and EmailPort adapter · **Wave:** 1.
- **Lane:** own lane (parallel with migrations + T5).

## Why (user story)

> **As a** Teacher  
**I want** to complete my invitation and set credentials  
**So that** I can sign in to the correct school
>
> — `spec.md §4, US-03, verbatim` · full text: [spec.md](../spec.md)

Pure identity/invite/session invariants used by all users use cases.

## Inlined context

> Teacher invites expire after 14 days; each work email may belong to at most one school as active staff.
>
> — `spec.md §1, Pilot identity rules, abridged` · full text: [spec.md](../spec.md)

> **Password policy (pilot):** minimum 12 characters; no MFA in this feature.
>
> — `spec.md §6.1, Password policy, verbatim` · full text: [spec.md](../spec.md)

> Failed sign-in lockout | 5 failures → lock 15 min
>
> — `spec.md §6, NFR table, abridged` · full text: [spec.md](../spec.md)

> Immediate access revocation — revoked Teachers lose workspace access on the next request after revoke.
>
> — `sad.md §1, Top-3 quality goals, abridged` · full text: [sad.md](../sad.md)

> users/domain — Staff identity, invite lifecycle, session rules
>
> — `sad.md §5, Internal decomposition, abridged` · full text: [sad.md](../sad.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-04 — domain invariant

> **Given** a Teacher is already active for the school, or a pending invite exists for the same work email at the school  
**When** the School Admin attempts to invite that work email again  
**Then** the system blocks the duplicate and explains the person is already invited or active on the staff roster
>
> — `spec.md §5, AC-04, verbatim` · full text: [spec.md](../spec.md)

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

### AC-08 — authorization

> **Given** a person attempts to sign in with credentials that do not match an active School Admin or Teacher  
**When** they submit sign-in  
**Then** the system denies access without revealing whether the email exists in another school
>
> — `spec.md §5, AC-08, verbatim` · full text: [spec.md](../spec.md)

### AC-09 — happy path

> **Given** a signed-in School Admin  
**When** they revoke an active Teacher's access  
**Then** the Teacher appears on the staff roster as inactive, and cannot open the teacher workspace on subsequent sign-in
>
> — `spec.md §5, AC-09, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] StaffMember/Invite/Session domain types + policies in `users/domain/`
- [ ] Unit tests: invite expiry, duplicate pending, password ≥12, lockout, revoke
- [ ] No Prisma/email imports in domain

## Edge cases

| Case | Behaviour |
|---|---|
| Expired/used invite | cannot activate — request new invite |
| Email active elsewhere | block with email-elsewhere semantics |
| 5 failed sign-ins | lock 15 minutes |
| Revoke | staff inactive + sessions revoked |

## Definition of Done

- [ ] Domain unit tests for listed ACs pass
- [ ] No infra imports in domain
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
