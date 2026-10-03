import type { SessionRepository, StaffMemberRecord, StaffMemberRepository } from "./ports.js";
import { hashToken } from "./crypto.js";

export const SESSION_COOKIE = "schoolo_session";

export async function resolveSessionActor(
  sessionToken: string | undefined,
  deps: { sessions: SessionRepository; staff: StaffMemberRepository },
  now = new Date(),
): Promise<StaffMemberRecord | null> {
  if (!sessionToken) return null;
  const session = await deps.sessions.findByTokenHash(hashToken(sessionToken));
  if (!session || session.revokedAt) return null;
  if (session.expiresAt.getTime() <= now.getTime()) return null;
  const staff = await deps.staff.findById(session.staffMemberId);
  if (!staff || staff.status !== "active") return null;
  return staff;
}

export function sessionCookieHeader(token: string): string {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Lax`;
}
