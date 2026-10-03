# API sync report — school-auth

Generated from `data-model.md` + `sad.md` §6 + `spec.md` §4/§5. Auth scheme: **CookieAuth** (`schoolo_session`) per ADR 0003 (not Bearer).

## A — Field origins

| schema_path | origin | confidence |
|---|---|---|
| RegisterSchoolRequest.name | data-model.md → schools.name | high |
| RegisterSchoolRequest.work_email | data-model.md → staff_members.work_email | high |
| RegisterSchoolRequest.password | spec §5 AC-01/AC-02 (min 12); not stored plaintext | high |
| SignInRequest.work_email | data-model.md → staff_members.work_email | high |
| SignInRequest.password | credentials check against password_hash | high |
| AcceptInviteRequest.password | spec AC-05; staff_members.password_hash | high |
| InviteTeacherRequest.work_email | data-model.md → teacher_invites.work_email | high |
| TeacherInvite.* | data-model.md → teacher_invites.* (no token_hash in response) | high |
| StaffMember.* | data-model.md → staff_members.* (no password_hash / lockout fields in response) | high |
| School.* | data-model.md → schools.* | high |
| StaffRosterPage.* | derived (cursor wrapper) + roster query | high |
| inviteToken path | opaque secret; server looks up teacher_invites.token_hash | medium |

## B — Drift checklist

1. **Endpoint ↔ data-model** — ✓  
   register/sign-in/accept → schools, staff_members, sessions; invites → teacher_invites; roster/revoke → staff_members (+ invites for roster).

2. **Error code ↔ repo error definition** — ✓ (proposal)  
   No central error registry in repo yet — codes below are the contract proposal; reconcile when `implement` adds Problem Details mapping.

3. **Validation ↔ constraint** — ✓  
   password `minLength: 12`; email format; ULID-shaped path ids `minLength/maxLength: 26`; school name maxLength 200 (app bound).

4. **OpenAPI ↔ sequence** — ✓  
   Register / Invite / Reissue / Accept / Sign-in / Revoke / Cross-school (403 on school-scoped routes) match §6 alts.

## C — AC → operation coverage

| AC | Operation / response |
|---|---|
| AC-01 | `registerSchool` 201 |
| AC-02 | `registerSchool` 400 `school.validation_failed` |
| AC-02b | `registerSchool` 409 `school.name_taken` |
| AC-03 | `inviteTeacher` 201 |
| AC-04 | `inviteTeacher` 409 `invite.duplicate` |
| AC-05 | `acceptInvite` 201 |
| AC-06 | `acceptInvite` 410 `invite.invalid` |
| AC-06b | `acceptInvite` 409 `invite.email_elsewhere` |
| AC-07 | `signIn` 200 |
| AC-08 | `signIn` 401 `auth.denied` |
| AC-09 | `revokeTeacher` 200 |
| AC-10 | `inviteTeacher` / `revokeTeacher` 403 `staff.forbidden` |
| AC-11 | school-scoped routes 403 `school.forbidden` |
| AC-12 | `acceptInvite` 409 `invite.email_elsewhere` |
| AC-13 | `reissueTeacherInvite` 201 |

## D — Proposed error codes (no registry yet)

`school.validation_failed`, `school.name_taken`, `school.registration_rate_limited`, `school.forbidden`, `auth.denied`, `auth.locked`, `invite.validation_failed`, `invite.invalid`, `invite.email_elsewhere`, `invite.duplicate`, `invite.not_found`, `staff.forbidden`, `staff.not_found`.

## E — Notes

- No `events.md` — invite email is synchronous enqueue in §6 (no message-bus retry/DLQ flow).
- UI surface consumes this contract; does not author a second one.
- Sign-out not in §4 US — omitted; add via specify/clarify if needed.
