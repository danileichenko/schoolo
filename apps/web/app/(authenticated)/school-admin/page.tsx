"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AppShell,
  Button,
  StatusBadge,
  TextField,
} from "@/components/ui/primitives";
import { apiBaseUrl } from "@/lib/auth-forms";
import { fetchSessionMe } from "@/lib/session";

type RosterItem = {
  kind: string;
  id: string;
  work_email: string;
  status: string;
};

export default function SchoolAdminPage() {
  const router = useRouter();
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [items, setItems] = useState<RosterItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadRoster(id: string) {
    setLoading(true);
    const response = await fetch(`${apiBaseUrl()}/api/v1/schools/${id}/staff-roster`, {
      credentials: "include",
    });
    setLoading(false);
    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      setError(body.message ?? "Unable to load roster");
      setItems([]);
      return;
    }
    const body = (await response.json()) as { items: RosterItem[] };
    setItems(body.items);
  }

  useEffect(() => {
    void (async () => {
      const me = await fetchSessionMe();
      if (!me || me.staff.role !== "school_admin") {
        router.replace("/sign-in");
        return;
      }
      setSchoolId(me.school.id);
      window.sessionStorage.setItem("schoolo_school_id", me.school.id);
      await loadRoster(me.school.id);
    })();
  }, [router]);

  async function onInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolId) return;
    const form = new FormData(event.currentTarget);
    const workEmail = String(form.get("work_email") ?? "");
    setMessage(null);
    const response = await fetch(
      `${apiBaseUrl()}/api/v1/schools/${schoolId}/teacher-invites`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ work_email: workEmail }),
      },
    );
    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      setError(body.message ?? "Invite failed");
      return;
    }
    setMessage("Invite sent");
    setError(null);
    await loadRoster(schoolId);
  }

  async function onRevoke(staffMemberId: string) {
    if (!schoolId) return;
    setMessage(null);
    const response = await fetch(
      `${apiBaseUrl()}/api/v1/schools/${schoolId}/staff/${staffMemberId}/revoke`,
      { method: "POST", credentials: "include" },
    );
    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      setError(body.message ?? "Revoke failed");
      return;
    }
    setMessage("Teacher access revoked");
    await loadRoster(schoolId);
  }

  async function onReissue(inviteId: string) {
    if (!schoolId) return;
    setMessage(null);
    const response = await fetch(
      `${apiBaseUrl()}/api/v1/schools/${schoolId}/teacher-invites/${inviteId}/reissue`,
      { method: "POST", credentials: "include" },
    );
    if (!response.ok) {
      const body = (await response.json()) as { message?: string };
      setError(body.message ?? "Reissue failed");
      return;
    }
    setMessage("Invite reissued");
    await loadRoster(schoolId);
  }

  return (
    <AppShell title="School administration">
      {error ? <Alert>{error}</Alert> : null}
      {message ? <p>{message}</p> : null}
      <form onSubmit={onInvite}>
        <h2>Invite teacher</h2>
        <TextField name="work_email" placeholder="work email" />
        <Button type="submit">Send invite</Button>
      </form>
      <h2>Staff roster</h2>
      {loading ? <p>Loading…</p> : null}
      {!loading && items.length === 0 ? (
        <p>No teachers yet. Invite your first Teacher by work email.</p>
      ) : null}
      <ul>
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            {item.work_email} <StatusBadge status={item.status} />{" "}
            {item.kind === "staff" && item.status === "active" ? (
              <Button type="button" onClick={() => void onRevoke(item.id)}>
                Revoke
              </Button>
            ) : null}
            {item.kind === "invite" &&
            (item.status === "pending" || item.status === "expired") ? (
              <Button type="button" onClick={() => void onReissue(item.id)}>
                Reissue
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
