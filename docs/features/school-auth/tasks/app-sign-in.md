---
id: T12
title: "Implement SignIn use case with lockout"
layer: "app"
deps: ["T8"]
blocks: ["T14"]
acs: ["AC-07", "AC-08"]
files_hint: ["apps/api/src/modules/users/app/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "S"
status: "done"
---

# T12 — Implement SignIn use case with lockout

## Place in the sequence

- **Blocked by:** T8 — Wire users Prisma repos and EmailPort adapter · **Blocks:** T14 — Expose register, sign-in, and accept-invite HTTP ports · **Wave:** 5.
- **Lane:** shares users/app — serialized with T10/T11/T13.

## Why (user story)

> **As a** School Admin or Teacher  
**I want** to sign in on later visits  
**So that** I can reach school administration or the teacher workspace for my school
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

Authenticates staff and establishes server-side session without leaking other-school emails.

## Inlined context

> Staff sign in runtime: verify credentials for active staff → session → role-based destination; deny without revealing other schools.
>
> — `sad.md §6, Staff sign in, abridged` · full text: [sad.md](../sad.md)

> Failed sign-in lockout | 5 failures → lock 15 min
>
> — `spec.md §6, NFR table, abridged` · full text: [spec.md](../spec.md)

> **Chosen:** Option 1. Instant revoke and lockout need a server-side session authority.
>
> — `adr/0003…md §Decision outcome, verbatim` · full text: [0003](../adr/0003-use-http-only-cookie-with-server-side-sessions.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

Reads `staff_members`; writes `sessions`; updates failed_sign_in_count / locked_until.

— `data-model.md §Entities, staff_members + sessions, abridged` · full text: [data-model.md](../data-model.md)

## API contract

- `POST /api/v1/auth/sign-in` → `200 AuthSessionResponse` · errors: `401 auth.denied`, `423 auth.locked`.

— `contracts/openapi.yaml, operationId signIn, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

## Acceptance criteria

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

## Checklist

- [ ] SignIn use case + lockout counters
- [ ] Generic denial message (no email reveal)
- [ ] App tests AC-07/08 + lockout

## Edge cases

| Case | Behaviour |
|---|---|
| Wrong password / inactive | auth.denied generic |
| Locked account | auth.locked |
| Inactive after revoke | auth.denied |

## Definition of Done

- [ ] App tests for AC-07, AC-08 + lockout pass
- [ ] Session cookie authority is server-side
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
