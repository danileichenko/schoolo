import { describe, expect, it } from "vitest";
import { hashPassword, hashToken, newId } from "./crypto.js";
import { inviteTeacher, reissueTeacherInvite } from "./invite-teacher.js";
import { acceptInvite } from "./accept-invite.js";
import { signIn } from "./sign-in.js";
import { listStaffRoster, revokeTeacher } from "./roster-revoke.js";
import {
  LoggingEmailAdapter,
  MemorySessionRepository,
  MemoryStaffMemberRepository,
  MemoryTeacherInviteRepository,
} from "../infra/memory-users.js";

function harness() {
  return {
    staff: new MemoryStaffMemberRepository(),
    invites: new MemoryTeacherInviteRepository(),
    sessions: new MemorySessionRepository(),
    email: new LoggingEmailAdapter(),
  };
}

async function seedAdmin(h: ReturnType<typeof harness>, schoolId = "school-a") {
  const admin = {
    id: "admin-1",
    schoolId,
    workEmail: "admin@example.test",
    passwordHash: hashPassword("correct-horse"),
    role: "school_admin" as const,
    status: "active" as const,
    failedSignInCount: 0,
    lockedUntil: null,
    createdAt: new Date(),
  };
  await h.staff.create(admin);
  return admin;
}

describe("invite / reissue (AC-03, AC-04, AC-13)", () => {
  it("creates pending invite and emails link", async () => {
    const h = harness();
    const admin = await seedAdmin(h);
    const result = await inviteTeacher(
      {
        schoolId: "school-a",
        workEmail: "t@example.test",
        schoolName: "Pilot",
        inviteBaseUrl: "https://app.example.test/invite",
        actor: admin,
      },
      h,
    );
    expect(result).toMatchObject({ ok: true, status: "pending" });
    expect(h.email.sent).toHaveLength(1);
  });

  it("blocks duplicate pending invite", async () => {
    const h = harness();
    const admin = await seedAdmin(h);
    const args = {
      schoolId: "school-a",
      workEmail: "t@example.test",
      schoolName: "Pilot",
      inviteBaseUrl: "https://app.example.test/invite",
      actor: admin,
    };
    await inviteTeacher(args, h);
    const second = await inviteTeacher(args, h);
    expect(second).toMatchObject({ ok: false, code: "invite.duplicate" });
  });

  it("reissue invalidates prior invite", async () => {
    const h = harness();
    const admin = await seedAdmin(h);
    const first = await inviteTeacher(
      {
        schoolId: "school-a",
        workEmail: "t@example.test",
        schoolName: "Pilot",
        inviteBaseUrl: "https://app.example.test/invite",
        actor: admin,
      },
      h,
    );
    if (!first.ok) throw new Error("invite failed");
    const re = await reissueTeacherInvite(
      {
        schoolId: "school-a",
        inviteId: first.inviteId,
        schoolName: "Pilot",
        inviteBaseUrl: "https://app.example.test/invite",
        actor: admin,
      },
      h,
    );
    expect(re.ok).toBe(true);
    const prior = await h.invites.findById(first.inviteId);
    expect(prior?.status).toBe("invalid");
  });
});

