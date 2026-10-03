import { revokeTeacherAccess } from "../domain/staff-rules.js";
import type {
  SessionRepository,
  StaffMemberRecord,
  StaffMemberRepository,
  TeacherInviteRepository,
} from "./ports.js";

export type RosterRow = {
  kind: "staff" | "invite";
  id: string;
  workEmail: string;
  status: string;
  role?: string;
};

export async function listStaffRoster(
  input: { schoolId: string; actor: StaffMemberRecord },
  deps: {
    staff: StaffMemberRepository;
    invites: TeacherInviteRepository;
  },
): Promise<
  | { ok: true; rows: RosterRow[] }
  | { ok: false; code: "school.forbidden"; message: string }
> {
  if (
    input.actor.role !== "school_admin" ||
    input.actor.status !== "active"
  ) {
    return {
      ok: false,
      code: "school.forbidden",
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
  const now = new Date();
  const staff = await deps.staff.listBySchool(input.schoolId);
  const invites = await deps.invites.listBySchool(input.schoolId);
  const rows: RosterRow[] = [
    ...staff
      .filter((s) => s.role === "teacher")
      .map((s) => ({
        kind: "staff" as const,
        id: s.id,
        workEmail: s.workEmail,
        status: s.status,
        role: s.role,
      })),
    ...invites.map((i) => {
      const expired =
        i.status === "pending" && i.expiresAt.getTime() <= now.getTime();
      return {
        kind: "invite" as const,
        id: i.id,
        workEmail: i.workEmail,
        status: expired ? "expired" : i.status,
      };
    }),
  ];
  return { ok: true, rows };
}

export async function revokeTeacher(
  input: {
    schoolId: string;
    staffMemberId: string;
    actor: StaffMemberRecord;
  },
  deps: {
    staff: StaffMemberRepository;
    sessions: SessionRepository;
    now?: Date;
  },
): Promise<
  | { ok: true; status: "inactive" }
  | {
      ok: false;
      code: "staff.forbidden" | "school.forbidden" | "staff.not_found";
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
  const teacher = await deps.staff.findById(input.staffMemberId);
  if (
    !teacher ||
    teacher.schoolId !== input.schoolId ||
    teacher.role !== "teacher"
  ) {
    return { ok: false, code: "staff.not_found", message: "Staff member not found" };
  }
  const now = deps.now ?? new Date();
  const sessions = await deps.sessions.listByStaffMember(teacher.id);
  const revoked = revokeTeacherAccess({
    role: teacher.role,
    status: teacher.status,
    sessions,
    now,
  });
  await deps.staff.update({ ...teacher, status: revoked.status });
  for (const session of revoked.sessions) {
    await deps.sessions.update(session);
  }
  return { ok: true, status: "inactive" };
}
