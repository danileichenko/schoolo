"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AppShell } from "@/components/ui/primitives";
import { fetchSessionMe } from "@/lib/session";

export default function TeacherWorkspacePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      const me = await fetchSessionMe();
      if (!me) {
        setError("Your access was revoked. Please sign in again.");
        window.sessionStorage.setItem("schoolo_session_ok", "0");
        return;
      }
      if (me.staff.role !== "teacher") {
        router.replace(me.staff.role === "school_admin" ? "/school-admin" : "/sign-in");
        return;
      }
      window.sessionStorage.setItem("schoolo_session_ok", "1");
      setReady(true);
    })();
  }, [router]);

  return (
    <AppShell title="Teacher workspace">
      {error ? (
        <Alert>
          {error} <a href="/sign-in">Sign in</a>
        </Alert>
      ) : ready ? (
        <p>Welcome — journal tools come next</p>
      ) : (
        <p>Loading…</p>
      )}
    </AppShell>
  );
}
