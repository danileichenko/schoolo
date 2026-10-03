import sensible from "@fastify/sensible";
import Fastify, { type FastifyInstance } from "fastify";
import { healthSchema } from "@schoolo/shared";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  await app.register(sensible);

  app.get("/health", async () => {
    const payload = { status: "ok" as const, service: "schoolo-api" };
    return healthSchema.parse(payload);
  });

  return app;
}
