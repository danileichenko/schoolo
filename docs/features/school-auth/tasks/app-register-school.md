---
id: T9
title: "Implement RegisterSchool use case"
layer: "app"
deps: ["T7", "T8"]
blocks: ["T14"]
acs: ["AC-01", "AC-02", "AC-02b"]
files_hint: ["apps/api/src/modules/schools/app/", "apps/api/src/modules/users/app/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "M"
status: "done"
---

# T9 — Implement RegisterSchool use case

## Place in the sequence

- **Blocked by:** T7 — Wire schools Prisma repository adapter · T8 — Wire users Prisma repos and EmailPort adapter · **Blocks:** T14 — Expose register, sign-in, and accept-invite HTTP ports · **Wave:** 5.
- **Lane:** compile-coupled with users/app register helpers — serialize if overlapping files_hint with T10–T13 on users/app.

## Why (user story)

> **As a** School Admin  
**I want** to register my school and create my administrator account  
**So that** our institution has an isolated tenant before inviting staff
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Coordinates schools + users to create tenant, School Admin, and session.

## Inlined context

> Registration is an app use case that coordinates `schools` (create tenant) and `users` (create School Admin + session).
>
> — `sad.md §5, Building block view, verbatim` · full text: [sad.md](../sad.md)

> Register school runtime: validate → unique name → write school+admin → write session → open administration.
>
> — `sad.md §6, Register school, abridged` · full text: [sad.md](../sad.md)

> Registration rate limit | ≤ 5/hour per contact domain
>
> — `spec.md §6, NFR table, abridged` · full text: [spec.md](../spec.md)

> Suspicious self-serve registrations still **create the tenant**; operations receives an alert for manual follow-up.
>
> — `spec.md §1, Pilot identity rules, abridged` · full text: [spec.md](../spec.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

Writes `schools`, `staff_members` (role school_admin, status active), `sessions`.

— `data-model.md §Entities, registration tables, abridged` · full text: [data-model.md](../data-model.md)

## API contract

- `POST /api/v1/auth/register-school` → `201 AuthSessionResponse` · errors: `400 school.validation_failed`, `409 school.name_taken`, `429 school.registration_rate_limited`.
- Request fields: `name`, `work_email`, `password`.

— `contracts/openapi.yaml, operationId registerSchool, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

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

## Checklist

- [ ] RegisterSchool app service spanning schools+users modules
- [ ] Enforce password ≥12 + email/name validation
- [ ] Rate limit 5/hour per contact domain; ops alert hook stub
- [ ] App tests for AC-01/02/02b

## Edge cases

| Case | Behaviour |
|---|---|
| password < 12 | validation_failed fields include password |
| name taken | name_taken |
| rate limit | registration_rate_limited |

## Definition of Done

- [ ] App tests for AC-01, AC-02, AC-02b pass
- [ ] Rate-limit behaviour covered
- [ ] No plaintext password persisted
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
