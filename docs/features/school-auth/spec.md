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

The committed approach for this slice is **self-serve school registration** (first user becomes the **single School Admin** for that school), **teacher access only via work-email invite**, and a **staff roster of teachers** on web. **Students, classes, and enrollments are not in this feature** — they follow in a separate increment so admin and teacher auth can ship first.

**Pilot identity rules (clarified):** registration collects **school display name**, **School Admin work email**, and **password** (minimum 12 characters; no MFA in this feature). A **work email** is any deliverable address in valid format. Each work email may belong to **at most one school** as active staff. **Teacher invites expire after 14 days**; the School Admin reissues by creating a new invite. Suspicious self-serve registrations still **create the tenant**; operations receives an alert for manual follow-up.

Ideation note (medium depth): the main failure modes are undelivered invite email, self-serve signup abuse (fake schools), and cross-school access if tenancy checks are weak; the spec prioritizes clear school isolation and plain-language denial over feature breadth.

## 2. Goals

- Enable a **School Admin** to stand up an isolated **School (tenant)** and become its administrator without platform-operator involvement.
- Enable a **School Admin** to invite **Teachers** by work email and see invite status on the **staff roster**.
- Enable a **Teacher** to accept an invite, authenticate, and reach the **teacher workspace** scoped to exactly one school.
- Enable the **School Admin** to sign in after registration and reach **school administration** (same credential model as Teachers).
- Establish authorization rules so staff from one school cannot access another school's data or administration.

## 3. Non-goals

- **Student accounts, class structure, and enrollments** — required later for the student mobile app; avoids blocking teacher web on roster complexity.
- **Parent accounts or premium parent access** — product brief defers parent portal in v1.
- **Enterprise SSO (Google/Microsoft)** — may come for larger deals; pilot uses native credentials after email invite.
- **Platform-operator console** to create schools — only self-serve registration in this slice; internal ops provisioning is a follow-up if sales needs it.
- **Multiple School Admins or co-admin invites** — single School Admin per school in this feature.
- **Multi-school staff membership** — one active staff membership per work email across the product.

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

### US-04: Staff sign in

**As a** School Admin or Teacher  
**I want** to sign in on later visits  
**So that** I can reach school administration or the teacher workspace for my school  

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

**Given** no school tenant exists yet with the same school display name being registered  
**When** a prospective School Admin completes registration with school display name, their work email, and an acceptable password  
**Then** the system creates the school tenant, assigns them as the School Admin, and confirms they can open school administration  

### AC-02 (US-01) — error

**Given** a prospective School Admin submits registration with a missing or invalid school display name, work email, or password shorter than 12 characters  
**When** they attempt to finish registration  
**Then** the system blocks completion and shows which required information must be corrected  

### AC-02b (US-01) — domain invariant

**Given** a school tenant already exists with the same school display name  
**When** another prospective School Admin attempts to register that display name  
**Then** the system blocks registration and explains that the school name is already in use  

### AC-03 (US-02) — happy path

**Given** a signed-in School Admin for a school  
**When** they invite a Teacher using a valid work email with no pending or active Teacher record for that email at the school  
**Then** the system records a pending Teacher invite and shows it on the staff roster as awaiting acceptance  

### AC-04 (US-02) — domain invariant

**Given** a Teacher is already active for the school, or a pending invite exists for the same work email at the school  
**When** the School Admin attempts to invite that work email again  
**Then** the system blocks the duplicate and explains the person is already invited or active on the staff roster  

### AC-05 (US-03) — happy path

**Given** a pending Teacher invite for a specific school that is not expired  
**When** the invitee completes the invitation flow with an acceptable password  
**Then** the system activates their Teacher access for that school only and confirms they can open the teacher workspace  

### AC-06 (US-03) — error

**Given** a Teacher invite link that is expired or already used  
**When** the invitee attempts to complete setup  
**Then** the system blocks access and explains that they must request a new invite from their School Admin  

### AC-06b (US-03) — cross-context

**Given** a work email that is already active staff at another school  
**When** the invitee attempts to complete setup for a new school  
**Then** the system blocks activation and explains that the email is already tied to another school  

### AC-07 (US-04) — happy path

**Given** an active School Admin or Teacher with valid credentials  
**When** they sign in  
**Then** the system opens school administration for the School Admin or the teacher workspace for the Teacher, for their school only  

### AC-08 (US-04) — authorization

**Given** a person attempts to sign in with credentials that do not match an active School Admin or Teacher  
**When** they submit sign-in  
**Then** the system denies access without revealing whether the email exists in another school  

### AC-09 (US-05) — happy path

