---
status: Draft
owner: "QA"
reviewers: ["Backend Lead", "Frontend Lead", "Tech Lead"]
updated_at: 2026-10-03
feature_size: M
---

# Test plan — school-auth

Staff-identity foundation: School Admin self-registers a school, invites Teachers by work email, both roles sign in with school-scoped sessions on staff web — every §5 AC must be reachable by a named test below.

## Levels

| Level | Scope | Strategy (generic — no tool names) |
|---|---|---|
| Unit | Pure logic: validators, unique-name / invite / lockout rules — no I/O. | In-memory, no external dependency. |
| Integration | `schools` / `users` modules against a real store (and session/email adapters). | Ephemeral real dependency, e.g. a throwaway DB container spun up per suite. |
| Contract | HTTP boundary vs agreed OpenAPI shapes for auth and school-staff routes. | Validate real responses against the contract; no hand-rolled stubs of the contract itself. |
| E2E | Full API flow for critical stories (register → invite → accept → sign-in → revoke). | Real entry point against ephemeral dependencies. |
| Load | Numeric NFRs: registration / sign-in latency and registration rate limit. | The load tool already in your repo, or e.g. k6 or Locust. |
| Component *(UI)* | Auth forms and roster pieces in isolation (SCR states from screens.md). | Component harness; assert output + interactions, no full app boot. |
| Visual-regression | <!-- N/A: dropped for this plan — no visual baselines in v1 of school-auth testing --> | — |
| E2E-through-UI *(UI)* | User-story paths from ux-flows.md driven through staff web. | Rendered UI against ephemeral API + DB. |

## AC coverage

| AC (spec.md §5) | Test name (intent-based) | Level | Expected outcome |
|---|---|---|---|
| AC-01 happy path | registering a new school opens school administration for the new admin | integration + e2e-through-UI | School tenant and School Admin exist; admin lands in school administration for that school only |
| AC-02 error | register rejects missing or invalid fields and short password | unit + component | Completion blocked; caller sees which fields must be corrected |
| AC-02b domain invariant | register rejects a display name already in use | unit + integration | Registration blocked; caller told the school name is already in use |
| AC-03 happy path | admin invite creates a pending roster row | integration + e2e-through-UI | Pending Teacher invite recorded; roster shows awaiting acceptance |
| AC-04 domain invariant | duplicate invite for active or pending email is blocked | unit + integration | Invite blocked; caller told the person is already invited or active |
| AC-05 happy path | accepting a valid invite opens the teacher workspace | integration + e2e-through-UI | Teacher activated for that school only; teacher workspace opens |
| AC-06 error | expired or used invite cannot complete setup | integration + e2e-through-UI | Setup blocked; caller told to request a new invite from School Admin |
| AC-06b cross-context | accept blocked when email is active at another school | integration | Activation blocked; caller told the email is tied to another school |
| AC-07 happy path | sign-in routes admin and teacher to their school home | integration + e2e-through-UI | Admin → school administration; Teacher → teacher workspace; own school only |
| AC-08 authorization | sign-in deny does not reveal other-school email existence | integration | Access denied with a generic message; no foreign-school leak |
| AC-09 happy path | revoke marks teacher inactive and blocks later workspace access | integration + e2e | Roster shows inactive; subsequent teacher access to workspace fails |
| AC-10 authorization | teacher cannot invite or revoke staff | integration + e2e-through-UI | Action denied; caller told only School Admin may manage staff |
| AC-11 authorization | staff of school A cannot view school B administration | integration + e2e | Access denied with plain message; no school B data shown |
| AC-12 cross-context | accept for school A blocked while active at school B | integration | Setup blocked; email-tied-to-another-school explanation (same path as AC-06b) |
| AC-13 happy path (reissue) | reissue invalidates prior invite and shows new pending | integration + e2e-through-UI | New pending invite; prior invite unusable; roster shows new pending |

**Contract suite (cross-cutting, not a single AC):** auth and school-staff HTTP operations match the agreed request/response shapes and documented error outcomes in the OpenAPI contract — level **contract**.

## Edge cases / error paths

- Missing or invalid school display name, work email, or password shorter than twelve characters on register → expected: blocked with field-level corrections (AC-02).
- School display name already taken → expected: blocked with name-in-use explanation (AC-02b).
- Registration attempts over the per-contact-domain rate → expected: blocked with too-many-attempts guidance (NFR); tenant-creation policy per spec still applies when under limit.
- Duplicate pending or active Teacher email at the school on invite → expected: blocked with already invited/active explanation (AC-04).
- Expired or already-used invite link → expected: blocked; ask School Admin for a new invite (AC-06).
- Work email already active staff at another school on accept → expected: blocked; email tied to another school (AC-06b / AC-12).
- Sign-in credentials that do not match active staff → expected: generic access denied, no cross-school email reveal (AC-08).
- Account locked after repeated failed sign-ins → expected: temporary lock message; sign-in blocked until unlock window ends (NFR).
- Teacher attempts invite or revoke → expected: denied; only School Admin may manage staff (AC-10).
- Authenticated staff of school A targets school B administration → expected: plain denial; no school B data (AC-11).
- Revoked Teacher presents an old session on the next request → expected: workspace access denied; must sign in again and still cannot as inactive (AC-09 + session rule).
- Dependency unavailable (store down during register/sign-in) → expected: fail closed with a safe error; no partial tenant left without admin where the use case requires atomicity.

## Test data

- Seed strategy: factories/fixtures for School, StaffMember, TeacherInvite, Session per `data-model.md` (emails only under `@example.test`; ULID ids; no real PII).
- Integration dependency: ephemeral real PostgreSQL (throwaway container) for API module tests — not a mocked datastore.
- EmailPort: logging/test double behind the port for invite send assertions (outbound vendor not required in CI).
- Cleanup boundary: per-test reset of tenant rows (or transaction rollback) so suites stay independent; e2e-through-UI suites tear down created schools/staff after each flow.

## NFR validation (load)

- Registration p95 ≤ 2s → scenario: sustained register traffic at modest pilot rate for 5 minutes against staging-like stack; assert registration duration p95 ≤ 2s.
- Staff sign-in p95 ≤ 500ms → scenario: sustained sign-in for 5 minutes; assert sign-in duration p95 ≤ 500ms.
- Registration rate limit ≤ 5/hour per contact domain → scenario: exceed five registrations/hour for one domain; assert further attempts are limited and an ops-alert hook is observable in test.
- Failed sign-in lockout (5 failures → 15 min) → scenario: six bad passwords for one account; assert lock behaviour and plain lock message (may be integration rather than load if cheaper; still assert the numeric thresholds).

Availability 99.5% and invite-completion ≥70% are production/analytics KPIs — not load-suite targets here.

## CI placement

- On every PR: unit, component, contract, integration (ephemeral DB).
- On schedule / pre-release: e2e, e2e-through-UI, load scenarios.
- Visual-regression: N/A for this plan.

## Edits-log

- 2026-10-03 · levels accepted with visual-regression dropped · AC map as proposed · size M separate file
