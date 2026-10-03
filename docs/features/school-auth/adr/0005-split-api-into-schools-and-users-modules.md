---
status: Accepted
owner: "Architect"
reviewers: ["Tech Lead"]
updated_at: 2026-10-03
feature_size: M
ticket: ""
---

# 0005 — Split API into schools and users modules

- **Status:** Accepted
- **Date:** 2026-10-03
- **Deciders:** Architect + product owner (design walk)

## Context

Architecture map already reserves `schools` and `users` bounded contexts. school-auth must create tenants, staff identity, invites, and sessions without becoming a single “auth blob.”

## Decision drivers

- Project convention: hexagonal modules under `apps/api/src/modules/<context>/`.
- Later journal features need tenancy hooks without importing invite code.
- Spec separates School (tenant) from Teacher invite / staff roster.

## Considered options

1. **schools + users** — tenant vs staff identity/sessions/invites.
2. **One auth module** — everything in one folder.
3. **schools + users + sessions** — sessions as a third module.

## Decision outcome

**Chosen:** Option 1. Tenancy lives in `schools`; credentials, invites, sessions, and roster live in `users`. Cross-context rules (one email → one school) enforced at the app-service boundary.

## Consequences

**Positive**
- Clear home for future schedule/homework `school_id` checks.
- Matches scaffold module inventory.

**Negative**
- Some use cases span two modules (registration creates school + School Admin user).

**Neutral**
- Sessions stay in `users` for this M slice; can extract later if needed.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §5
