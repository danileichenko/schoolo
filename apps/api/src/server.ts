import { buildApp } from "./app.js";
import { createAppDeps } from "./composition.js";

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

const app = await buildApp(createAppDeps());

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
