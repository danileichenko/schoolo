"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  AppShell,
  Button,
  StatusBadge,
  TextField,
} from "@/components/ui/primitives";
import { apiBaseUrl } from "@/lib/auth-forms";

type RosterItem = {
  kind: string;
  id: string;
  workEmail: string;
  status: string;
};

export default function SchoolAdminPage() {
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
      return;
    }
    const body = (await response.json()) as { items: RosterItem[] };
    setItems(body.items);
  }

  useEffect(() => {
    // Bootstrap school id from last sign-in/register payload stored by those pages when available.
    const stored = window.sessionStorage.getItem("schoolo_school_id");
    if (!stored) {
      setLoading(false);
      setError("Sign in as School Admin to manage staff");
      return;
    }
    setSchoolId(stored);
    void loadRoster(stored);
  }, []);

  async function onInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolId) return;
    const form = new FormData(event.currentTarget);
    const workEmail = String(form.get("work_email") ?? "");
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
            {item.workEmail} <StatusBadge status={item.status} />{" "}
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
