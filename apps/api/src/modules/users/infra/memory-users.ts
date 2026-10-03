import type {
  EmailPort,
  SessionRecord,
  SessionRepository,
  StaffMemberRecord,
  StaffMemberRepository,
  TeacherInviteRecord,
  TeacherInviteRepository,
} from "../app/ports.js";

export class MemoryStaffMemberRepository implements StaffMemberRepository {
  private readonly byId = new Map<string, StaffMemberRecord>();
  private readonly byEmail = new Map<string, StaffMemberRecord>();

  async findByWorkEmail(email: string): Promise<StaffMemberRecord | null> {
    return this.byEmail.get(email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<StaffMemberRecord | null> {
    return this.byId.get(id) ?? null;
  }

  async listBySchool(schoolId: string): Promise<StaffMemberRecord[]> {
    return [...this.byId.values()].filter((m) => m.schoolId === schoolId);
  }

  async create(member: StaffMemberRecord): Promise<StaffMemberRecord> {
    const key = member.workEmail.toLowerCase();
    if (this.byEmail.has(key)) {
      throw Object.assign(new Error("work_email taken"), { code: "P2002" });
    }
    const stored = { ...member, workEmail: key };
    this.byId.set(stored.id, stored);
    this.byEmail.set(key, stored);
    return stored;
  }

  async update(member: StaffMemberRecord): Promise<StaffMemberRecord> {
    const stored = { ...member, workEmail: member.workEmail.toLowerCase() };
    this.byId.set(stored.id, stored);
    this.byEmail.set(stored.workEmail, stored);
    return stored;
  }
}

export class MemoryTeacherInviteRepository implements TeacherInviteRepository {
  private readonly byId = new Map<string, TeacherInviteRecord>();
  private readonly byToken = new Map<string, TeacherInviteRecord>();

  async findByTokenHash(tokenHash: string): Promise<TeacherInviteRecord | null> {
    return this.byToken.get(tokenHash) ?? null;
  }

  async findById(id: string): Promise<TeacherInviteRecord | null> {
    return this.byId.get(id) ?? null;
  }

  async listBySchool(schoolId: string): Promise<TeacherInviteRecord[]> {
    return [...this.byId.values()].filter((i) => i.schoolId === schoolId);
  }

  async hasPendingForEmail(schoolId: string, workEmail: string): Promise<boolean> {
    const email = workEmail.toLowerCase();
    return [...this.byId.values()].some(
      (i) =>
        i.schoolId === schoolId &&
        i.workEmail === email &&
        i.status === "pending",
    );
  }

  async create(invite: TeacherInviteRecord): Promise<TeacherInviteRecord> {
    const stored = { ...invite, workEmail: invite.workEmail.toLowerCase() };
    this.byId.set(stored.id, stored);
    this.byToken.set(stored.tokenHash, stored);
    return stored;
  }

  async update(invite: TeacherInviteRecord): Promise<TeacherInviteRecord> {
    const stored = { ...invite, workEmail: invite.workEmail.toLowerCase() };
    this.byId.set(stored.id, stored);
    this.byToken.set(stored.tokenHash, stored);
    return stored;
  }
}

export class MemorySessionRepository implements SessionRepository {
  private readonly byId = new Map<string, SessionRecord>();
  private readonly byToken = new Map<string, SessionRecord>();

  async create(session: SessionRecord): Promise<SessionRecord> {
    this.byId.set(session.id, session);
    this.byToken.set(session.tokenHash, session);
    return session;
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    return this.byToken.get(tokenHash) ?? null;
  }

  async listByStaffMember(staffMemberId: string): Promise<SessionRecord[]> {
    return [...this.byId.values()].filter((s) => s.staffMemberId === staffMemberId);
  }

  async update(session: SessionRecord): Promise<SessionRecord> {
    this.byId.set(session.id, session);
    this.byToken.set(session.tokenHash, session);
    return session;
  }
}

export class LoggingEmailAdapter implements EmailPort {
  readonly sent: Array<{ to: string; schoolName: string; inviteUrl: string }> = [];

  async sendTeacherInvite(input: {
    to: string;
    schoolName: string;
    inviteUrl: string;
  }): Promise<void> {
    this.sent.push(input);
  }
}