**Given** a signed-in School Admin  
**When** they revoke an active Teacher's access  
**Then** the Teacher appears on the staff roster as inactive, and cannot open the teacher workspace on subsequent sign-in  

### AC-10 (US-05) — authorization

**Given** a signed-in Teacher  
**When** they attempt to invite another Teacher or revoke someone else's access  
**Then** the system denies the action and explains that only the School Admin may manage staff  

### AC-11 (US-06) — authorization

**Given** a signed-in School Admin or Teacher belonging to school A  
**When** they attempt to view or change administration data for school B  
**Then** the system denies access with a plain-language message and shows no data from school B  

### AC-12 (US-06) — cross-context

**Given** a Teacher invite issued for school A  
**When** the invitee attempts to complete setup while already active staff of school B  
**Then** the system blocks completion and explains that the email is already tied to another school  

### AC-13 (US-02) — happy path (reissue)

**Given** a pending or expired Teacher invite for a work email at the school  
**When** the School Admin reissues an invite for that email  
**Then** the system creates a new pending invite, marks the prior invite invalid, and shows the new pending state on the staff roster  

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 school registration (complete flow) | ≤ 2s | registration duration histogram in staging/production |
| Latency p95 staff sign-in | ≤ 500ms | sign-in duration histogram in staging/production |
| Availability auth flows | 99.5% monthly | auth success rate in production monitoring |
| Invite completion rate (pilot) | ≥ 70% within 7 days of invite | product analytics on invite → active Teacher |
| Registration rate limit | ≤ 5/hour per contact domain | rate-limit counter + ops alert |
| Failed sign-in lockout | 5 failures → lock 15 min | lockout events metric |

## 6.1 Security / privacy

- **Data classification:** confidential — school and staff identity data.
- **Personal data touched:** School Admin and Teacher names, work emails, authentication secrets (hashed), school display name, audit timestamps.
- **AuthZ/AuthN impact:** New authenticated sessions for School Admin and Teacher; every staff action evaluated against school membership and role; cross-school queries denied explicitly with no foreign data shown.
- **Abuse cases:**
  - **Cross-tenant access:** deny with plain message and log; never show another school's roster or admin screens.
  - **Invite enumeration:** sign-in and invite completion must not reveal whether an email is registered at a different school.
  - **Self-serve spam schools:** rate-limit registrations per contact domain; create tenant and send operations alert when volume spikes (no automatic hold in v1).
  - **Credential stuffing:** temporary lockout after repeated failed sign-ins for the same account, with a plain-language message when locked.
  - **Stale invites:** expired invites cannot activate; expired pending invites remain visible as expired until reissued; School Admin reissue creates a new invite.
- **Security review:** Required — new auth boundary and staff personal data.
- **Password policy (pilot):** minimum 12 characters; no MFA in this feature.

## 7. Metrics / KPIs

- **Active teachers per pilot school** — baseline: 0, target: ≥ 80% of invited teachers active within 14 days of first invite (aligns with idea-brief teacher compliance goal).
- **Invite acceptance time** — baseline: TBD at pilot start, target: median ≤ 48 hours from invite to active Teacher during pilot month 1.
- **Unauthorized cross-school access attempts** — baseline: 0 incidents, target: 0 confirmed breaches; alert on any successful cross-tenant staff data view in audit logs.

## 8. Open questions

- [x] Latency targets for registration and sign-in flows? Resolved in design: p95 registration ≤ 2s; p95 sign-in ≤ 500ms. — owner: Tech Lead, due: done in sdd:design
- [x] Exact rate-limit thresholds for registrations and failed sign-ins? Resolved in design: ≤ 5 registrations/hour per contact domain; lockout after 5 failures / 15 min. — owner: Security Lead, due: done in sdd:design
- [ ] Which transactional email provider for pilot (and local logging adapter vs sandbox)? Default now: logging adapter in local/dev; provider chosen before pilot. — owner: Tech Lead, due: before pilot contract

## Clarify edits-log

- unstated-assumption · §2/§3 · resolved · single School Admin; one school per staff email
- missing-actor · §4 US-04 · resolved · School Admin included in staff sign-in
- undefined-term · CONTEXT · resolved · work email, workspaces, reissue, roster statuses
- under-specified-AC · §5 · resolved · pending duplicate invites, duplicate school name, reissue, inactive roster, cross-school email
- conflicting-requirement · AC-11 · resolved · explicit denial only
- unmeasured-NFR · §6 · deferred · latency TBD → §8
- scope-creep · §3 · resolved · resend/cancel/edit email out; reissue only via AC-13
