import sensible from "@fastify/sensible";
import Fastify, { type FastifyInstance } from "fastify";
import { healthSchema } from "@schoolo/shared";
import { createMemoryDeps, type AppDeps } from "./composition.js";
import { registerAuthRoutes } from "./modules/users/ports/auth-routes.js";
import { registerSchoolStaffRoutes } from "./modules/users/ports/school-staff-routes.js";

export async function buildApp(deps: AppDeps = createMemoryDeps()): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  await app.register(sensible);

  app.get("/health", async () => {
    const payload = { status: "ok" as const, service: "schoolo-api" };
    return healthSchema.parse(payload);
  });

  await registerAuthRoutes(app, deps);
  await registerSchoolStaffRoutes(app, deps);

  return app;
}
