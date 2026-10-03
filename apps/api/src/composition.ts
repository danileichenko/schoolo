import type { SchoolRepository } from "./modules/schools/app/school-repository.js";
import {
  createMemoryRegistrationRateLimiter,
  type RegistrationRateLimiter,
} from "./modules/schools/app/register-school.js";
import { MemorySchoolRepository } from "./modules/schools/infra/memory-school-repository.js";
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

export type AppDeps = {
  schools: SchoolRepository;
  staff: StaffMemberRepository;
  invites: TeacherInviteRepository;
  sessions: SessionRepository;
  email: EmailPort;
  rateLimiter: RegistrationRateLimiter;
  inviteBaseUrl: string;
  schoolNames: Map<string, string>;
};

export function createMemoryDeps(overrides: Partial<AppDeps> = {}): AppDeps {
  return {
    schools: new MemorySchoolRepository(),
    staff: new MemoryStaffMemberRepository(),
    invites: new MemoryTeacherInviteRepository(),
    sessions: new MemorySessionRepository(),
    email: new LoggingEmailAdapter(),
    rateLimiter: createMemoryRegistrationRateLimiter(),
    inviteBaseUrl: "http://localhost:3000/invite",
    schoolNames: new Map(),
    ...overrides,
  };
}
