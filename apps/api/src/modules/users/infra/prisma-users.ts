import type { PrismaClient } from "@prisma/client";
import type {
  SessionRecord,
  SessionRepository,
  StaffMemberRecord,
  StaffMemberRepository,
  TeacherInviteRecord,
  TeacherInviteRepository,
} from "../app/ports.js";
import type { InviteStatus, StaffRole, StaffStatus } from "../domain/staff-rules.js";

function toStaff(row: {
  id: string;
  schoolId: string;
  workEmail: string;
  passwordHash: string;
  role: string;
  status: string;
  failedSignInCount: number;
  lockedUntil: Date | null;
  createdAt: Date;
}): StaffMemberRecord {
  return {
    id: row.id,
    schoolId: row.schoolId,
    workEmail: row.workEmail,
    passwordHash: row.passwordHash,
    role: row.role as StaffRole,
    status: row.status as StaffStatus,
    failedSignInCount: row.failedSignInCount,
    lockedUntil: row.lockedUntil,
    createdAt: row.createdAt,
  };
}

export class PrismaStaffMemberRepository implements StaffMemberRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByWorkEmail(email: string): Promise<StaffMemberRecord | null> {
    const row = await this.prisma.staffMember.findUnique({
      where: { workEmail: email.toLowerCase() },
    });
    return row ? toStaff(row) : null;
  }

  async findById(id: string): Promise<StaffMemberRecord | null> {
    const row = await this.prisma.staffMember.findUnique({ where: { id } });
    return row ? toStaff(row) : null;
  }

  async listBySchool(schoolId: string): Promise<StaffMemberRecord[]> {
    const rows = await this.prisma.staffMember.findMany({ where: { schoolId } });
    return rows.map(toStaff);
  }

  async create(member: StaffMemberRecord): Promise<StaffMemberRecord> {
    const row = await this.prisma.staffMember.create({
      data: {
        id: member.id,
        schoolId: member.schoolId,
        workEmail: member.workEmail.toLowerCase(),
        passwordHash: member.passwordHash,
        role: member.role,
        status: member.status,
        failedSignInCount: member.failedSignInCount,
        lockedUntil: member.lockedUntil,
        createdAt: member.createdAt,
      },
    });
    return toStaff(row);
  }

  async update(member: StaffMemberRecord): Promise<StaffMemberRecord> {
    const row = await this.prisma.staffMember.update({
      where: { id: member.id },
      data: {
        status: member.status,
        failedSignInCount: member.failedSignInCount,
        lockedUntil: member.lockedUntil,
        passwordHash: member.passwordHash,
      },
    });
    return toStaff(row);
  }
}

function toInvite(row: {
  id: string;
  schoolId: string;
  workEmail: string;
  tokenHash: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
}): TeacherInviteRecord {
  return {
    id: row.id,
    schoolId: row.schoolId,
    workEmail: row.workEmail,
    tokenHash: row.tokenHash,
    status: row.status as InviteStatus,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

export class PrismaTeacherInviteRepository implements TeacherInviteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByTokenHash(tokenHash: string): Promise<TeacherInviteRecord | null> {
    const row = await this.prisma.teacherInvite.findUnique({ where: { tokenHash } });
    return row ? toInvite(row) : null;
  }

  async findById(id: string): Promise<TeacherInviteRecord | null> {
    const row = await this.prisma.teacherInvite.findUnique({ where: { id } });
    return row ? toInvite(row) : null;
  }

  async listBySchool(schoolId: string): Promise<TeacherInviteRecord[]> {
    const rows = await this.prisma.teacherInvite.findMany({ where: { schoolId } });
    return rows.map(toInvite);
  }

  async hasPendingForEmail(schoolId: string, workEmail: string): Promise<boolean> {
    const count = await this.prisma.teacherInvite.count({
      where: {
        schoolId,
        workEmail: workEmail.toLowerCase(),
        status: "pending",
      },
    });
    return count > 0;
  }

  async create(invite: TeacherInviteRecord): Promise<TeacherInviteRecord> {
    const row = await this.prisma.teacherInvite.create({
      data: {
        id: invite.id,
        schoolId: invite.schoolId,
        workEmail: invite.workEmail.toLowerCase(),
        tokenHash: invite.tokenHash,
        status: invite.status,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
      },
    });
    return toInvite(row);
  }

  async update(invite: TeacherInviteRecord): Promise<TeacherInviteRecord> {
    const row = await this.prisma.teacherInvite.update({
      where: { id: invite.id },
      data: { status: invite.status },
    });
    return toInvite(row);
  }
}

function toSession(row: {
  id: string;
  staffMemberId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}): SessionRecord {
  return { ...row };
}

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(session: SessionRecord): Promise<SessionRecord> {
    const row = await this.prisma.session.create({ data: session });
    return toSession(row);
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const row = await this.prisma.session.findUnique({ where: { tokenHash } });
    return row ? toSession(row) : null;
  }

  async listByStaffMember(staffMemberId: string): Promise<SessionRecord[]> {
    const rows = await this.prisma.session.findMany({ where: { staffMemberId } });
    return rows.map(toSession);
  }

  async update(session: SessionRecord): Promise<SessionRecord> {
    const row = await this.prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: session.revokedAt },
    });
    return toSession(row);
  }
}
