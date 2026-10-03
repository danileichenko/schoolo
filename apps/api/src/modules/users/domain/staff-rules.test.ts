import { describe, expect, it } from "vitest";
import {
  assertPassword,
  canAcceptInvite,
  canInviteTeacher,
  recordFailedSignIn,
  revokeTeacherAccess,
  signInDeniedError,
} from "./staff-rules.js";

describe("users domain rules", () => {
  it("requires password length >= 12 (AC-05 validation)", () => {
    expect(assertPassword("short")).toEqual({
      ok: false,
      code: "invite.validation_failed",
      fields: ["password"],
    });
    expect(assertPassword("correct-horse")).toEqual({ ok: true });
  });

  it("blocks duplicate pending or active invite at school (AC-04)", () => {
    expect(
      canInviteTeacher({
        workEmail: "t@example.test",
        hasPendingInvite: true,
        hasActiveTeacher: false,
      }),
    ).toEqual({
      ok: false,
      code: "invite.duplicate",
      message: "This person is already invited or active on the staff roster",
    });
    expect(
      canInviteTeacher({
        workEmail: "t@example.test",
        hasPendingInvite: false,
        hasActiveTeacher: true,
      }),
    ).toMatchObject({ ok: false, code: "invite.duplicate" });
    expect(
      canInviteTeacher({
        workEmail: "t@example.test",
        hasPendingInvite: false,
        hasActiveTeacher: false,
      }),
    ).toEqual({ ok: true });
  });

  it("accepts only pending non-expired invites (AC-05, AC-06)", () => {
    const now = new Date("2026-10-03T12:00:00Z");
    expect(
      canAcceptInvite({
        status: "pending",
        expiresAt: new Date("2026-10-10T12:00:00Z"),
        now,
        emailActiveElsewhere: false,
      }),
    ).toEqual({ ok: true });
    expect(
      canAcceptInvite({
        status: "expired",
        expiresAt: new Date("2026-09-01T12:00:00Z"),
        now,
        emailActiveElsewhere: false,
      }),
    ).toEqual({
      ok: false,
      code: "invite.invalid",
      message: "Request a new invite from your School Admin",
    });
    expect(
      canAcceptInvite({
        status: "used",
        expiresAt: new Date("2026-10-10T12:00:00Z"),
        now,
        emailActiveElsewhere: false,
      }),
    ).toMatchObject({ ok: false, code: "invite.invalid" });
  });

  it("blocks accept when email is active at another school (AC-06b)", () => {
    expect(
      canAcceptInvite({
        status: "pending",
        expiresAt: new Date("2026-10-10T12:00:00Z"),
        now: new Date("2026-10-03T12:00:00Z"),
        emailActiveElsewhere: true,
      }),
    ).toEqual({
      ok: false,
      code: "invite.email_elsewhere",
      message: "This email is already tied to another school",
    });
  });

  it("treats pending past expiresAt as invalid (AC-06)", () => {
    expect(
      canAcceptInvite({
        status: "pending",
        expiresAt: new Date("2026-09-01T12:00:00Z"),
        now: new Date("2026-10-03T12:00:00Z"),
        emailActiveElsewhere: false,
      }),
    ).toMatchObject({ ok: false, code: "invite.invalid" });
  });

  it("locks after 5 failed sign-ins for 15 minutes", () => {
    const now = new Date("2026-10-03T12:00:00Z");
    let state = { failedSignInCount: 4, lockedUntil: null as Date | null };
    state = recordFailedSignIn(state, now);
    expect(state.failedSignInCount).toBe(5);
    expect(state.lockedUntil?.getTime()).toBe(
      now.getTime() + 15 * 60 * 1000,
    );
  });

  it("revokes teacher to inactive and marks sessions revoked (AC-09)", () => {
    const revokedAt = new Date("2026-10-03T12:00:00Z");
    expect(
      revokeTeacherAccess({
        role: "teacher",
        status: "active",
        sessions: [{ id: "s1", revokedAt: null }],
        now: revokedAt,
      }),
    ).toEqual({
      status: "inactive",
      sessions: [{ id: "s1", revokedAt }],
    });
  });

  it("sign-in denial is generic without email reveal (AC-08)", () => {
    expect(signInDeniedError()).toEqual({
      code: "auth.denied",
      message: "Access denied",
    });
  });
});
