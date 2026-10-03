export type StaffRole = "school_admin" | "teacher";
export type StaffStatus = "active" | "inactive";
export type InviteStatus = "pending" | "expired" | "used" | "invalid";

export function assertPassword(
  password: string,
): { ok: true } | { ok: false; code: "invite.validation_failed"; fields: string[] } {
  if (password.length < 12) {
    return { ok: false, code: "invite.validation_failed", fields: ["password"] };
  }
  return { ok: true };
}

export function canInviteTeacher(input: {
  workEmail: string;
  hasPendingInvite: boolean;
  hasActiveTeacher: boolean;
}):
  | { ok: true }
  | { ok: false; code: "invite.duplicate"; message: string } {
  void input.workEmail;
  if (input.hasPendingInvite || input.hasActiveTeacher) {
    return {
      ok: false,
      code: "invite.duplicate",
      message: "This person is already invited or active on the staff roster",
    };
  }
  return { ok: true };
}

export function canAcceptInvite(input: {
  status: InviteStatus;
  expiresAt: Date;
  now: Date;
  emailActiveElsewhere: boolean;
}):
  | { ok: true }
  | {
      ok: false;
      code: "invite.invalid" | "invite.email_elsewhere";
      message: string;
    } {
  const expiredByTime = input.expiresAt.getTime() <= input.now.getTime();
  if (input.status !== "pending" || expiredByTime) {
    return {
      ok: false,
      code: "invite.invalid",
      message: "Request a new invite from your School Admin",
    };
  }
  if (input.emailActiveElsewhere) {
    return {
      ok: false,
      code: "invite.email_elsewhere",
      message: "This email is already tied to another school",
    };
  }
  return { ok: true };
}

export function recordFailedSignIn(
  state: { failedSignInCount: number; lockedUntil: Date | null },
  now: Date,
): { failedSignInCount: number; lockedUntil: Date | null } {
  const failedSignInCount = state.failedSignInCount + 1;
  if (failedSignInCount >= 5) {
    return {
      failedSignInCount,
      lockedUntil: new Date(now.getTime() + 15 * 60 * 1000),
    };
  }
  return { failedSignInCount, lockedUntil: state.lockedUntil };
}

export function revokeTeacherAccess<T extends { revokedAt: Date | null }>(input: {
  role: StaffRole;
  status: StaffStatus;
  sessions: T[];
  now: Date;
}): { status: StaffStatus; sessions: T[] } {
  void input.role;
  void input.status;
  return {
    status: "inactive",
    sessions: input.sessions.map((s) => ({ ...s, revokedAt: input.now })),
  };
}

export function signInDeniedError(): { code: "auth.denied"; message: string } {
  return { code: "auth.denied", message: "Access denied" };
}
