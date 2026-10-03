import { describe, expect, it } from "vitest";
import { buildApp } from "../../../app.js";
import { createMemoryDeps } from "../../../composition.js";
import { LoggingEmailAdapter } from "../infra/memory-users.js";

function cookieFrom(setCookie: string | string[] | undefined): string {
  const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  if (!raw) throw new Error("missing Set-Cookie");
  return raw.split(";")[0] ?? "";
}

describe("public auth HTTP ports", () => {
  it("registers school and sets session cookie (AC-01)", async () => {
    const app = await buildApp(createMemoryDeps());
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register-school",
      payload: {
        name: "Pilot School",
        work_email: "admin@example.test",
        password: "correct-horse",
      },
    });
    expect(response.statusCode).toBe(201);
    expect(response.headers["set-cookie"]).toBeTruthy();
    expect(response.json().staff.role).toBe("school_admin");
    await app.close();
  });

  it("returns name_taken on duplicate school (AC-02b)", async () => {
    const deps = createMemoryDeps();
    const app = await buildApp(deps);
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/register-school",
      payload: {
        name: "Pilot School",
        work_email: "a@example.test",
        password: "correct-horse",
      },
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register-school",
      payload: {
        name: "Pilot School",
        work_email: "b@example.test",
        password: "correct-horse",
      },
    });
    expect(second.statusCode).toBe(409);
    expect(second.json().code).toBe("school.name_taken");
    await app.close();
  });

  it("accepts invite after admin invites (AC-03/AC-05)", async () => {
    const email = new LoggingEmailAdapter();
    const deps = createMemoryDeps({ email });
    const app = await buildApp(deps);
    const reg = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register-school",
      payload: {
        name: "Pilot School",
        work_email: "admin@example.test",
        password: "correct-horse",
      },
    });
    const cookie = cookieFrom(reg.headers["set-cookie"]);
    const schoolId = reg.json().school.id as string;
    const invite = await app.inject({
      method: "POST",
      url: `/api/v1/schools/${schoolId}/teacher-invites`,
      headers: { cookie },
      payload: { work_email: "t@example.test" },
    });
    expect(invite.statusCode).toBe(201);
    const token = email.sent[0]?.inviteUrl.split("/").pop();
    expect(token).toBeTruthy();
    const accept = await app.inject({
      method: "POST",
      url: `/api/v1/invites/${token}/accept`,
      payload: { password: "correct-horse" },
    });
    expect(accept.statusCode).toBe(201);
    expect(accept.json().staff.role).toBe("teacher");
    await app.close();
  });
});
