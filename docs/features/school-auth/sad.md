---
status: Draft
owner: "Architect / Tech Lead"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: 2026-10-03
feature_size: M
target_surfaces: [backend-service, web-frontend]
---

# Software Architecture Document — school-auth

## 1. Introduction and goals

**Intent.** school-auth lets a School Admin self-register an isolated school tenant, invite Teachers by work email, and lets both roles sign in on the staff web app with school-scoped authorization — the staff-identity foundation before schedule, homework, or grades.

**Top-3 quality goals (1-liners; full scenarios in §10):**

1. **Tenant isolation** — staff of school A never see school B administration or roster data.
2. **Auth reliability for pilot onboarding** — registration and sign-in meet agreed p95 latency; invite email is enqueued reliably.
3. **Immediate access revocation** — revoked Teachers lose workspace access on the next request after revoke.

**Stakeholders.**

| Role | Interest | Sign-off owner? |
|---|---|---|
| School Admin | Registers school, invites and revokes Teachers | No |
| Teacher | Accepts invite, signs in to teacher workspace | No |
| Tech Lead | SAD approval | Yes |
| Security Lead | Auth boundary and PII review | Yes |

**Decision overrides**
- Decision override: Immediate session kill on Teacher revoke — rationale: design hardens beyond AC-09 (subsequent sign-in only) so a revoked Teacher cannot keep using an existing session; server-side session is invalidated on revoke.

## 2. Constraints

**Technical.**
- TypeScript on Node.js 22; Fastify API; Next.js 15 App Router web (`docs/architecture-map.md`).
- PostgreSQL via Prisma Migrate; ULID string IDs in the application layer.
- Hexagonal modules under `apps/api/src/modules/<context>/` (domain → app → infra → ports).
- Problem Details-style API errors; shared Zod types in `packages/shared`.

**Organisational.**
- Feature size M (~1–2 sprints); route `standard`.
- Pilot-first: single region; no platform-operator console in this slice.
- No `ux-flows.md` yet — screen inventory deferred to `/sdd:ux-flows school-auth` (or screens later).

**Conventions.**
- `CLAUDE.md` + foundational ADRs 0001–0003 at repo `docs/adr/`.
- Feature ADRs under `docs/features/school-auth/adr/`.

**Regulatory / external.**
- Staff personal data (names, work emails, credentials) classified confidential (spec §6.1).
- Geography / child-data rules for later chat/parent AI remain product open questions outside this feature.

## 3. Context and scope

Staff create and join a school tenant through the schoolo staff web app. The API is the trust boundary for tenancy, credentials, invites, and sessions. A transactional email provider delivers Teacher invite messages. Students, parents, and mobile apps are outside this feature’s scope.

<!-- brownfield: scaffolded monorepo with API health, Prisma schools stub, Next.js/Expo placeholders; journal modules empty (architecture-map reflects c6e2691, HEAD later) -->

**External systems (in / out):**

| Actor or system | Type | Interaction |
|---|---|---|
| School Admin | Person | Registers school, manages staff roster, signs in |
| Teacher | Person | Accepts invite, signs in to teacher workspace |
| schoolo platform (API + staff web) | System (ours) | Auth, tenancy, invites, sessions |
| Transactional email provider | System (external) | Sends Teacher invite emails |
| Student mobile / Parent | Out of scope | Not actors in this feature |

**C4 Context (L1):**

```mermaid
C4Context
    title school-auth — System Context

    Person(schoolAdmin, "School Admin", "Registers school and manages Teachers")
    Person(teacher, "Teacher", "Accepts invite and signs in")
    System(schoolo, "schoolo staff platform", "Tenancy, staff identity, invites, sessions")
    System_Ext(email, "Transactional email provider", "Delivers Teacher invite messages")

    Rel(schoolAdmin, schoolo, "Registers, invites, revokes, signs in", "HTTPS")
    Rel(teacher, schoolo, "Accepts invite, signs in", "HTTPS")
    Rel(schoolo, email, "Sends invite messages", "Provider API")
```

