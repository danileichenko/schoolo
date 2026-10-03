import { describe, expect, it } from "vitest";
import { validateRegisterForm, validateSignInForm } from "./auth-forms";

describe("SCR-01 / SCR-02 form validation", () => {
  it("requires register fields and password length 12", () => {
    expect(
      validateRegisterForm({
        name: "",
        workEmail: "bad",
        password: "short",
      }),
    ).toEqual({
      ok: false,
      fields: ["name", "work_email", "password"],
    });
    expect(
      validateRegisterForm({
        name: "Pilot",
        workEmail: "a@example.test",
        password: "correct-horse",
      }),
    ).toEqual({ ok: true });
  });

  it("requires sign-in email and password", () => {
    expect(validateSignInForm({ workEmail: "", password: "" })).toEqual({
      ok: false,
      fields: ["work_email", "password"],
    });
  });
});
