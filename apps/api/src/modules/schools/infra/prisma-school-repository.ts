import type { PrismaClient } from "@prisma/client";
import { schoolNameTakenError } from "../domain/school-name.js";
import type { SchoolRecord, SchoolRepository } from "../app/school-repository.js";

export class PrismaSchoolRepository implements SchoolRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByName(name: string): Promise<SchoolRecord | null> {
    const row = await this.prisma.school.findUnique({ where: { name } });
    if (!row) return null;
    return { id: row.id, name: row.name, createdAt: row.createdAt };
  }

  async create(school: SchoolRecord): Promise<SchoolRecord> {
    try {
      const row = await this.prisma.school.create({
        data: {
          id: school.id,
          name: school.name,
          createdAt: school.createdAt,
        },
      });
      return { id: row.id, name: row.name, createdAt: row.createdAt };
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "P2002") {
        throw schoolNameTakenError();
      }
      throw err;
    }
  }
}