## 4. Solution strategy

**Top strategic choices (the seeds for ADRs):**

1. **Own backend-service and web-frontend** — Staff complete the full loop in this feature; mobile deferred (ADR 0001).
2. **Hybrid Next.js App Router for staff UI** — Server path for auth forms; client for roster interactivity (ADR 0002).
3. **HTTP-only cookie + server-side sessions** — Instant logout/revoke and SSR-friendly auth (ADR 0003).
4. **Email behind a port** — Invite lifecycle in domain; provider swappable (ADR 0004).
5. **`schools` + `users` modules** — Tenant vs staff identity/sessions/invites (ADR 0005).

## 5. Building block view

Hexagonal modules in the API; staff web as a separate container consuming the API. Registration is an app use case that coordinates `schools` (create tenant) and `users` (create School Admin + session). Invites, credentials, sessions, and roster live in `users`. Tenancy checks (`school_id` + role) run on every authenticated staff action.

**Internal decomposition:**

```
apps/api/src/modules/
├── schools/
│   ├── domain/     School tenant rules (unique display name)
│   ├── app/        RegisterSchool, tenancy queries
│   ├── infra/      Prisma adapters
│   └── ports/      HTTP handlers
└── users/
    ├── domain/     Staff identity, invite lifecycle, session rules
    ├── app/        InviteTeacher, AcceptInvite, SignIn, Revoke, Roster
    ├── infra/      Prisma + EmailPort adapter + session store
    └── ports/      HTTP handlers
apps/web/app/
├── (public)/       register, sign-in, accept-invite
└── (authenticated)/ school-admin/, teacher/
```

**C4 Container (L2):**

```mermaid
C4Container
    title school-auth — Containers

    Person(schoolAdmin, "School Admin")
    Person(teacher, "Teacher")

    Container_Boundary(platform, "schoolo") {
        Container(web, "Staff web", "Next.js hybrid App Router", "Registration, invite accept, sign-in, admin, teacher shell")
        Container(api, "API", "Fastify hexagonal modules", "schools + users use cases, sessions, tenancy")
        ContainerDb(db, "Primary database", "PostgreSQL", "Schools, staff, invites, sessions")
    }

    System_Ext(email, "Transactional email provider", "Invite delivery")

    Rel(schoolAdmin, web, "Uses", "HTTPS")
    Rel(teacher, web, "Uses", "HTTPS")
    Rel(web, api, "Calls", "HTTPS JSON + session cookie")
    Rel(api, db, "Reads/writes", "Prisma")
    Rel(api, email, "Sends invites", "Provider API")
```

## 6. Runtime view

### Register school

```mermaid
sequenceDiagram
    autonumber
    actor A as SchoolAdmin
    participant UI as ui
    participant S as service
    participant D as data-store

    Note over A,S: Precondition: prospective School Admin is not yet signed in
    A->>UI: Submit school display name, work email, password
    UI->>S: Register school
    alt invalid display name, email, or password too short
        S-->>UI: Validation errors naming the fields
        UI-->>A: Show what to correct
    else display name already in use
        S->>D: Lookup school by display name
        D-->>S: found
        S-->>UI: School name already in use
        UI-->>A: Explain name is taken
    else registration succeeds
        S->>D: Lookup school by display name
        D-->>S: not found
        S->>D: Write school tenant and School Admin
        Note over S,D: persists School and School Admin staff record
        D-->>S: ack
        S->>D: Write session
        Note over S,D: persists Session
        D-->>S: ack
        S-->>UI: Session established
        UI-->>A: Open school administration
    end
    Note over A,S: Postcondition on success: School Admin can open school administration for the new tenant
```

### Invite teacher

