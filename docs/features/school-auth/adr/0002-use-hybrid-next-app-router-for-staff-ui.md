---
status: Accepted
owner: "Architect"
reviewers: ["Tech Lead"]
updated_at: 2026-10-03
feature_size: M
ticket: ""
---

# 0002 — Use hybrid Next.js App Router for staff UI

- **Status:** Accepted
- **Date:** 2026-10-03
- **Deciders:** Architect + product owner (design walk)

## Context

`target_surfaces` includes `web-frontend`. Auth-sensitive forms (register, invite accept, sign-in) need secure session handling; the roster needs light interactivity. `apps/web` is already Next.js 15 App Router.

## Decision drivers

- Session model uses HTTP-only cookies (related ADR 0003).
- Architecture map names Next.js App Router for teacher/admin web.
- Reuse existing UI foundation rather than invent a second SPA stack.

## Considered options

1. **Hybrid App Router** — Server Components + server actions/route handlers for auth; client components for roster.
2. **Client SPA on Next.js** — Most UI client-side against the API.
3. **Fully server-rendered pages** — Minimal client JS.

## Decision outcome

**Chosen:** Option 1. Hybrid keeps credentials and redirects on the server path while allowing interactive roster updates.

## Consequences

**Positive**
- Aligns with cookie sessions and SSR redirects after sign-in.
- Matches scaffolded `apps/web`.

**Negative**
- Team must understand server/client component boundaries.

**Neutral**
- Screen inventory still comes from ux-flows / screens stages.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4
- Related ADR: [[0003-use-http-only-cookie-with-server-side-sessions]]
