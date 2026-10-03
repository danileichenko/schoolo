import { assertPassword, canAcceptInvite } from "../domain/staff-rules.js";
import type {
  SessionRepository,
  StaffMemberRepository,
  TeacherInviteRepository,
} from "./ports.js";
import { hashPassword, hashToken, newId, newOpaqueToken } from "./crypto.js";

export async function acceptInvite(
  input: { inviteToken: string; password: string },
  deps: {
    invites: TeacherInviteRepository;
    staff: StaffMemberRepository;
    sessions: SessionRepository;
    now?: Date;
  },
): Promise<
  | {
      ok: true;
      school: { id: string };
      staff: {
        id: string;
        role: "teacher";
        status: "active";
        workEmail: string;
      };
      sessionToken: string;
    }
  | {
      ok: false;
      code:
        | "invite.validation_failed"
        | "invite.invalid"
        | "invite.email_elsewhere";
      message: string;
      fields?: string[];
    }
> {
  const pwd = assertPassword(input.password);
  if (!pwd.ok) {
    return {
      ok: false,
      code: pwd.code,
      message: "Password must be at least 12 characters",
      fields: pwd.fields,
    };
  }
  const invite = await deps.invites.findByTokenHash(hashToken(input.inviteToken));
  if (!invite) {
    return {
      ok: false,
      code: "invite.invalid",
      message: "Request a new invite from your School Admin",
    };
  }
  const now = deps.now ?? new Date();
  const elsewhere = await deps.staff.findByWorkEmail(invite.workEmail);
  const emailActiveElsewhere = !!(
    elsewhere &&
    elsewhere.status === "active" &&
    elsewhere.schoolId !== invite.schoolId
  );
  const check = canAcceptInvite({
    status: invite.status,
    expiresAt: invite.expiresAt,
    now,
    emailActiveElsewhere,
  });
  if (!check.ok) {
    return { ok: false, code: check.code, message: check.message };
  }

  const staffId = newId();
  await deps.staff.create({
    id: staffId,
    schoolId: invite.schoolId,
    workEmail: invite.workEmail,
    passwordHash: hashPassword(input.password),
    role: "teacher",
    status: "active",
    failedSignInCount: 0,
    lockedUntil: null,
    createdAt: now,
  });
  await deps.invites.update({ ...invite, status: "used" });
  const sessionToken = newOpaqueToken();
  await deps.sessions.create({
    id: newId(),
    staffMemberId: staffId,
    tokenHash: hashToken(sessionToken),
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    revokedAt: null,
    createdAt: now,
  });
  return {
    ok: true,
    school: { id: invite.schoolId },
    staff: {
      id: staffId,
      role: "teacher",
      status: "active",
      workEmail: invite.workEmail,
    },
    sessionToken,
  };
}