```mermaid
sequenceDiagram
    autonumber
    actor A as SchoolAdmin
    participant UI as ui
    participant S as service
    participant D as data-store
    participant X as external-system

    Note over A,S: Precondition: School Admin is signed in for their school
    A->>UI: Invite Teacher by work email
    UI->>S: Invite Teacher
    alt email already active or pending at this school
        S->>D: Lookup staff or invite by work email
        D-->>S: active or pending found
        S-->>UI: Already invited or active on roster
        UI-->>A: Explain duplicate
    else invite succeeds
        S->>D: Lookup staff or invite by work email
        D-->>S: none
        S->>D: Write pending Teacher invite
        Note over S,D: persists Teacher invite pending
        D-->>S: ack
        S->>X: Enqueue invite message
        X-->>S: accepted
        S-->>UI: Pending on staff roster
        UI-->>A: See awaiting acceptance
    end
    Note over A,S: Postcondition on success: pending invite visible on staff roster
```

### Reissue invite

```mermaid
sequenceDiagram
    autonumber
    actor A as SchoolAdmin
    participant UI as ui
    participant S as service
    participant D as data-store
    participant X as external-system

    Note over A,S: Precondition: pending or expired invite exists for a work email at this school
    A->>UI: Reissue invite for work email
    UI->>S: Reissue invite
    S->>D: Lookup prior invite for email
    D-->>S: pending or expired found
    S->>D: Invalidate prior invite
    Note over S,D: persists prior invite as invalid
    D-->>S: ack
    S->>D: Write new pending invite
    Note over S,D: persists Teacher invite pending
    D-->>S: ack
    S->>X: Enqueue invite message
    X-->>S: accepted
    S-->>UI: New pending state on roster
    UI-->>A: See new awaiting acceptance
    Note over A,S: Postcondition: old invite link dead, new pending invite on roster
```

### Accept invite

```mermaid
sequenceDiagram
    autonumber
    actor T as Teacher
    participant UI as ui
    participant S as service
    participant D as data-store

    Note over T,S: Precondition: Teacher opens a valid invite for a school
    T->>UI: Complete invite with password
    UI->>S: Accept invite
    alt invite expired or already used
        S->>D: Lookup invite
        D-->>S: expired or used
        S-->>UI: Request a new invite from School Admin
        UI-->>T: Explain invite is invalid
    else work email already active staff at another school
        S->>D: Lookup invite and global staff by email
        D-->>S: invite ok, email tied elsewhere
        S-->>UI: Email already tied to another school
        UI-->>T: Explain cannot join this school
    else accept succeeds
        S->>D: Lookup invite
        D-->>S: pending and not expired
        S->>D: Activate Teacher and invalidate invite
        Note over S,D: persists Teacher active and invite used
        D-->>S: ack
        S->>D: Write session
        Note over S,D: persists Session
        D-->>S: ack
        S-->>UI: Session established
        UI-->>T: Open teacher workspace
    end
    Note over T,S: Postcondition on success: Teacher active for one school only
```

### Staff sign in

```mermaid
sequenceDiagram
    autonumber
    actor U as Staff
    participant UI as ui
    participant S as service
    participant D as data-store

    Note over U,S: Precondition: School Admin or Teacher has an active account
    U->>UI: Submit work email and password
    UI->>S: Sign in
    alt account locked after failed attempts
        S->>D: Lookup staff by email
        D-->>S: locked until cooldown ends
        S-->>UI: Account temporarily locked
        UI-->>U: Plain lock message
    else credentials do not match active staff
        S->>D: Lookup staff by email
        D-->>S: missing or password mismatch
        S->>D: Record failed attempt
        Note over S,D: persists failed sign-in counter
        D-->>S: ack
        S-->>UI: Access denied without revealing other schools
        UI-->>U: Generic denial
    else sign in succeeds
        S->>D: Lookup staff by email
        D-->>S: active School Admin or Teacher
        S->>D: Write session
        Note over S,D: persists Session
        D-->>S: ack
        S-->>UI: Session established with role
        alt School Admin
            UI-->>U: Open school administration
        else Teacher
            UI-->>U: Open teacher workspace
        end
    end
    Note over U,S: Postcondition on success: staff in role-appropriate workspace for their school only
```

### Revoke teacher access

