"use client";

import { useEffect, useState } from "react";
import { Alert, AppShell } from "@/components/ui/primitives";

export default function TeacherWorkspacePage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const flag = window.sessionStorage.getItem("schoolo_session_ok");
    if (flag === "0") {
      setError("Your access was revoked. Please sign in again.");
    }
  }, []);

  return (
    <AppShell title="Teacher workspace">
      {error ? (
        <Alert>
          {error} <a href="/sign-in">Sign in</a>
        </Alert>
      ) : (
        <p>Welcome — journal tools come next</p>
      )}
    </AppShell>
  );
}
