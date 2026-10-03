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

describe("school-auth schema — staff_members (AC-01)", () => {
  it("declares StaffMember with unique workEmail", () => {
    const schema = readFileSync(join(prismaDir, "schema.prisma"), "utf8");
    expect(schema).toMatch(/model StaffMember \{[\s\S]*?workEmail[\s\S]*?@@unique\(\[workEmail\]\)/);
  });

  it("has promoted staff_members migration", () => {
    const sql = readFileSync(
      join(prismaDir, "migrations/20261003160100_create_staff_members/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS staff_members");
    expect(sql).toContain("staff_members_work_email_key");
  });
});

describe("school-auth schema — teacher_invites (AC-03)", () => {
  it("declares TeacherInvite with unique tokenHash", () => {
    const schema = readFileSync(join(prismaDir, "schema.prisma"), "utf8");
    expect(schema).toMatch(/model TeacherInvite \{[\s\S]*?@@unique\(\[tokenHash\]\)/);
  });

  it("has promoted teacher_invites migration", () => {
    const sql = readFileSync(
      join(prismaDir, "migrations/20261003160200_create_teacher_invites/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS teacher_invites");
    expect(sql).toContain("teacher_invites_token_hash_key");
  });
});
