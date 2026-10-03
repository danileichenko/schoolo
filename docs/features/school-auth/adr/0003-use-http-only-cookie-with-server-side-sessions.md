---
status: Accepted
owner: "Architect"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: 2026-10-03
feature_size: M
ticket: ""
---

# 0003 — Use HTTP-only cookie with server-side sessions

- **Status:** Accepted
- **Date:** 2026-10-03
- **Deciders:** Architect + product owner (design walk)

## Context

School Admin and Teacher must stay signed in across SSR pages. Spec requires revoke to immediately block teacher workspace access. Staff UI is web-first in this feature.

## Decision drivers

- Spec AC-09: revoked Teacher cannot open workspace on subsequent sign-in.
- Spec §6.1: credential stuffing lockout; confidential staff data.
- Hybrid Next.js UI (ADR 0002) benefits from cookie-readable SSR sessions.

## Considered options

1. **HTTP-only session cookie + server-side session store** — session row invalidated on logout/revoke.
2. **Access + refresh JWT in browser storage** — SPA-friendly; higher XSS exposure.
3. **JWT in HTTP-only cookie (stateless)** — no session table; revoke delayed until expiry.

## Decision outcome

**Chosen:** Option 1. Instant revoke and lockout need a server-side session authority.

## Consequences

**Positive**
- Logout and revoke take effect immediately.
- Tokens not readable by client JavaScript.

**Negative**
- Requires a session store (DB table acceptable for pilot).
- Sticky affinity less relevant at single-region pilot scale.

**Neutral**
- Mobile later can add a token path without changing staff web sessions.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4 / §8
- Related ADR: [[0002-use-hybrid-next-app-router-for-staff-ui]]
