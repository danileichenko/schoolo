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
import { apiBaseUrl, validateRegisterForm } from "@/lib/auth-forms";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      workEmail: String(form.get("work_email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const local = validateRegisterForm(payload);
    if (!local.ok) {
      setFields(local.fields);
      setError("Fix the highlighted fields");
      return;
    }
    setLoading(true);
    setError(null);
    setFields([]);
    const response = await fetch(`${apiBaseUrl()}/api/v1/auth/register-school`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: payload.name,
        work_email: payload.workEmail,
        password: payload.password,
      }),
    });
    setLoading(false);
    if (response.status === 201) {
      const body = (await response.json()) as { school: { id: string } };
      window.sessionStorage.setItem("schoolo_school_id", body.school.id);
      window.sessionStorage.setItem("schoolo_session_ok", "1");
      router.push("/school-admin");
      return;
    }
    const body = (await response.json()) as {
      code?: string;
      message?: string;
      details?: { fields?: string[] };
    };
    if (body.details?.fields) setFields(body.details.fields);
    setError(body.message ?? "Registration failed");
  }

  return (
    <PageShell title="Register your school">
      {error ? <Alert>{error}</Alert> : null}
      <form onSubmit={onSubmit}>
        <TextField name="name" placeholder="School display name" />
        {fields.includes("name") ? <FieldError>Name is required</FieldError> : null}
        <TextField name="work_email" placeholder="Work email" />
        {fields.includes("work_email") ? (
          <FieldError>Enter a valid work email</FieldError>
        ) : null}
        <PasswordField name="password" placeholder="Password (min 12)" />
        {fields.includes("password") ? (
          <FieldError>Password must be at least 12 characters</FieldError>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create school"}
        </Button>
      </form>
      <p>
        Already have an account? <a href="/sign-in">Sign in</a>
      </p>
    </PageShell>
  );
}
