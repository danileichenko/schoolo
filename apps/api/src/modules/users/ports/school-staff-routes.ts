import type { FastifyInstance } from "fastify";
import { inviteTeacherRequestSchema } from "@schoolo/shared";
import type { AppDeps } from "../../../composition.js";
import { inviteTeacher, reissueTeacherInvite } from "../app/invite-teacher.js";
import { listStaffRoster, revokeTeacher } from "../app/roster-revoke.js";
import { resolveSessionActor, SESSION_COOKIE } from "../app/session-auth.js";

function cookieValue(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  const part = header.split(";").map((s) => s.trim()).find((s) => s.startsWith(`${name}=`));
  return part?.slice(name.length + 1);
}

export async function registerSchoolStaffRoutes(
  app: FastifyInstance,
  deps: AppDeps,
): Promise<void> {
  app.addHook("preHandler", async (request) => {
    const token = cookieValue(request.headers.cookie, SESSION_COOKIE);
    (request as { actor?: unknown }).actor = await resolveSessionActor(token, deps);
  });

  app.post("/api/v1/schools/:schoolId/teacher-invites", async (request, reply) => {
    const actor = (request as { actor?: Awaited<ReturnType<typeof resolveSessionActor>> }).actor;
    if (!actor) {
      return reply.code(401).send({ code: "auth.denied", message: "Access denied" });
    }
    const parsed = inviteTeacherRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        code: "invite.validation_failed",
        message: "Invalid work email",
      });
    }
    const { schoolId } = request.params as { schoolId: string };
    const result = await inviteTeacher(
      {
        schoolId,
        workEmail: parsed.data.work_email,
        schoolName: deps.schoolNames.get(schoolId) ?? "School",
        inviteBaseUrl: deps.inviteBaseUrl,
        actor,
      },
      deps,
    );
    if (!result.ok) {
      const status = result.code === "invite.duplicate" ? 409 : 403;
      return reply.code(status).send({ code: result.code, message: result.message });
    }
    return reply.code(201).send({
      id: result.inviteId,
      school_id: schoolId,
      work_email: parsed.data.work_email.toLowerCase(),
      status: result.status,
    });
  });

  app.post(
    "/api/v1/schools/:schoolId/teacher-invites/:inviteId/reissue",
    async (request, reply) => {
      const actor = (request as { actor?: Awaited<ReturnType<typeof resolveSessionActor>> }).actor;
      if (!actor) {
        return reply.code(401).send({ code: "auth.denied", message: "Access denied" });
      }
      const { schoolId, inviteId } = request.params as {
        schoolId: string;
        inviteId: string;
      };
      const result = await reissueTeacherInvite(
        {
          schoolId,
          inviteId,
          schoolName: deps.schoolNames.get(schoolId) ?? "School",
          inviteBaseUrl: deps.inviteBaseUrl,
          actor,
        },
        deps,
      );
      if (!result.ok) {
        const status = result.code === "invite.not_found" ? 404 : 403;
        return reply.code(status).send({ code: result.code, message: result.message });
      }
      return reply.code(201).send({
        id: result.inviteId,
        school_id: schoolId,
        status: result.status,
      });
    },
  );

  app.get("/api/v1/schools/:schoolId/staff-roster", async (request, reply) => {
    const actor = (request as { actor?: Awaited<ReturnType<typeof resolveSessionActor>> }).actor;
    if (!actor) {
      return reply.code(401).send({ code: "auth.denied", message: "Access denied" });
    }
    const { schoolId } = request.params as { schoolId: string };
    const result = await listStaffRoster({ schoolId, actor }, deps);
    if (!result.ok) {
      return reply.code(403).send({ code: result.code, message: result.message });
    }
    return reply.code(200).send({ items: result.rows });
  });

  app.post(
    "/api/v1/schools/:schoolId/staff/:staffMemberId/revoke",
    async (request, reply) => {
      const actor = (request as { actor?: Awaited<ReturnType<typeof resolveSessionActor>> }).actor;
      if (!actor) {
        return reply.code(401).send({ code: "auth.denied", message: "Access denied" });
      }
      const { schoolId, staffMemberId } = request.params as {
        schoolId: string;
        staffMemberId: string;
      };
      const result = await revokeTeacher({ schoolId, staffMemberId, actor }, deps);
      if (!result.ok) {
        const status = result.code === "staff.not_found" ? 404 : 403;
        return reply.code(status).send({ code: result.code, message: result.message });
      }
      return reply.code(200).send({ status: result.status });
    },
  );
}