```mermaid
sequenceDiagram
    autonumber
    actor A as SchoolAdmin
    actor T as Teacher
    participant UI as ui
    participant S as service
    participant D as data-store

    Note over A,S: Precondition: School Admin signed in; Teacher is active at the school
    A->>UI: Revoke Teacher access
    UI->>S: Revoke Teacher
    alt caller is Teacher not School Admin
        S-->>UI: Only School Admin may manage staff
        UI-->>A: Deny action
    else revoke succeeds
        S->>D: Mark Teacher inactive and invalidate sessions
        Note over S,D: persists Teacher inactive and Session invalid
        D-->>S: ack
        S-->>UI: Teacher shown inactive on roster
        UI-->>A: See inactive on staff roster
        Note over T,S: Teacher next request with old session is denied
    end
    Note over A,S: Postcondition: Teacher inactive; cannot use teacher workspace
```

### Cross-school boundary

```mermaid
sequenceDiagram
    autonumber
    actor A as Staff
    participant UI as ui
    participant S as service
    participant D as data-store

    Note over A,S: Precondition: Staff signed in for school A
    A->>UI: Attempt to view or change school B administration
    UI->>S: Request school B admin data
    S->>D: Resolve caller school membership
    D-->>S: school A
    S-->>UI: Access denied with plain-language message
    UI-->>A: No school B data shown
    Note over A,S: Postcondition: no foreign tenant data leaked; denial logged
```

### AC → flow coverage

| AC | Where shown |
|---|---|
| AC-01 | Register school — success |
| AC-02 | Register school — validation alt |
| AC-02b | Register school — name taken alt |
| AC-03 | Invite teacher — success |
| AC-04 | Invite teacher — duplicate alt |
| AC-05 | Accept invite — success |
| AC-06 | Accept invite — expired/used alt |
| AC-06b | Accept invite — email elsewhere alt |
| AC-07 | Staff sign in — success |
| AC-08 | Staff sign in — bad credentials alt |
| AC-09 | Revoke teacher access — success |
| AC-10 | Revoke teacher access — Teacher caller alt (invite denial uses same role check on Invite teacher) |
| AC-11 | Cross-school boundary |
| AC-12 | Accept invite — email elsewhere alt |
| AC-13 | Reissue invite |

### Sequences flags

- Design seed diagrams replaced by this sequences pass (generic ui/service/data-store participants).
- Immediate session invalidation on revoke is intentional hardening vs AC-09 wording (see sad.md §1 Decision overrides).

## 7. Deployment view

Single-region pilot: API and staff web deploy as the existing monorepo apps; PostgreSQL is the primary store; email provider is an external SaaS. No new worker process in v1 — invite send is synchronous enqueue from the API request path (provider accepts quickly).

**Monitoring:**
- Metrics — registration success/failure, invite enqueue success, sign-in success/failure, lockout events, cross-tenant denial count
- Alerts — invite enqueue failure rate spike; registration rate-limit trips; any successful cross-tenant staff data view
- Tracing — spans on register, invite, accept, sign-in, revoke

**Scaling thresholds:**
- Comfortable for one pilot school’s staff counts in a single Postgres instance
- Revisit session-store partitioning only if concurrent staff sessions grow beyond pilot scale

## 8. Crosscutting concepts

| Concept | Convention | Where defined |
|---|---|---|
| Logging | Structured logs with `school_id`, `staff_id`, module name; never log passwords or raw invite tokens | CLAUDE.md + here |
| Authentication | HTTP-only session cookie; server-side session rows | ADR 0003 |
| Authorization | Every staff action checks school membership + role (School Admin vs Teacher) | spec §6.1 / here |
| Error handling | Domain errors → Problem Details JSON; web maps to plain language | architecture-map / ADR 0002 (repo) |
| ID strategy | ULID strings in app layer | docs/adr/0003 |
| Internationalisation | N/A — single language in pilot | — |
| Observability | Request-boundary tracing on auth use cases | §7 |
| Email | Outbound only via EmailPort | ADR 0004 |
| Rate limiting | Registration per contact domain; failed sign-in lockout | §10 / spec §6.1 |

