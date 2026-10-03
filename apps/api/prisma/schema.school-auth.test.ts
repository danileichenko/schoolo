import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const prismaDir = dirname(fileURLToPath(import.meta.url));

describe("school-auth schema — schools.name unique (AC-02b)", () => {
  it("declares unique constraint on School.name", () => {
    const schema = readFileSync(join(prismaDir, "schema.prisma"), "utf8");
    expect(schema).toMatch(/model School \{[\s\S]*?@@unique\(\[name\]\)/);
  });

  it("has a promoted migration that creates schools_name_key", () => {
    const migrationSql = readFileSync(
      join(prismaDir, "migrations/20261003160000_unique_schools_name/migration.sql"),
      "utf8",
    );
    expect(migrationSql).toContain("schools_name_key");
    expect(migrationSql).toContain("CREATE UNIQUE INDEX");
  });
});
