import { assertSchoolDisplayName, schoolNameTakenError } from "../domain/school-name.js";
import type { SchoolRepository } from "./school-repository.js";
import type {
  SessionRepository,
  StaffMemberRepository,
} from "../../users/app/ports.js";
import { hashPassword, newId, newOpaqueToken, hashToken } from "../../users/app/crypto.js";

export type RegisterSchoolInput = {
  name: string;
  workEmail: string;
  password: string;
};

export type RegisterSchoolResult =
  | {
      ok: true;
      school: { id: string; name: string };
      staff: {
        id: string;
        role: "school_admin";
        status: "active";
        workEmail: string;
      };
      sessionToken: string;
    }
  | {
      ok: false;
      code:
        | "school.validation_failed"
        | "school.name_taken"
        | "school.registration_rate_limited";
      message: string;
      fields?: string[];
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegistrationRateLimiter = {
  allow(contactDomain: string, now: Date): boolean;
};

export function createMemoryRegistrationRateLimiter(
  limit = 5,
  windowMs = 60 * 60 * 1000,
): RegistrationRateLimiter {
  const hits = new Map<string, number[]>();
  return {
    allow(contactDomain: string, now: Date): boolean {
      const key = contactDomain.toLowerCase();
      const cutoff = now.getTime() - windowMs;
      const prev = (hits.get(key) ?? []).filter((t) => t > cutoff);
      if (prev.length >= limit) {
        hits.set(key, prev);
        return false;
      }
      prev.push(now.getTime());
      hits.set(key, prev);
      return true;
    },
  };
}

export async function registerSchool(
  input: RegisterSchoolInput,
  deps: {
    schools: SchoolRepository;
    staff: StaffMemberRepository;
    sessions: SessionRepository;
    rateLimiter: RegistrationRateLimiter;
    now?: Date;
  },
): Promise<RegisterSchoolResult> {
  const now = deps.now ?? new Date();
  const nameCheck = assertSchoolDisplayName(input.name);
  const fields: string[] = [];
  if (!nameCheck.ok) fields.push(...nameCheck.fields);
  const workEmail = input.workEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(workEmail)) fields.push("work_email");
  if (input.password.length < 12) fields.push("password");
  if (fields.length > 0) {
    return {
      ok: false,
      code: "school.validation_failed",
      message: "Required information is missing or invalid",
      fields: [...new Set(fields)],
    };
  }
  if (!nameCheck.ok) {
    return {
      ok: false,
      code: "school.validation_failed",
      message: "Required information is missing or invalid",
      fields: nameCheck.fields,
    };
  }

  const domain = workEmail.split("@")[1] ?? "";
  if (!deps.rateLimiter.allow(domain, now)) {
    return {
      ok: false,
      code: "school.registration_rate_limited",
      message: "Too many registration attempts for this contact domain",
    };
  }

  const existing = await deps.schools.findByName(nameCheck.name);
  if (existing) {
    const err = schoolNameTakenError();
    return { ok: false, code: err.code, message: err.message };
  }

  const schoolId = newId();
  const staffId = newId();
  try {
    await deps.schools.create({
      id: schoolId,
      name: nameCheck.name,
      createdAt: now,
    });
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "school.name_taken") {
      const err = schoolNameTakenError();
      return { ok: false, code: err.code, message: err.message };
    }
    throw e;
  }

  await deps.staff.create({
    id: staffId,
    schoolId,
    workEmail,
    passwordHash: hashPassword(input.password),
    role: "school_admin",
    status: "active",
    failedSignInCount: 0,
    lockedUntil: null,
    createdAt: now,
  });

  const sessionToken = newOpaqueToken();
  await deps.sessions.create({
    id: newId(),
    staffMemberId: staffId,
    tokenHash: hashToken(sessionToken),
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    revokedAt: null,
    createdAt: now,
  });

  return {
    ok: true,
    school: { id: schoolId, name: nameCheck.name },
    staff: {
      id: staffId,
      role: "school_admin",
      status: "active",
      workEmail,
    },
    sessionToken,
  };
}
