import { describe, expect, it } from "vitest";
import {
  LoggingEmailAdapter,
  MemorySessionRepository,
  MemoryStaffMemberRepository,
  MemoryTeacherInviteRepository,
} from "./memory-users.js";

describe("users memory infra", () => {
  it("stores staff by unique work email", async () => {
    const repo = new MemoryStaffMemberRepository();
    const member = await repo.create({
      id: "01HZADMIN00000000000000000",
      schoolId: "01HZSCHOOL0000000000000000",
      workEmail: "Admin@example.test",
      passwordHash: "hash",
      role: "school_admin",
      status: "active",
      failedSignInCount: 0,
      lockedUntil: null,
      createdAt: new Date(),
    });
    expect(member.workEmail).toBe("admin@example.test");
    expect(await repo.findByWorkEmail("admin@example.test")).toEqual(member);
  });

  it("tracks pending invites and email sends", async () => {
    const invites = new MemoryTeacherInviteRepository();
    const email = new LoggingEmailAdapter();
    await invites.create({
      id: "01HZINVITE0000000000000000",
      schoolId: "01HZSCHOOL0000000000000000",
      workEmail: "t@example.test",
      tokenHash: "tok",
      status: "pending",
      expiresAt: new Date("2026-10-17T00:00:00Z"),
      createdAt: new Date(),
    });
    expect(
      await invites.hasPendingForEmail(
        "01HZSCHOOL0000000000000000",
        "t@example.test",
      ),
    ).toBe(true);
    await email.sendTeacherInvite({
      to: "t@example.test",
      schoolName: "Pilot School",
      inviteUrl: "https://example.test/invite/x",
    });
    expect(email.sent).toHaveLength(1);
  });

  it("creates and looks up sessions by token hash", async () => {
    const sessions = new MemorySessionRepository();
    const session = await sessions.create({
      id: "01HZSESSION000000000000000",
      staffMemberId: "01HZADMIN00000000000000000",
      tokenHash: "sess",
      expiresAt: new Date("2026-10-04T00:00:00Z"),
      revokedAt: null,
      createdAt: new Date(),
    });
    expect(await sessions.findByTokenHash("sess")).toEqual(session);
  });
});
