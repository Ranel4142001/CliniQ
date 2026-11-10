import { z } from "zod";
import { passwordSchema } from "@backend/contracts";

export interface AccountFormValues {
  fullName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** What Save Changes will actually do, based on which fields changed. */
export interface AccountChanges {
  fullName?: string;
  newEmail?: string;
  newPassword?: string;
  currentPassword: string;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * One form for name, email and password. The current password is only required
 * when the email or password is being changed.
 */
export function accountFormSchema(original: { email: string }) {
  return z
    .object({
      fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
      email: z.string().trim().email("Please enter a valid email address"),
      currentPassword: z.string(),
      newPassword: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine((v, ctx) => {
      const changesEmail = normalizeEmail(v.email) !== normalizeEmail(original.email);
      const changesPassword = v.newPassword.length > 0;
      if ((changesEmail || changesPassword) && !v.currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["currentPassword"],
          message: "Enter your current password to save these changes",
        });
      }
      if (!changesPassword) return;
      const strength = passwordSchema.safeParse(v.newPassword);
      if (!strength.success) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: strength.error.issues[0].message,
        });
      } else if (v.newPassword === v.currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "Choose a password different from your current one",
        });
      }
      if (v.confirmPassword !== v.newPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        });
      }
    });
}

/** Compares the submitted values with the saved account and keeps only real changes. */
export function planAccountChanges(
  values: AccountFormValues,
  original: { fullName: string; email: string }
): AccountChanges {
  const fullName = values.fullName.trim();
  const email = normalizeEmail(values.email);
  return {
    fullName: fullName !== original.fullName ? fullName : undefined,
    newEmail: email !== normalizeEmail(original.email) ? email : undefined,
    newPassword: values.newPassword || undefined,
    currentPassword: values.currentPassword,
  };
}

export function hasChanges(changes: AccountChanges): boolean {
  return Boolean(changes.fullName || changes.newEmail || changes.newPassword);
}