describe("accept invite (AC-05, AC-06, AC-06b)", () => {
  it("activates teacher and session", async () => {
    const h = harness();
    const token = "raw-invite-token";
    await h.invites.create({
      id: newId(),
      schoolId: "school-a",
      workEmail: "t@example.test",
      tokenHash: hashToken(token),
      status: "pending",
      expiresAt: new Date("2099-01-01T00:00:00Z"),
      createdAt: new Date(),
    });
    const result = await acceptInvite(
      { inviteToken: token, password: "correct-horse" },
      h,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.staff.role).toBe("teacher");
  });

  it("rejects expired invite", async () => {
    const h = harness();
    const token = "expired-token";
    await h.invites.create({
      id: newId(),
      schoolId: "school-a",
      workEmail: "t@example.test",
      tokenHash: hashToken(token),
      status: "pending",
      expiresAt: new Date("2000-01-01T00:00:00Z"),
      createdAt: new Date(),
    });
    const result = await acceptInvite(
      { inviteToken: token, password: "correct-horse" },
      h,
    );
    expect(result).toMatchObject({ ok: false, code: "invite.invalid" });
  });

  it("rejects email active elsewhere", async () => {
    const h = harness();
    await h.staff.create({
      id: "elsewhere",
      schoolId: "school-b",
      workEmail: "t@example.test",
      passwordHash: hashPassword("correct-horse"),
      role: "teacher",
      status: "active",
      failedSignInCount: 0,
      lockedUntil: null,
      createdAt: new Date(),
    });
    const token = "tok";
    await h.invites.create({
      id: newId(),
      schoolId: "school-a",
      workEmail: "t@example.test",
      tokenHash: hashToken(token),
      status: "pending",
      expiresAt: new Date("2099-01-01T00:00:00Z"),
      createdAt: new Date(),
    });
    const result = await acceptInvite(
      { inviteToken: token, password: "correct-horse" },
      h,
    );
    expect(result).toMatchObject({ ok: false, code: "invite.email_elsewhere" });
  });
});

describe("sign in (AC-07, AC-08)", () => {
  it("opens session for active staff", async () => {
    const h = harness();
    await seedAdmin(h);
    const result = await signIn(
      { workEmail: "admin@example.test", password: "correct-horse" },
      h,
    );
    expect(result.ok).toBe(true);
  });

  it("denies bad credentials generically", async () => {
    const h = harness();
    await seedAdmin(h);
    const result = await signIn(
      { workEmail: "admin@example.test", password: "wrong-password" },
      h,
    );
    expect(result).toMatchObject({
      ok: false,
      code: "auth.denied",
      message: "Access denied",
    });
  });
});

describe("roster / revoke (AC-09, AC-10, AC-11)", () => {
  it("revokes teacher and sessions", async () => {
    const h = harness();
    const admin = await seedAdmin(h);
    const teacher = {
      id: "teacher-1",
      schoolId: "school-a",
      workEmail: "t@example.test",
      passwordHash: hashPassword("correct-horse"),
      role: "teacher" as const,
      status: "active" as const,
      failedSignInCount: 0,
      lockedUntil: null,
      createdAt: new Date(),
    };
    await h.staff.create(teacher);
    await h.sessions.create({
      id: "sess-1",
      staffMemberId: teacher.id,
      tokenHash: "th",
      expiresAt: new Date("2099-01-01T00:00:00Z"),
      revokedAt: null,
      createdAt: new Date(),
    });
    const result = await revokeTeacher(
      { schoolId: "school-a", staffMemberId: teacher.id, actor: admin },
      h,
    );
    expect(result).toEqual({ ok: true, status: "inactive" });
    const sessions = await h.sessions.listByStaffMember(teacher.id);
    expect(sessions[0]?.revokedAt).not.toBeNull();
  });

  it("forbids teacher managing staff", async () => {
    const h = harness();
    const teacher = {
      id: "teacher-1",
      schoolId: "school-a",
      workEmail: "t@example.test",
      passwordHash: hashPassword("correct-horse"),
      role: "teacher" as const,
      status: "active" as const,
      failedSignInCount: 0,
      lockedUntil: null,
      createdAt: new Date(),
    };
    await h.staff.create(teacher);
    const result = await inviteTeacher(
      {
        schoolId: "school-a",
        workEmail: "x@example.test",
        schoolName: "Pilot",
        inviteBaseUrl: "https://app.example.test/invite",
        actor: teacher,
      },
      h,
    );
    expect(result).toMatchObject({ ok: false, code: "staff.forbidden" });
  });

  it("denies cross-school roster", async () => {
    const h = harness();
    const admin = await seedAdmin(h, "school-a");
    const result = await listStaffRoster(
      { schoolId: "school-b", actor: admin },
      h,
    );
    expect(result).toMatchObject({ ok: false, code: "school.forbidden" });
  });
});
