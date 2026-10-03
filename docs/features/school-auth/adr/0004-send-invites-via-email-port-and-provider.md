---
status: Accepted
owner: "Architect"
reviewers: ["Tech Lead"]
updated_at: 2026-10-03
feature_size: M
ticket: ""
---

# 0004 — Send invites via email port and transactional provider

- **Status:** Accepted
- **Date:** 2026-10-03
- **Deciders:** Architect + product owner (design walk)

## Context

Teacher invites must leave the system by email (spec AC-03). Deliverability and vendor choice should not leak into domain logic.

## Decision drivers

- Spec goals: invite by work email; invite completion KPI.
- Hexagonal layout: infra adapters behind ports (architecture map ADR 0002).
- Pilot may change email vendor without rewriting invite rules.

## Considered options

1. **Email port + transactional provider adapter** — domain emits “send invite”; infra sends.
2. **Dev/stub only** — log invite links; no real email.
3. **Raw SMTP from the API process** — fewer parts; weaker ops.

## Decision outcome

**Chosen:** Option 1. Keep invite lifecycle in domain; treat the mail vendor as an external system behind a port. Local/dev may use a logging adapter implementing the same port.

## Consequences

**Positive**
- Domain tests do not need a live mailbox.
- Vendor swap does not rewrite invite rules.

**Negative**
- Ops must provision a provider before a real pilot.
- Invite path latency includes enqueue time to the provider (registration itself does not send email).

**Neutral**
- Concrete vendor name is a deploy config choice, not a domain decision.

## Links

- Spec: [[../spec.md]]
- SAD: [[../sad.md]] §3 / §5
