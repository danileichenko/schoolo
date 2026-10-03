---
status: Draft
owner: Volodymyr Danileichenko
reviewers: ["Tech Lead", "Security Lead"]
updated_at: 2026-10-03
feature_size: M
---

# Spec — school-auth

> **Glossary:** [CONTEXT](./CONTEXT.md)
> **Reference module / docs / channels used:** `docs/idea-brief.md` (mandatory school rollout, roles, parent portal deferred)

## 1. Context

Mandatory school rollouts fail when teachers keep using unofficial channels because they never receive a trusted account on the official system. schoolo needs a tenant and staff-identity foundation before schedule, homework, or grades can ship: every teacher action must be attributable to a person within exactly one school.

The product strategy is a big-bang pilot replacing an incumbent journal; staff must be on board before students matter. Parent accounts and student mobile sign-in are explicitly deferred elsewhere in the product brief.

The committed approach for this slice is **self-serve school registration** (first user becomes **School Admin**), **teacher access only via work-email invite**, and a **staff roster of teachers** on web. **Students, classes, and enrollments are not in this feature** — they follow in a separate increment so admin and teacher auth can ship first.

Ideation note (medium depth): the main failure modes are undelivered invite email, self-serve signup abuse (fake schools), and cross-school access if tenancy checks are weak; the spec prioritizes clear school isolation and plain-language denial over feature breadth.

## 2. Goals

- Enable a **School Admin** to stand up an isolated **School (tenant)** and become its administrator without platform-operator involvement.
- Enable a **School Admin** to invite **Teachers** by work email and see invite status on the **staff roster**.
- Enable a **Teacher** to accept an invite, authenticate, and reach the teacher workspace scoped to exactly one school.
- Establish authorization rules so staff from one school cannot access another school's data or administration.

## 3. Non-goals

- **Student accounts, class structure, and enrollments** — required later for the student mobile app; avoids blocking teacher web on roster complexity.
- **Parent accounts or premium parent access** — product brief defers parent portal in v1.
- **Enterprise SSO (Google/Microsoft)** — may come for larger deals; pilot uses native credentials after email invite.
- **Platform-operator console** to create schools — only self-serve registration in this slice; internal ops provisioning is a follow-up if sales needs it.

## 4. User stories

### US-01: Register school

**As a** School Admin  
**I want** to register my school and create my administrator account  
**So that** our institution has an isolated tenant before inviting staff  

### US-02: Invite teacher

**As a** School Admin  
**I want** to invite a Teacher by work email  
**So that** they can access our school's teacher workspace  

### US-03: Accept invite

**As a** Teacher  
**I want** to complete my invitation and set credentials  
**So that** I can sign in to the correct school  

### US-04: Sign in

**As a** Teacher  
**I want** to sign in on later visits  
**So that** I can continue working in my school's workspace  

### US-05: Manage staff access

**As a** School Admin  
**I want** to view the staff roster and revoke a Teacher's access  
**So that** departed staff lose access to our school  

### US-06: Protect school boundary

**As a** School Admin  
**I want** the system to ensure only our school's staff see our administration  
**So that** mandatory rollout meets basic confidentiality expectations  

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** no school exists yet for the organization being registered  
**When** a prospective School Admin completes valid school registration and account details  
**Then** the system creates the school tenant, assigns them as School Admin, and confirms they can open school administration  

### AC-02 (US-01) — error

**Given** a prospective School Admin submits registration with a missing or invalid school name or contact email  
**When** they attempt to finish registration  
**Then** the system blocks completion and shows which required information must be corrected  

### AC-03 (US-02) — happy path

**Given** a signed-in School Admin for a school  
**When** they invite a Teacher using a valid work email not already active for that school  
**Then** the system records a pending Teacher invite and shows it on the staff roster as awaiting acceptance  

### AC-04 (US-02) — domain invariant

**Given** a Teacher is already active for the school  
**When** the School Admin attempts to invite the same work email again  
**Then** the system blocks the duplicate and explains that the person is already on the staff roster  

