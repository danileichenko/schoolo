import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function PageShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="page-shell">
      <p className="brand">schoolo</p>
      <h1>{title}</h1>
      {children}
    </main>
  );
}

export function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="app-shell">
      <header className="app-shell__header">
        <h1>{title}</h1>
        <a href="/sign-in">Sign out</a>
      </header>
      {children}
    </main>
  );
}

export function TextField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="field" {...props} />;
}

export function PasswordField(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="field" type="password" {...props} />;
}

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="button" {...props} />;
}

export function Alert({ children }: { children: ReactNode }) {
  return <p className="alert" role="alert">{children}</p>;
}

export function FieldError({ children }: { children: ReactNode }) {
  return <p className="field-error">{children}</p>;
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge--${status}`}>{status}</span>;
}
