import { schoolNameTakenError } from "../domain/school-name.js";
import type { SchoolRecord, SchoolRepository } from "../app/school-repository.js";

export class MemorySchoolRepository implements SchoolRepository {
  private readonly byId = new Map<string, SchoolRecord>();
  private readonly byName = new Map<string, SchoolRecord>();

  async findById(id: string): Promise<SchoolRecord | null> {
    return this.byId.get(id) ?? null;
  }

  async findByName(name: string): Promise<SchoolRecord | null> {
    return this.byName.get(name) ?? null;
  }

  async create(school: SchoolRecord): Promise<SchoolRecord> {
    if (this.byName.has(school.name)) {
      throw schoolNameTakenError();
    }
    this.byId.set(school.id, school);
    this.byName.set(school.name, school);
    return school;
  }
}
