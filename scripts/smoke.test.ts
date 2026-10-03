import { describe, expect, it } from "vitest";
import { buildApp } from "../apps/api/src/app.js";

describe("skeleton smoke", () => {
  it("API boots and serves health", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    await app.close();
  });
});
