import { apiBaseUrl } from "./auth-forms";

export type SessionMe = {
  school: { id: string; name: string };
  staff: {
    id: string;
    role: "school_admin" | "teacher";
    status: string;
    work_email: string;
  };
};

export async function fetchSessionMe(): Promise<SessionMe | null> {
  const response = await fetch(`${apiBaseUrl()}/api/v1/auth/me`, {
    credentials: "include",
  });
  if (!response.ok) return null;
  return (await response.json()) as SessionMe;
}