## 9. Architecture decisions

| # | Title | Status | Section |
|---|---|---|---|
| 0001 | Own backend-service and web-frontend surfaces for school-auth | Accepted | §4 |
| 0002 | Use hybrid Next.js App Router for staff UI | Accepted | §4 |
| 0003 | Use HTTP-only cookie with server-side sessions | Accepted | §4 |
| 0004 | Send invites via email port and transactional provider | Accepted | §3 |
| 0005 | Split API into schools and users modules | Accepted | §5 |

ADR files live under `docs/features/school-auth/adr/`.

## 10. Quality requirements

Numbers from spec §6 NFR (updated in design for former TBD latency rows):

**QG-1. Tenant isolation**
- **When:** authenticated staff of school A attempt to view or change school B administration
- **Then:** access is denied with a plain-language message and no school B data is shown (spec AC-11); unauthorized cross-school access attempts target 0 confirmed breaches (spec §7)
- **How verify:** integration tests for cross-tenant denial; audit alert on successful cross-tenant view

**QG-2. Auth reliability for pilot onboarding**
- **When:** School Admin completes registration (including invite-path email enqueue on later invites) or staff sign in
- **Then:** p95 school registration ≤ 2s; p95 staff sign-in ≤ 500ms; auth availability 99.5% monthly; invite completion ≥ 70% within 7 days (spec §6)
- **How verify:** latency metrics in staging load smoke; production auth success rate; invite→active Teacher analytics

**QG-3. Immediate access revocation**
- **When:** School Admin revokes an active Teacher
- **Then:** Teacher appears inactive on roster and cannot open teacher workspace on subsequent requests (spec AC-09); session invalidated server-side
- **How verify:** integration test revoke → next authenticated request denied; session row removed or marked invalid

## 11. Risks and technical debt

| Risk / debt | Severity | Mitigation | Owner |
|---|---|---|---|
| Undelivered invite email blocks Teacher activation | High | EmailPort with retries; reissue invite (AC-13); monitor enqueue failures | Tech Lead |
| Self-serve fake schools | Medium | Rate limit 5 registrations/hour per contact domain; ops alert; create tenant (no hold) | Security Lead |
| Credential stuffing | Medium | Lockout after 5 failed sign-ins / 15 min; plain lock message | Security Lead |
| Architecture map stale vs HEAD | Low | Re-run survey after auth lands | Architect |
| No ux-flows.md yet | Medium | Run `/sdd:ux-flows school-auth` before screens | PM |

**Accepted debt (acceptable in v1, plan to fix later):**
- Single School Admin; no co-admin invites
- No MFA
- Email provider chosen at deploy time; logging adapter acceptable in local/dev
- Session store in primary Postgres (no dedicated session cache)

## 12. Glossary

| Term | Meaning |
|---|---|
| School Admin | Single staff member who registers the school and manages Teachers (see CONTEXT.md) |
| Teacher | Staff member activated via invite for one school |
| School (tenant) | Isolated organization boundary; unique display name |
| Work email | Valid deliverable email; at most one active school membership |
| Teacher invite | Pending invitation; expires after 14 days; reissue creates a new invite |
| Staff roster | Teachers with status pending / active / expired / inactive |
| School administration | Post-sign-in UI for School Admin |
| Teacher workspace | Post-sign-in UI for Teacher |
| Session | Server-side login state bound to HTTP-only cookie |

## Design edits-log

- §4 target_surfaces · approved · backend-service + web-frontend → ADR 0001
- §4 web UI · approved · hybrid App Router → ADR 0002
- §4 sessions · approved · cookie + server session → ADR 0003
- §3 email · approved · EmailPort + provider → ADR 0004
- §5 modules · approved · schools + users → ADR 0005
- §10 NFR · approved · p95 2s / 500ms; rate limits 5/h domain; lockout 5/15m
- critic F1 · override · immediate revoke vs AC-09 → §1 Decision overrides
- critic F6 · amendment · ADR 0004 email latency wording fixed to invite path
