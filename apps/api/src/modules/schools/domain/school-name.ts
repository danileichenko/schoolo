export type SchoolNameOk = { ok: true; name: string };
export type SchoolNameErr = {
  ok: false;
  code: "school.validation_failed";
  fields: string[];
};

export function assertSchoolDisplayName(raw: string): SchoolNameOk | SchoolNameErr {
  const name = raw.trim();
  if (name.length === 0) {
    return { ok: false, code: "school.validation_failed", fields: ["name"] };
  }
  return { ok: true, name };
}

export function schoolNameTakenError(): {
  code: "school.name_taken";
  message: string;
} {
  return {
    code: "school.name_taken",
    message: "School name is already in use",
  };
}
