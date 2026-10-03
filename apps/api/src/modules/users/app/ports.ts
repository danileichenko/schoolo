import type { InviteStatus, StaffRole, StaffStatus } from "../domain/staff-rules.js";

export type StaffMemberRecord = {
  id: string;
  schoolId: string;
  workEmail: string;
  passwordHash: string;
  role: StaffRole;
  status: StaffStatus;
  failedSignInCount: number;
  lockedUntil: Date | null;
  createdAt: Date;
};

export type TeacherInviteRecord = {
  id: string;
  schoolId: string;
  workEmail: string;
  tokenHash: string;
  status: InviteStatus;
  expiresAt: Date;
  createdAt: Date;
};

export type SessionRecord = {
  id: string;
  staffMemberId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export type StaffMemberRepository = {
  findByWorkEmail(email: string): Promise<StaffMemberRecord | null>;
  findById(id: string): Promise<StaffMemberRecord | null>;
  listBySchool(schoolId: string): Promise<StaffMemberRecord[]>;
  create(member: StaffMemberRecord): Promise<StaffMemberRecord>;
  update(member: StaffMemberRecord): Promise<StaffMemberRecord>;
};

export type TeacherInviteRepository = {
  findByTokenHash(tokenHash: string): Promise<TeacherInviteRecord | null>;
  findById(id: string): Promise<TeacherInviteRecord | null>;
  listBySchool(schoolId: string): Promise<TeacherInviteRecord[]>;
  hasPendingForEmail(schoolId: string, workEmail: string): Promise<boolean>;
  create(invite: TeacherInviteRecord): Promise<TeacherInviteRecord>;
  update(invite: TeacherInviteRecord): Promise<TeacherInviteRecord>;
};

export type SessionRepository = {
  create(session: SessionRecord): Promise<SessionRecord>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  listByStaffMember(staffMemberId: string): Promise<SessionRecord[]>;
  update(session: SessionRecord): Promise<SessionRecord>;
};

export type EmailPort = {
  sendTeacherInvite(input: {
    to: string;
    schoolName: string;
    inviteUrl: string;
  }): Promise<void>;
};
