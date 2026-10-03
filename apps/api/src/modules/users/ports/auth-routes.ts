import type { FastifyInstance } from "fastify";
import {
  acceptInviteRequestSchema,
  registerSchoolRequestSchema,
  signInRequestSchema,
} from "@schoolo/shared";
import type { AppDeps } from "../../../composition.js";
import { registerSchool } from "../../schools/app/register-school.js";
import { acceptInvite } from "../app/accept-invite.js";
import { signIn } from "../app/sign-in.js";
import {
  resolveSessionActor,
  SESSION_COOKIE,
  sessionCookieHeader,
} from "../app/session-auth.js";

function cookieValue(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const part = header
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${name}=`));
  return part?.slice(name.length + 1);
}

export async function registerAuthRoutes(
  app: FastifyInstance,
  deps: AppDeps,
): Promise<void> {
  app.post("/api/v1/auth/register-school", async (request, reply) => {
    const parsed = registerSchoolRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        code: "school.validation_failed",
        message: "Required information is missing or invalid",
        details: { fields: parsed.error.issues.map((i) => i.path.join(".")) },
      });
    }
    const result = await registerSchool(
      {
        name: parsed.data.name,
        workEmail: parsed.data.work_email,
        password: parsed.data.password,
      },
      deps,
    );
    if (!result.ok) {
      const status =
        result.code === "school.validation_failed"
          ? 400
          : result.code === "school.name_taken"
            ? 409
            : 429;
      return reply.code(status).send({
        code: result.code,
        message: result.message,
        details: result.fields ? { fields: result.fields } : undefined,
      });
    }
    reply.header("Set-Cookie", sessionCookieHeader(result.sessionToken));
    return reply.code(201).send({
      school: result.school,
      staff: {
        id: result.staff.id,
        role: result.staff.role,
        status: result.staff.status,
        work_email: result.staff.workEmail,
      },
    });
  });

  app.post("/api/v1/auth/sign-in", async (request, reply) => {
    const parsed = signInRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(401).send({
        code: "auth.denied",
        message: "Access denied",
      });
    }
    const result = await signIn(
      {
        workEmail: parsed.data.work_email,
        password: parsed.data.password,
      },
      deps,
    );
    if (!result.ok) {
      const status = result.code === "auth.locked" ? 423 : 401;
      return reply.code(status).send({
        code: result.code,
        message: result.message,
      });
    }
    const school = await deps.schools.findById(result.school.id);
    reply.header("Set-Cookie", sessionCookieHeader(result.sessionToken));
    return reply.code(200).send({
      school: {
        id: result.school.id,
        name: school?.name ?? "",
      },
      staff: {
        id: result.staff.id,
        role: result.staff.role,
        status: result.staff.status,
        work_email: result.staff.workEmail,
      },
    });
  });

  app.post("/api/v1/invites/:inviteToken/accept", async (request, reply) => {
    const parsed = acceptInviteRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        code: "invite.validation_failed",
        message: "Password must be at least 12 characters",
        details: { fields: ["password"] },
      });
    }
    const { inviteToken } = request.params as { inviteToken: string };
    const result = await acceptInvite(
      { inviteToken, password: parsed.data.password },
      deps,
    );
    if (!result.ok) {
      const status =
        result.code === "invite.validation_failed"
          ? 400
          : result.code === "invite.email_elsewhere"
            ? 409
            : 410;
      return reply.code(status).send({
        code: result.code,
        message: result.message,
        details: result.fields ? { fields: result.fields } : undefined,
      });
    }
    const school = await deps.schools.findById(result.school.id);
    reply.header("Set-Cookie", sessionCookieHeader(result.sessionToken));
    return reply.code(201).send({
      school: {
        id: result.school.id,
        name: school?.name ?? "",
      },
      staff: {
        id: result.staff.id,
        role: result.staff.role,
        status: result.staff.status,
        work_email: result.staff.workEmail,
      },
    });
  });

  app.get("/api/v1/auth/me", async (request, reply) => {
    const token = cookieValue(request.headers.cookie, SESSION_COOKIE);
    const actor = await resolveSessionActor(token, deps);
    if (!actor) {
      return reply.code(401).send({ code: "auth.denied", message: "Access denied" });
    }
    const school = await deps.schools.findById(actor.schoolId);
    return reply.code(200).send({
      school: { id: actor.schoolId, name: school?.name ?? "" },
      staff: {
        id: actor.id,
        role: actor.role,
        status: actor.status,
        work_email: actor.workEmail,
      },
    });
  });
}
