---
id: T16
title: "Compose DI, session cookie middleware, and route registration"
layer: "wiring"
deps: ["T14", "T15"]
blocks: ["T17", "T18", "T19"]
acs: ["AC-07", "AC-09", "AC-11"]
files_hint: ["apps/api/src/app.ts", "apps/api/src/server.ts", "apps/api/src/modules/"]
owner: "Backend Lead"
estimate: "M"
context_budget: "M"
status: "todo"
---

# T16 — Compose DI, session cookie middleware, and route registration

## Place in the sequence

- **Blocked by:** T14 — Expose register, sign-in, and accept-invite HTTP ports · T15 — Expose invite, reissue, roster, and revoke HTTP ports · **Blocks:** T17 — Build public register, sign-in, and accept-invite screens · T18 — Build school administration staff roster screen · T19 — Build teacher workspace shell placeholder · **Wave:** 7.
- **Lane:** owns apps/api/src/app.ts — serialize with any app.ts touchers.

## Why (user story)

> **As a** School Admin or Teacher  
**I want** to sign in on later visits  
**So that** I can reach school administration or the teacher workspace for my school
>
> — `spec.md §4, US-04, verbatim` · full text: [spec.md](../spec.md)

Composition root so ports, repos, EmailPort, and cookie sessions work end-to-end.

## Inlined context

> **Chosen:** Option 1. Instant revoke and lockout need a server-side session authority.
>
> — `adr/0003…md §Decision outcome, verbatim` · full text: [0003](../adr/0003-use-http-only-cookie-with-server-side-sessions.md)

> Immediate access revocation — revoked Teachers lose workspace access on the next request after revoke.
>
> — `sad.md §1, Top-3 quality goals, abridged` · full text: [sad.md](../sad.md)

> API entry: `apps/api/src/server.ts` / `app.ts`.
>
> — `docs/architecture-map.md §Containers, abridged` · full text: [architecture-map.md](../../../architecture-map.md)

**Fallback:** insufficient or contradicted by the code → read the named file in full
([spec.md](../spec.md) · [sad.md](../sad.md) · [data-model.md](../data-model.md) ·
[openapi.yaml](../contracts/openapi.yaml) · [adr/](../adr/)) and follow it. Do not guess.

## Data delta

No DB changes.

## API contract

Internal wiring — exposes existing OpenAPI routes via Fastify plugin registration.

## Acceptance criteria

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

### AC-11 — authorization

> **Given** a signed-in School Admin or Teacher belonging to school A  
**When** they attempt to view or change administration data for school B  
**Then** the system denies access with a plain-language message and shows no data from school B
>
> — `spec.md §5, AC-11, verbatim` · full text: [spec.md](../spec.md)

## Checklist

- [ ] Wire Prisma, EmailPort, use cases, handlers in composition root
- [ ] Session cookie parse/resolve middleware
- [ ] Integration smoke: register→invite→accept→sign-in→revoke→denied

## Edge cases

| Case | Behaviour |
|---|---|
| Revoked session cookie presented | deny on next request |
| Missing DI binding | fail fast at boot |

## Definition of Done

- [ ] Integration smoke for session revoke-on-next-request passes
- [ ] API boots with schools+users modules
- [ ] lint + vet clean
- [ ] every Hard Rule inlined above still holds
- [ ] lint + vet clean
