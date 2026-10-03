---
id: T8
title: "Wire users Prisma repos and EmailPort adapter"
layer: "infra"
deps: ["T2", "T3", "T4", "T6"]
blocks: ["T9", "T10", "T11", "T12", "T13"]
acs: ["AC-03", "AC-07", "AC-09"]
files_hint: ["apps/api/src/modules/users/infra/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "M"
status: "todo"
---

# T8 — Wire users Prisma repos and EmailPort adapter

## Place in the sequence

- **Blocked by:** T2 — Promote staff_members table migration · T3 — Promote teacher_invites table migration · T4 — Promote sessions table migration · T6 — Implement staff, invite, and session domain rules · **Blocks:** T9 — Implement RegisterSchool use case · T10 — Implement InviteTeacher and ReissueInvite use cases · T11 — Implement AcceptInvite use case · T12 — Implement SignIn use case with lockout · T13 — Implement roster, revoke, and tenancy checks · **Wave:** 4.
- **Lane:** own lane after migrations T2–T4 + T6.

## Why (user story)

> **As a** School Admin  
**I want** to invite a Teacher by work email  
**So that** they can access our school's teacher workspace
>
> — `spec.md §4, US-02, verbatim` · full text: [spec.md](../spec.md)

Persistence + outbound email adapter for users module.

## Inlined context

> users/infra — Prisma + EmailPort adapter + session store
>
> — `sad.md §5, Internal decomposition, abridged` · full text: [sad.md](../sad.md)

> **Chosen:** Option 1. Keep invite lifecycle in domain; treat the mail vendor as an external system behind a port. Local/dev may use a logging adapter implementing the same port.
>
> — `adr/0004…md §Decision outcome, verbatim` · full text: [0004](../adr/0004-send-invites-via-email-port-and-provider.md)

> **Chosen:** Option 1. Instant revoke and lockout need a server-side session authority.
>
> — `adr/0003…md §Decision outcome, verbatim` · full text: [0003](../adr/0003-use-http-only-cookie-with-server-side-sessions.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

Touches `staff_members`, `teacher_invites`, `sessions` (read/write). No new migrations.

— `data-model.md §Entities, staff_members/teacher_invites/sessions, abridged` · full text: [data-model.md](../data-model.md)

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-03 — happy path

> **Given** a signed-in School Admin for a school  
**When** they invite a Teacher using a valid work email with no pending or active Teacher record for that email at the school  
**Then** the system records a pending Teacher invite and shows it on the staff roster as awaiting acceptance
>
> — `spec.md §5, AC-03, verbatim` · full text: [spec.md](../spec.md)

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

- [ ] Prisma repos for StaffMember, TeacherInvite, Session
- [ ] EmailPort interface + logging adapter for local/dev
- [ ] Repo tests with @example.test fixtures

## Edge cases

| Case | Behaviour |
|---|---|
| EmailPort failure | retry/log; invite row still created pending per invite flow |
| Session lookup by token_hash | miss → unauthenticated |

## Definition of Done

- [ ] Repo + EmailPort adapter tests pass
- [ ] password_hash never logged
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
