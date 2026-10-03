---
status: Accepted
owner: "Architect"
reviewers: ["Tech Lead"]
updated_at: 2026-10-03
feature_size: M
ticket: ""
---

# 0001 — Own backend-service and web-frontend surfaces for school-auth

- **Status:** Accepted
- **Date:** 2026-10-03
- **Deciders:** Architect + product owner (design walk)

## Context

School Admin and Teacher need registration, invite, sign-in, roster, and admin/workspace shells in this slice. Students and mobile are out of scope. The monorepo already has an API and a Next.js web app.

## Decision drivers

- Spec §4 roles are staff on the teacher/admin write path, not Student mobile.
- Spec §3 defers student accounts and mobile.
- Multi-surface ownership is multi-module and hard to reverse later.

## Considered options

1. **backend-service + web-frontend** — API plus staff web UI in this feature.
2. **backend-service only** — API first; UI later.
3. **backend-service + web-frontend + mobile-app** — also Expo staff flows.

## Decision outcome

**Chosen:** Option 1. Staff must complete invites and administer the school on web in the same increment; mobile stays for later student work.

## Consequences

**Positive**
- End-to-end pilot path for School Admin and Teacher without waiting on a second feature.
- Matches architecture-map containers already scaffolded.

**Negative**
- Larger delivery surface (API + UI tasks and e2e tiers).

**Neutral**
- Mobile can consume the same auth API later without redesigning tenancy.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §4
