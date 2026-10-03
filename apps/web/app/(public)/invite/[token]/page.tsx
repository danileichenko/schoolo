"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Button,
  FieldError,
  PageShell,
  PasswordField,
} from "@/components/ui/primitives";
import { apiBaseUrl } from "@/lib/auth-forms";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password.length < 12) {
      setFieldError(true);
      return;
    }
    setLoading(true);
    setError(null);
    setFieldError(false);
    const response = await fetch(
      `${apiBaseUrl()}/api/v1/invites/${params.token}/accept`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      },
    );
    setLoading(false);
    if (response.status === 201) {
      const body = (await response.json()) as { school: { id: string } };
      window.sessionStorage.setItem("schoolo_school_id", body.school.id);
      window.sessionStorage.setItem("schoolo_session_ok", "1");
      router.push("/teacher");
      return;
    }
    const body = (await response.json()) as { message?: string };
    setError(body.message ?? "Invite could not be accepted");
  }

  return (
    <PageShell title="Join your school">
      <p>You&apos;ve been invited as a Teacher</p>
      {error ? <Alert>{error}</Alert> : null}
      <form onSubmit={onSubmit}>
        <PasswordField name="password" placeholder="Choose password (min 12)" />
        {fieldError ? (
          <FieldError>Password must be at least 12 characters</FieldError>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Accepting…" : "Accept invite"}
        </Button>
      </form>
    </PageShell>
  );
}
