---
status: draft
feature_size: M
tool: code
updated_at: 2026-10-03
---

# Screens — school-auth

> The canonical **screen manifest** — every screen in every state — produced by `screens` (between
> `api` and `tasks`) and read by `tasks` / `implement` / `review`.

## Source

- **Tool:** code (degradation — `docs/design-system.md` absent; no Figma/Pencil MCP; recommend `/sdd:design-system`)
- **File:** inline wireframes below
- **Inventory gap:** `ux-flows.md` absent — SCR list derived from spec §4 + sad.md §6 + OpenAPI (noted; not invented beyond those flows)

### Derived SCR inventory

| Id | Screen | Primary actors | Spec / flows |
|---|---|---|---|
| SCR-01 | Register school | School Admin (prospective) | US-01 · Register school |
| SCR-02 | Staff sign in | School Admin, Teacher | US-04 · Staff sign in |
| SCR-03 | Accept invite | Teacher | US-03 · Accept invite |
| SCR-04 | School administration (staff roster) | School Admin | US-02, US-05, US-06 · Invite / Revoke / roster |
| SCR-05 | Teacher workspace shell | Teacher | US-04 success · placeholder until journal features |

## Screens

### SCR-01 — Register school

| State | Trigger / condition | Components | Source-ref |
|---|---|---|---|
| default | Open public register page | NEW: PageShell, NEW: TextField, NEW: PasswordField, NEW: Button, NEW: Form | wireframe default |
| loading | Submit in flight (`registerSchool`) | NEW: Button (disabled), NEW: Spinner | wireframe loading |
| validation | AC-02 / `school.validation_failed` 400 | NEW: FieldError, NEW: Alert | wireframe validation |
| error | AC-02b / `school.name_taken` 409; `school.registration_rate_limited` 429 | NEW: Alert | wireframe error |
| success | AC-01 / 201 → redirect school administration | N/A: navigates to SCR-04 | N/A: redirect |
| empty | N/A: form always has fields | — | N/A: not a list screen |

```text
SCR-01 default
+------------------------------------------+
| schoolo                                  |
| Register your school                     |
| [ School display name                  ] |
| [ Work email                           ] |
| [ Password (min 12)                    ] |
| [ Create school ]                        |
| Already have an account? Sign in         |
+------------------------------------------+
```

```text
SCR-01 validation / error
+------------------------------------------+
| ! Fix the highlighted fields             |
|   or: School name is already in use      |
|   or: Too many attempts — try later      |
| [ fields with FieldError ]               |
| [ Create school ]                        |
+------------------------------------------+
```

### SCR-02 — Staff sign in

| State | Trigger / condition | Components | Source-ref |
|---|---|---|---|
| default | Open sign-in | NEW: PageShell, NEW: TextField, NEW: PasswordField, NEW: Button | wireframe default |
| loading | Submit in flight (`signIn`) | NEW: Spinner, NEW: Button (disabled) | wireframe loading |
| error | AC-08 / `auth.denied` 401 | NEW: Alert (generic denial) | wireframe error |
| error-locked | §6.1 / `auth.locked` 423 | NEW: Alert | wireframe error-locked |
| success | AC-07 / 200 → SCR-04 or SCR-05 by role | N/A: redirect | N/A: redirect |
| empty | N/A: form screen | — | N/A: not a list |
| validation | empty fields client-side | NEW: FieldError | wireframe validation |

```text
SCR-02 default
+------------------------------------------+
| Sign in                                  |
| [ Work email                           ] |
| [ Password                             ] |
| [ Sign in ]                              |
| Register a school                        |
+------------------------------------------+
```

### SCR-03 — Accept invite

