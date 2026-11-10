import { describe, it, expect } from "vitest";
import {
  accountFormSchema,
  hasChanges,
  planAccountChanges,
  type AccountFormValues,
} from "@/features/settings/utils/account-form";

const original = { fullName: "Ana Santos", email: "ana@clinic.local" };
const values = (overrides: Partial<AccountFormValues> = {}): AccountFormValues => ({
  fullName: original.fullName,
  email: original.email,
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  ...overrides,
});
const errorsOf = (v: AccountFormValues) => {
  const result = accountFormSchema(original).safeParse(v);
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]));
};

describe("account settings form", () => {
  it("lets a name change through without a password", () => {
    expect(errorsOf(values({ fullName: "Ana R. Santos" }))).toEqual({});
    expect(planAccountChanges(values({ fullName: "Ana R. Santos" }), original)).toMatchObject({
      fullName: "Ana R. Santos",
      newEmail: undefined,
      newPassword: undefined,
    });
  });

  it("asks for the current password when the email changes", () => {
    expect(errorsOf(values({ email: "new@clinic.local" }))).toHaveProperty("currentPassword");
  });

  it("ignores case and spaces when deciding if the email changed", () => {
    expect(errorsOf(values({ email: " ANA@clinic.local " }))).toEqual({});
    expect(hasChanges(planAccountChanges(values({ email: "ANA@clinic.local" }), original))).toBe(
      false
    );
  });

  it("checks new password strength and confirmation", () => {
    const errors = errorsOf(
      values({ currentPassword: "Old-pass1", newPassword: "short", confirmPassword: "x" })
    );
    expect(errors).toHaveProperty("newPassword");
    expect(errors).toHaveProperty("confirmPassword");
  });

  it("plans a password change when the form is valid", () => {
    const v = values({
      currentPassword: "Old-pass1",
      newPassword: "New-pass1",
      confirmPassword: "New-pass1",
    });
    expect(errorsOf(v)).toEqual({});
    expect(planAccountChanges(v, original)).toMatchObject({
      newPassword: "New-pass1",
      currentPassword: "Old-pass1",
    });
  });
});
