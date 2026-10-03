---
id: T5
title: "Implement School domain unique-name rules"
layer: "domain"
deps: []
blocks: ["T7"]
acs: ["AC-02b"]
files_hint: ["apps/api/src/modules/schools/domain/"]
owner: "Backend Lead"
estimate: "S"
context_budget: "S"
status: "todo"
---

# T5 — Implement School domain unique-name rules

## Place in the sequence

- **Blocked by:** — · **Blocks:** T7 — Wire schools Prisma repository adapter · **Wave:** 1.
- **Lane:** own lane (parallel with migrations).

## Why (user story)

> **As a** School Admin  
**I want** to register my school and create my administrator account  
**So that** our institution has an isolated tenant before inviting staff
>
> — `spec.md §4, US-01, verbatim` · full text: [spec.md](../spec.md)

Pure domain rules for School tenant naming before persistence.

## Inlined context

> The committed approach for this slice is **self-serve school registration** (first user becomes the **single School Admin** for that school), **teacher access only via work-email invite**, and a **staff roster of teachers** on web. **Students, classes, and enrollments are not in this feature** — they follow in a separate increment so admin and teacher auth can ship first.
>
> — `spec.md §1, committed approach, verbatim` · full text: [spec.md](../spec.md)

> schools/domain — School tenant rules (unique display name)
>
> — `sad.md §5, Internal decomposition, abridged` · full text: [sad.md](../sad.md)

> **Chosen:** Option 1. Tenancy lives in `schools`; credentials, invites, sessions, and roster live in `users`. Cross-context rules (one email → one school) enforced at the app-service boundary.
>
> — `adr/0005…md §Decision outcome, verbatim` · full text: [0005](../adr/0005-split-api-into-schools-and-users-modules.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

No DB changes.

## API contract

Internal — no API surface.

## Acceptance criteria

### AC-02b — domain invariant

> **Given** a school tenant already exists with the same school display name  
**When** another prospective School Admin attempts to register that display name  
**Then** the system blocks registration and explains that the school name is already in use
>
> — `spec.md §5, AC-02b, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Add School entity + unique-name policy in `schools/domain/`
- [ ] Unit tests for accept/reject name invariants
- [ ] Do not import Prisma in domain

## Edge cases

| Case | Behaviour |
|---|---|
| Empty/whitespace name | reject as validation failure upstream of unique check |

## Definition of Done

- [ ] Unit tests for unique-name policy pass
- [ ] Domain has no infra imports
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