| State | Trigger / condition | Components | Source-ref |
|---|---|---|---|
| default | Open invite link with token | NEW: PageShell, NEW: PasswordField, NEW: Button, NEW: Text (school context) | wireframe default |
| loading | Submit (`acceptInvite`) | NEW: Spinner | wireframe loading |
| validation | AC password / `invite.validation_failed` 400 | NEW: FieldError | wireframe validation |
| error | AC-06 / `invite.invalid` 410 | NEW: Alert + link cue to contact School Admin | wireframe error |
| error-elsewhere | AC-06b/AC-12 / `invite.email_elsewhere` 409 | NEW: Alert | wireframe error-elsewhere |
| success | AC-05 / 201 → SCR-05 | N/A: redirect | N/A: redirect |
| empty | N/A | — | N/A: not a list |

```text
SCR-03 default
+------------------------------------------+
| Join your school                         |
| You've been invited as a Teacher         |
| [ Choose password (min 12)             ] |
| [ Accept invite ]                        |
+------------------------------------------+
```

### SCR-04 — School administration (staff roster)

| State | Trigger / condition | Components | Source-ref |
|---|---|---|---|
| default | School Admin session; roster loaded | NEW: AppShell, NEW: RosterTable, NEW: Button, NEW: TextField (invite email), NEW: StatusBadge | wireframe default |
| loading | `listStaffRoster` in flight | NEW: SkeletonTable | wireframe loading |
| empty | No teachers/invites yet | NEW: EmptyState + invite form | wireframe empty |
| error | `school.forbidden` 403 (US-06) | NEW: Alert | wireframe error |
| validation | Invite email invalid client-side | NEW: FieldError | wireframe validation |
| invite-error | AC-04 / `invite.duplicate` 409; `staff.forbidden` | NEW: Alert | wireframe invite-error |
| invite-success | AC-03 / 201 pending row | NEW: StatusBadge pending + toast/inline success | wireframe default (updated row) |
| revoke-success | AC-09 / status inactive | NEW: StatusBadge inactive | wireframe default |
| reissue-success | AC-13 / new pending | NEW: StatusBadge pending | wireframe default |

```text
SCR-04 default
+------------------------------------------+
| School administration          [Sign out]|
| Pilot School                             |
| Invite teacher                           |
| [ work email ] [ Send invite ]           |
| Staff roster                             |
| email              status      actions   |
| t@example.test     pending   [Reissue]   |
| u@example.test     active    [Revoke]    |
+------------------------------------------+
```

```text
SCR-04 empty
+------------------------------------------+
| No teachers yet                          |
| Invite your first Teacher by work email  |
| [ work email ] [ Send invite ]           |
+------------------------------------------+
```

### SCR-05 — Teacher workspace shell

| State | Trigger / condition | Components | Source-ref |
|---|---|---|---|
| default | Teacher session after sign-in/accept | NEW: AppShell, NEW: Text (placeholder home) | wireframe default |
| loading | Session bootstrap | NEW: Spinner | wireframe loading |
| error | Session revoked / forbidden on next request (AC-09 hardening) | NEW: Alert + link to SCR-02 | wireframe error |
| empty | N/A: shell has placeholder copy, not a list | — | N/A: journal empty states later |
| success | N/A: landing is default | — | N/A: no separate success |

```text
SCR-05 default
+------------------------------------------+
| Teacher workspace              [Sign out]|
| Welcome — journal tools come next        |
| (Homework / grades placeholders)         |
+------------------------------------------+
```

## New components

| Component | Why no existing primitive fits | Registered in design-system |
|---|---|---|
| PageShell | No `docs/design-system.md`; public auth layout | pending |
| AppShell | Authenticated chrome (nav + sign out) | pending |
| TextField / PasswordField / Button / Form / FieldError | Intended shadcn-style primitives (architecture-map) but not inventoried yet | pending |
| Alert | Inline error/success messaging for contract codes | pending |
| Spinner / SkeletonTable | Loading affordances | pending |
| EmptyState | Roster empty | pending |
| RosterTable / StatusBadge | Staff roster domain UI | pending |

None of these invent a second styling system — implement should land them as shadcn/ui under `apps/web/components/ui/` and register into `docs/design-system.md` when that canon exists.
