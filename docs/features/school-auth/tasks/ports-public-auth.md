---
id: T14
title: "Expose register, sign-in, and accept-invite HTTP ports"
layer: "ports"
deps: ["T9", "T11", "T12"]
blocks: ["T16"]
acs: ["AC-01", "AC-02", "AC-02b", "AC-05", "AC-06", "AC-06b", "AC-07", "AC-08", "AC-12"]
files_hint: ["apps/api/src/modules/schools/ports/", "apps/api/src/modules/users/ports/", "packages/shared/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "M"
status: "done"
---

# T14 — Expose register, sign-in, and accept-invite HTTP ports

## Place in the sequence

- **Blocked by:** T9 — Implement RegisterSchool use case · T11 — Implement AcceptInvite use case · T12 — Implement SignIn use case with lockout · **Blocks:** T16 — Compose DI, session cookie middleware, and route registration · **Wave:** 6.
- **Lane:** compile-coupled with packages/shared auth DTOs — first implementer of shared types.

## Why (user story)

> **As a** School Admin  
**I want** to register my school and create my administrator account  
**So that** our institution has an isolated tenant before inviting staff
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Public HTTP surface for registration, invite accept, and sign-in.

## Inlined context

> ports — HTTP handlers under schools + users modules.
>
> — `sad.md §5, Internal decomposition, abridged` · full text: [sad.md](../sad.md)

> Problem Details-style JSON for errors (ADR 0002 repo-level).
>
> — `CLAUDE.md / architecture-map errors posture, abridged` · full text: [CLAUDE.md](../../../CLAUDE.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

No DB changes.

## API contract

- `POST /api/v1/auth/register-school` (security: [])
- `POST /api/v1/auth/sign-in` (security: [])
- `POST /api/v1/invites/{inviteToken}/accept` (security: [])
- Success sets HTTP-only session cookie; errors use codes from OpenAPI examples.

— `contracts/openapi.yaml, public auth operations, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

## Acceptance criteria

### AC-01 — happy path

> **Given** no school tenant exists yet with the same school display name being registered  
**When** a prospective School Admin completes registration with school display name, their work email, and an acceptable password  
**Then** the system creates the school tenant, assigns them as the School Admin, and confirms they can open school administration
>
> — `spec.md §5, AC-01, verbatim` · full text: [spec.md](../spec.md)

### AC-02 — error

> **Given** a prospective School Admin submits registration with a missing or invalid school display name, work email, or password shorter than 12 characters  
**When** they attempt to finish registration  
**Then** the system blocks completion and shows which required information must be corrected
>
> — `spec.md §5, AC-02, verbatim` · full text: [spec.md](../spec.md)

### AC-02b — domain invariant

> **Given** a school tenant already exists with the same school display name  
**When** another prospective School Admin attempts to register that display name  
**Then** the system blocks registration and explains that the school name is already in use
>
> — `spec.md §5, AC-02b, verbatim` · full text: [spec.md](../spec.md)

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

### AC-07 — happy path

> **Given** an active School Admin or Teacher with valid credentials  
**When** they sign in  
**Then** the system opens school administration for the School Admin or the teacher workspace for the Teacher, for their school only
>
> — `spec.md §5, AC-07, verbatim` · full text: [spec.md](../spec.md)

### AC-08 — authorization

> **Given** a person attempts to sign in with credentials that do not match an active School Admin or Teacher  
**When** they submit sign-in  
**Then** the system denies access without revealing whether the email exists in another school
>
> — `spec.md §5, AC-08, verbatim` · full text: [spec.md](../spec.md)

### AC-12 — cross-context

> **Given** a Teacher invite issued for school A  
**When** the invitee attempts to complete setup while already active staff of school B  
**Then** the system blocks completion and explains that the email is already tied to another school
>
> — `spec.md §5, AC-12, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Handlers + DTOs for register/sign-in/accept
- [ ] Map domain errors → OpenAPI codes
- [ ] Shared Zod types in packages/shared if needed (fold contract here)
- [ ] Route-level tests for status/codes/Set-Cookie

## Edge cases

| Case | Behaviour |
|---|---|
| Malformed JSON | 400 validation |
| Missing cookie on later calls | handled by wiring, not these handlers |

## Definition of Done

- [ ] Handler tests match OpenAPI codes for listed ACs
- [ ] Set-Cookie HTTP-only on 201/200 success
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
