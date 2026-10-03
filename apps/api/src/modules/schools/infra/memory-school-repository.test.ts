import { describe, expect, it } from "vitest";
import { MemorySchoolRepository } from "./memory-school-repository.js";

describe("MemorySchoolRepository (AC-02b)", () => {
  it("creates a school and finds it by name", async () => {
    const repo = new MemorySchoolRepository();
    const created = await repo.create({
      id: "01HZSCHOOL0000000000000000",
      name: "Pilot School",
      createdAt: new Date("2026-10-03T00:00:00Z"),
    });
    expect(created.name).toBe("Pilot School");
    expect(await repo.findByName("Pilot School")).toEqual(created);
  });

  it("rejects duplicate display names", async () => {
    const repo = new MemorySchoolRepository();
    await repo.create({
      id: "01HZSCHOOL0000000000000000",
      name: "Pilot School",
      createdAt: new Date("2026-10-03T00:00:00Z"),
    });
    await expect(
      repo.create({
        id: "01HZSCHOOL0000000000000001",
        name: "Pilot School",
        createdAt: new Date("2026-10-03T00:00:00Z"),
      }),
    ).rejects.toMatchObject({ code: "school.name_taken" });
  });
});
