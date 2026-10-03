import { describe, expect, it } from "vitest";
import { assertSchoolDisplayName, schoolNameTakenError } from "./school-name.js";

describe("School display name rules (AC-02b)", () => {
  it("accepts a non-empty trimmed display name", () => {
    expect(assertSchoolDisplayName("  Pilot School  ")).toEqual({
      ok: true,
      name: "Pilot School",
    });
  });

  it("rejects empty or whitespace-only names", () => {
    expect(assertSchoolDisplayName("   ")).toEqual({
      ok: false,
      code: "school.validation_failed",
      fields: ["name"],
    });
  });

  it("names the duplicate-name conflict for registration", () => {
    expect(schoolNameTakenError()).toEqual({
      code: "school.name_taken",
      message: "School name is already in use",
    });
  });
});
