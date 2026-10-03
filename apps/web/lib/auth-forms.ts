export function validateRegisterForm(input: {
  name: string;
  workEmail: string;
  password: string;
}): { ok: true } | { ok: false; fields: string[] } {
  const fields: string[] = [];
  if (!input.name.trim()) fields.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.workEmail.trim())) {
    fields.push("work_email");
  }
  if (input.password.length < 12) fields.push("password");
  return fields.length ? { ok: false, fields } : { ok: true };
}

export function validateSignInForm(input: {
  workEmail: string;
  password: string;
}): { ok: true } | { ok: false; fields: string[] } {
  const fields: string[] = [];
  if (!input.workEmail.trim()) fields.push("work_email");
  if (!input.password) fields.push("password");
  return fields.length ? { ok: false, fields } : { ok: true };
}

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
}
