import type { SessionRepository, StaffMemberRecord, StaffMemberRepository } from "./ports.js";
import { hashToken } from "./crypto.js";

export const SESSION_COOKIE = "schoolo_session";
const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

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
  const secure =
    process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SEC}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
