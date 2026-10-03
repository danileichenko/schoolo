import { describe, expect, it } from "vitest";
import { MemorySchoolRepository } from "../infra/memory-school-repository.js";
import {
  MemorySessionRepository,
  MemoryStaffMemberRepository,
} from "../../users/infra/memory-users.js";
import {
  createMemoryRegistrationRateLimiter,
  registerSchool,
} from "./register-school.js";

function deps() {
  return {
    schools: new MemorySchoolRepository(),
    staff: new MemoryStaffMemberRepository(),
    sessions: new MemorySessionRepository(),
    rateLimiter: createMemoryRegistrationRateLimiter(),
  };
}

describe("registerSchool (AC-01, AC-02, AC-02b)", () => {
  it("creates school, admin, and session", async () => {
    const result = await registerSchool(
      {
        name: "Pilot School",
        workEmail: "admin@example.test",
        password: "correct-horse",
      },
      deps(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.school.name).toBe("Pilot School");
    expect(result.staff.role).toBe("school_admin");
    expect(result.sessionToken.length).toBeGreaterThan(20);
  });

  it("rejects short password and invalid email", async () => {
    const result = await registerSchool(
      { name: "X", workEmail: "bad", password: "short" },
      deps(),
    );
    expect(result).toMatchObject({
      ok: false,
      code: "school.validation_failed",
    });
    if (result.ok) return;
    expect(result.fields).toEqual(
      expect.arrayContaining(["work_email", "password"]),
    );
  });

  it("rejects duplicate school name", async () => {
    const d = deps();
    await registerSchool(
      {
        name: "Pilot School",
        workEmail: "a@example.test",
        password: "correct-horse",
      },
      d,
    );
    const second = await registerSchool(
      {
        name: "Pilot School",
        workEmail: "b@example.test",
        password: "correct-horse",
      },
      d,
    );
    expect(second).toMatchObject({ ok: false, code: "school.name_taken" });
  });
});
