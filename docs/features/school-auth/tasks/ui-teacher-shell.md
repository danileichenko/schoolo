---
id: T19
title: "Build teacher workspace shell placeholder"
layer: "ui"
deps: ["T16"]
blocks: []
acs: ["AC-05", "AC-07", "AC-09"]
files_hint: ["apps/web/app/(authenticated)/teacher/"]
owner: "Frontend Lead"
estimate: "S"
context_budget: "S"
status: "todo"
---

# T19 — Build teacher workspace shell placeholder

## Place in the sequence

- **Blocked by:** T16 — Compose DI, session cookie middleware, and route registration · **Blocks:** — · **Wave:** 8.
- **Lane:** own lane under teacher/.

## Why (user story)

> **As a** School Admin or Teacher  
**I want** to sign in on later visits  
**So that** I can reach school administration or the teacher workspace for my school
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

Post-auth Teacher landing shell until journal features arrive.

## Inlined context

> apps/web/app/(authenticated)/teacher/
>
> — `sad.md §5, Internal decomposition, abridged` · full text: [sad.md](../sad.md)

> **SCR-05** Teacher workspace shell — default, loading, error (revoked/forbidden → SCR-02).
>
> — `screens.md §Screens, SCR-05, abridged` · full text: [screens.md](../screens.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

No DB changes.

## API contract

Internal — session bootstrap only; no new API surface.

## Acceptance criteria

### AC-05 — happy path

> **Given** a pending Teacher invite for a specific school that is not expired  
**When** the invitee completes the invitation flow with an acceptable password  
**Then** the system activates their Teacher access for that school only and confirms they can open the teacher workspace
>
> — `spec.md §5, AC-05, verbatim` · full text: [spec.md](../spec.md)

### AC-07 — happy path

> **Given** an active School Admin or Teacher with valid credentials  
**When** they sign in  
**Then** the system opens school administration for the School Admin or the teacher workspace for the Teacher, for their school only
>
> — `spec.md §5, AC-07, verbatim` · full text: [spec.md](../spec.md)

### AC-09 — happy path

> **Given** a signed-in School Admin  
**When** they revoke an active Teacher's access  
**Then** the Teacher appears on the staff roster as inactive, and cannot open the teacher workspace on subsequent sign-in
>
> — `spec.md §5, AC-09, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Teacher shell route with AppShell + placeholder copy
- [ ] Redirect Teachers here after accept/sign-in
- [ ] Error state when session invalid

## Edge cases

| Case | Behaviour |
|---|---|
| Session revoked after AC-09 | error state + link to sign-in |

## Definition of Done

- [ ] SCR-05 default + error states present
- [ ] Role redirect from sign-in/accept works
- [ ] lint clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
