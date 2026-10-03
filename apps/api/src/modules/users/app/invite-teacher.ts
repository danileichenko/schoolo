import { canInviteTeacher } from "../domain/staff-rules.js";
import type {
  EmailPort,
  StaffMemberRecord,
  StaffMemberRepository,
  TeacherInviteRepository,
} from "./ports.js";
import { hashToken, newId, newOpaqueToken } from "./crypto.js";

export async function inviteTeacher(
  input: {
    schoolId: string;
    workEmail: string;
    schoolName: string;
    inviteBaseUrl: string;
    actor: StaffMemberRecord;
  },
  deps: {
    staff: StaffMemberRepository;
    invites: TeacherInviteRepository;
    email: EmailPort;
    now?: Date;
  },
): Promise<
  | { ok: true; inviteId: string; status: "pending" }
  | {
      ok: false;
      code: "staff.forbidden" | "school.forbidden" | "invite.duplicate";
      message: string;
    }
> {
  if (input.actor.role !== "school_admin" || input.actor.status !== "active") {
    return {
      ok: false,
      code: "staff.forbidden",
      message: "Only the School Admin may manage staff",
    };
  }
  if (input.actor.schoolId !== input.schoolId) {
    return {
      ok: false,
      code: "school.forbidden",
      message: "You cannot access another school's administration",
    };
  }

  const email = input.workEmail.trim().toLowerCase();
  const active = await deps.staff.findByWorkEmail(email);
  const hasActiveTeacher =
    !!active &&
    active.schoolId === input.schoolId &&
    active.role === "teacher" &&
    active.status === "active";
  const hasPendingInvite = await deps.invites.hasPendingForEmail(
    input.schoolId,
    email,
  );
  const check = canInviteTeacher({
    workEmail: email,
    hasPendingInvite,
    hasActiveTeacher,
  });
  if (!check.ok) {
    return { ok: false, code: check.code, message: check.message };
  }

  const now = deps.now ?? new Date();
  const rawToken = newOpaqueToken();
  const inviteId = newId();
  await deps.invites.create({
    id: inviteId,
    schoolId: input.schoolId,
    workEmail: email,
    tokenHash: hashToken(rawToken),
    status: "pending",
    expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    createdAt: now,
  });
  await deps.email.sendTeacherInvite({
    to: email,
    schoolName: input.schoolName,
    inviteUrl: `${input.inviteBaseUrl.replace(/\/$/, "")}/${rawToken}`,
  });
  return { ok: true, inviteId, status: "pending" };
}

export async function reissueTeacherInvite(
  input: {
    schoolId: string;
    inviteId: string;
    schoolName: string;
    inviteBaseUrl: string;
    actor: StaffMemberRecord;
  },
  deps: {
    invites: TeacherInviteRepository;
    email: EmailPort;
    now?: Date;
  },
): Promise<
  | { ok: true; inviteId: string; status: "pending" }
  | {
      ok: false;
      code: "staff.forbidden" | "school.forbidden" | "invite.not_found";
      message: string;
    }
> {
  if (input.actor.role !== "school_admin" || input.actor.status !== "active") {
    return {
      ok: false,
      code: "staff.forbidden",
      message: "Only the School Admin may manage staff",
    };
  }
  if (input.actor.schoolId !== input.schoolId) {
    return {
      ok: false,
      code: "school.forbidden",
      message: "You cannot access another school's administration",
    };
  }
  const prior = await deps.invites.findById(input.inviteId);
  if (!prior || prior.schoolId !== input.schoolId) {
    return {
      ok: false,
      code: "invite.not_found",
      message: "Invite not found",
    };
  }
  await deps.invites.update({ ...prior, status: "invalid" });
  const now = deps.now ?? new Date();
  const rawToken = newOpaqueToken();
  const inviteId = newId();
  await deps.invites.create({
    id: inviteId,
    schoolId: input.schoolId,
    workEmail: prior.workEmail,
    tokenHash: hashToken(rawToken),
    status: "pending",
    expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    createdAt: now,
  });
  await deps.email.sendTeacherInvite({
    to: prior.workEmail,
    schoolName: input.schoolName,
    inviteUrl: `${input.inviteBaseUrl.replace(/\/$/, "")}/${rawToken}`,
  });
  return { ok: true, inviteId, status: "pending" };
}
