import { recordFailedSignIn, signInDeniedError } from "../domain/staff-rules.js";
import type { SessionRepository, StaffMemberRepository } from "./ports.js";
import { hashToken, newId, newOpaqueToken, verifyPassword } from "./crypto.js";

export async function signIn(
  input: { workEmail: string; password: string },
  deps: {
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
        role: "school_admin" | "teacher";
        status: "active";
        workEmail: string;
      };
      sessionToken: string;
    }
  | { ok: false; code: "auth.denied" | "auth.locked"; message: string }
> {
  const now = deps.now ?? new Date();
  const email = input.workEmail.trim().toLowerCase();
  const member = await deps.staff.findByWorkEmail(email);
  if (!member || member.status !== "active") {
    const err = signInDeniedError();
    return { ok: false, code: err.code, message: err.message };
  }
  if (member.lockedUntil && member.lockedUntil.getTime() > now.getTime()) {
    return {
      ok: false,
      code: "auth.locked",
      message: "Account temporarily locked. Try again later.",
    };
  }
  const unlocked =
    member.lockedUntil && member.lockedUntil.getTime() <= now.getTime()
      ? { ...member, failedSignInCount: 0, lockedUntil: null }
      : member;
  if (!verifyPassword(input.password, unlocked.passwordHash)) {
    const next = recordFailedSignIn(
      {
        failedSignInCount: unlocked.failedSignInCount,
        lockedUntil: unlocked.lockedUntil,
      },
      now,
    );
    await deps.staff.update({
      ...unlocked,
      failedSignInCount: next.failedSignInCount,
      lockedUntil: next.lockedUntil,
    });
    if (next.lockedUntil && next.lockedUntil.getTime() > now.getTime()) {
      return {
        ok: false,
        code: "auth.locked",
        message: "Account temporarily locked. Try again later.",
      };
    }
    const err = signInDeniedError();
    return { ok: false, code: err.code, message: err.message };
  }

  await deps.staff.update({
    ...unlocked,
    failedSignInCount: 0,
    lockedUntil: null,
  });
  const sessionToken = newOpaqueToken();
  await deps.sessions.create({
    id: newId(),
    staffMemberId: unlocked.id,
    tokenHash: hashToken(sessionToken),
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    revokedAt: null,
    createdAt: now,
  });
  return {
    ok: true,
    school: { id: unlocked.schoolId },
    staff: {
      id: unlocked.id,
      role: unlocked.role,
      status: "active",
      workEmail: unlocked.workEmail,
    },
    sessionToken,
  };
}
