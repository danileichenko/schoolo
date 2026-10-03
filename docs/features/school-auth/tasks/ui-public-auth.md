---
id: T17
title: "Build public register, sign-in, and accept-invite screens"
layer: "ui"
deps: ["T16"]
blocks: []
acs: ["AC-01", "AC-02", "AC-02b", "AC-05", "AC-06", "AC-06b", "AC-07", "AC-08", "AC-12"]
files_hint: ["apps/web/app/(public)/", "apps/web/components/"]
owner: "Frontend Lead"
estimate: "L"
context_budget: "L"   # justified: three SCR manifests + OpenAPI error mapping in one public auth surface
status: "todo"
---

# T17 — Build public register, sign-in, and accept-invite screens

## Place in the sequence

- **Blocked by:** T16 — Compose DI, session cookie middleware, and route registration · **Blocks:** — · **Wave:** 8.
- **Lane:** own lane under (public)/ — parallel with T18/T19 unless components/ overlap.

## Why (user story)

> **As a** School Admin  
**I want** to register my school and create my administrator account  
**So that** our institution has an isolated tenant before inviting staff
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Public staff web flows for registration, sign-in, and invite acceptance.

## Inlined context

> **Chosen:** Option 1. Hybrid keeps credentials and redirects on the server path while allowing interactive roster updates.
>
> — `adr/0002…md §Decision outcome, verbatim` · full text: [0002](../adr/0002-use-hybrid-next-app-router-for-staff-ui.md)

> **Chosen:** Option 1. Staff must complete invites and administer the school on web in the same increment; mobile stays for later student work.
>
> — `adr/0001…md §Decision outcome, verbatim` · full text: [0001](../adr/0001-own-backend-and-web-frontend-surfaces.md)

> **SCR-01** Register school — states: default, loading, validation, error, success→SCR-04.
> **SCR-02** Staff sign in — default, loading, error, error-locked, success→SCR-04/05.
> **SCR-03** Accept invite — default, loading, validation, error, error-elsewhere, success→SCR-05.
>
> — `screens.md §Screens, SCR-01/02/03, abridged` · full text: [screens.md](../screens.md)

> NEW components: PageShell, TextField, PasswordField, Button, Form, FieldError, Alert, Spinner → shadcn under `apps/web/components/ui/`.
>
> — `screens.md §New components, abridged` · full text: [screens.md](../screens.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

No DB changes.

## API contract

Calls `registerSchool`, `signIn`, `acceptInvite`. Maps UI errors to OpenAPI codes listed on SCR states.

— `contracts/openapi.yaml + screens.md, public ops, abridged` · full text: [openapi.yaml](../contracts/openapi.yaml)

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

- [ ] Routes under `apps/web/app/(public)/` for register, sign-in, accept-invite
- [ ] shadcn-style primitives for NEW components
- [ ] Wire server actions/fetch with cookie credentials
- [ ] Cover SCR-01/02/03 listed states

## Edge cases

| Case | Behaviour |
|---|---|
| name_taken / rate_limited | Alert on SCR-01 |
| auth.locked | error-locked on SCR-02 |
| invite.invalid / email_elsewhere | SCR-03 error states |

## Definition of Done

- [ ] Manual or component tests for SCR-01/02/03 default+error states
- [ ] Success redirects by role to SCR-04/SCR-05
- [ ] lint clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
