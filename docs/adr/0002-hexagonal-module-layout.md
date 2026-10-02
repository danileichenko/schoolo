# ADR 0002: Hexagonal module layout in the API

## Status

Accepted

## Context

The product spans several domains (schools, users, schedule, homework, grades, feedback, messages). We need clear boundaries so features can ship incrementally without turning the API into a ball of mud.

## Decision

- Each bounded context lives under `apps/api/src/modules/<name>/` with folders `domain/`, `app/`, `infra/`, `ports/`.
- HTTP routes and Fastify plugins live in `ports/`; use cases in `app/`; entities and rules in `domain/`; Prisma and external adapters in `infra/`.
- Cross-module calls go through explicit app services or query interfaces — no reaching into another module's infra.
- API errors use a consistent Problem Details JSON shape.

## Consequences

- New features add or extend a module slice rather than scattered handlers.
- Testing can target app services with mocked ports.
- Slightly more folders upfront; pays off as domains grow.
