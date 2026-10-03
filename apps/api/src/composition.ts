import { PrismaClient } from "@prisma/client";
import type { SchoolRepository } from "./modules/schools/app/school-repository.js";
import {
  createMemoryRegistrationRateLimiter,
  type RegistrationRateLimiter,
} from "./modules/schools/app/register-school.js";
import { MemorySchoolRepository } from "./modules/schools/infra/memory-school-repository.js";
import { PrismaSchoolRepository } from "./modules/schools/infra/prisma-school-repository.js";
import type {
  EmailPort,
  SessionRepository,
  StaffMemberRepository,
  TeacherInviteRepository,
} from "./modules/users/app/ports.js";
import {
  LoggingEmailAdapter,
  MemorySessionRepository,
  MemoryStaffMemberRepository,
  MemoryTeacherInviteRepository,
} from "./modules/users/infra/memory-users.js";
import {
  PrismaSessionRepository,
  PrismaStaffMemberRepository,
  PrismaTeacherInviteRepository,
} from "./modules/users/infra/prisma-users.js";

export type AppDeps = {
  schools: SchoolRepository;
  staff: StaffMemberRepository;
  invites: TeacherInviteRepository;
  sessions: SessionRepository;
  email: EmailPort;
  rateLimiter: RegistrationRateLimiter;
  inviteBaseUrl: string;
};

export function createMemoryDeps(overrides: Partial<AppDeps> = {}): AppDeps {
  return {
    schools: new MemorySchoolRepository(),
    staff: new MemoryStaffMemberRepository(),
    invites: new MemoryTeacherInviteRepository(),
    sessions: new MemorySessionRepository(),
    email: new LoggingEmailAdapter(),
    rateLimiter: createMemoryRegistrationRateLimiter(),
    inviteBaseUrl: process.env.INVITE_BASE_URL ?? "http://localhost:3000/invite",
    ...overrides,
  };
}

export function createPrismaDeps(
  prisma: PrismaClient,
  overrides: Partial<AppDeps> = {},
): AppDeps {
  return {
    schools: new PrismaSchoolRepository(prisma),
    staff: new PrismaStaffMemberRepository(prisma),
    invites: new PrismaTeacherInviteRepository(prisma),
    sessions: new PrismaSessionRepository(prisma),
    email: new LoggingEmailAdapter(),
    rateLimiter: createMemoryRegistrationRateLimiter(),
    inviteBaseUrl: process.env.INVITE_BASE_URL ?? "http://localhost:3000/invite",
    ...overrides,
  };
}

export function createAppDeps(): AppDeps {
  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient();
    return createPrismaDeps(prisma);
  }
  return createMemoryDeps();
}
