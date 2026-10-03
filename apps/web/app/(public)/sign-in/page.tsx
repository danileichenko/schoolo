"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  FieldError,
  PageShell,
  PasswordField,
  TextField,
} from "@/components/ui/primitives";
import { apiBaseUrl, validateSignInForm } from "@/lib/auth-forms";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      workEmail: String(form.get("work_email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const local = validateSignInForm(payload);
    if (!local.ok) {
      setFields(local.fields);
      return;
    }
    setLoading(true);
    setError(null);
    const response = await fetch(`${apiBaseUrl()}/api/v1/auth/sign-in`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        work_email: payload.workEmail,
        password: payload.password,
      }),
    });
    setLoading(false);
    if (response.status === 200) {
      const body = (await response.json()) as {
        staff: { role: string };
        school: { id: string };
      };
      window.sessionStorage.setItem("schoolo_school_id", body.school.id);
      window.sessionStorage.setItem("schoolo_session_ok", "1");
      router.push(body.staff.role === "school_admin" ? "/school-admin" : "/teacher");
      return;
    }
    const body = (await response.json()) as { message?: string; code?: string };
    setError(
      body.code === "auth.locked"
        ? (body.message ?? "Account temporarily locked")
        : (body.message ?? "Access denied"),
    );
  }

  return (
    <PageShell title="Sign in">
      {error ? <Alert>{error}</Alert> : null}
      <form onSubmit={onSubmit}>
        <TextField name="work_email" placeholder="Work email" />
        {fields.includes("work_email") ? <FieldError>Email is required</FieldError> : null}
        <PasswordField name="password" placeholder="Password" />
        {fields.includes("password") ? <FieldError>Password is required</FieldError> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p>
        <a href="/register">Register a school</a>
      </p>
    </PageShell>
  );
}