### AC-05 (US-03) — happy path

**Given** a pending Teacher invite for a specific school  
**When** the invitee completes the invitation flow with acceptable credentials  
**Then** the system activates their Teacher access for that school only and confirms they can open the teacher workspace  

### AC-06 (US-03) — error

**Given** a Teacher invite link that is expired or already used  
**When** the invitee attempts to complete setup  
**Then** the system blocks access and explains that they must request a new invite from their School Admin  

### AC-07 (US-04) — happy path

**Given** an active Teacher with valid credentials  
**When** they sign in  
**Then** the system opens the teacher workspace for their school  

### AC-08 (US-04) — authorization

**Given** a person attempts to sign in with credentials that do not match an active Teacher or School Admin  
**When** they submit sign-in  
**Then** the system denies access without revealing whether the email exists in another school  

### AC-09 (US-05) — happy path

**Given** a signed-in School Admin  
**When** they revoke an active Teacher's access  
**Then** the Teacher no longer appears as active on the staff roster and cannot open the teacher workspace on subsequent sign-in  

### AC-10 (US-05) — authorization

**Given** a signed-in Teacher  
**When** they attempt to invite another Teacher or revoke someone else's access  
**Then** the system denies the action and explains that only a School Admin may manage staff  

### AC-11 (US-06) — authorization

**Given** a signed-in School Admin or Teacher belonging to school A  
**When** they attempt to view or change administration data for school B  
**Then** the system denies access or shows no data from school B  

### AC-12 (US-06) — cross-context

**Given** a Teacher invite issued for school A  
**When** the invitee attempts to complete setup while authenticated as staff of school B  
**Then** the system blocks completion and explains that the invite belongs to a different school  

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 school registration (complete flow) | ≤ TBD | owner: Tech Lead, due: before sdd:design |
| Latency p95 teacher sign-in | ≤ TBD | owner: Tech Lead, due: before sdd:design |
| Availability auth flows | 99.5% monthly | auth success rate in production monitoring |
| Invite completion rate (pilot) | ≥ 70% within 7 days of invite | product analytics on invite → active Teacher |

## 6.1 Security / privacy

- **Data classification:** confidential — school and staff identity data.
- **Personal data touched:** School Admin and Teacher names, work emails, authentication secrets (hashed), school legal/display name, audit timestamps.
- **AuthZ/AuthN impact:** New authenticated sessions for School Admin and Teacher; every staff action evaluated against school membership and role; cross-school queries return empty or denial consistently.
- **Abuse cases:**
  - **Cross-tenant access:** deny and log; never show another school's roster or admin screens.
  - **Invite enumeration:** sign-in and invite completion must not reveal whether an email is registered at a different school.
  - **Self-serve spam schools:** rate-limit registrations per contact domain and flag for manual review when volume spikes.
  - **Credential stuffing:** lockout or backoff after repeated failed sign-ins for the same account.
  - **Stale invites:** expired invites cannot activate; School Admin can reissue.
- **Security review:** Required — new auth boundary and staff personal data.

## 7. Metrics / KPIs

- **Active teachers per pilot school** — baseline: 0, target: ≥ 80% of invited teachers active within 14 days of first invite (aligns with idea-brief teacher compliance goal).
- **Invite acceptance time** — baseline: TBD at pilot start, target: median ≤ 48 hours from invite to active Teacher during pilot month 1.
- **Unauthorized cross-school access attempts** — baseline: 0 incidents, target: 0 confirmed breaches; alert on any successful cross-tenant staff data view in audit logs.

## 8. Open questions

- [ ] Minimum password rules and optional second factor for School Admin in pilot? Default now: password policy aligned with common school IT expectations; MFA optional later. — owner: Security Lead, due: before sdd:design
- [ ] How long Teacher invites remain valid? Default now: 14 days then reissue. — owner: PM, due: before sdd:tasks
- [ ] Manual review process for suspicious self-serve school registrations? Default now: ops email alert only. — owner: PM, due: before pilot contract
