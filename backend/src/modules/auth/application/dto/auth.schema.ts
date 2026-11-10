import { z } from "zod";
import { ROLES } from "@backend/shared/domain/roles";

const emailSchema = z.string().trim().toLowerCase().email("Please enter a valid email address");

/** Password strength rules, shared by sign-up, admin-created accounts and Settings. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Z]/, "Must include at least one uppercase letter")
  .regex(/[0-9]/, "Must include at least one number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum([ROLES.ADMIN, ROLES.CLINICIAN, ROLES.STAFF], {
    error: "Role must be ADMIN, CLINICIAN, or STAFF",
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  role: z.enum([ROLES.ADMIN, ROLES.CLINICIAN, ROLES.STAFF, ROLES.PATIENT]).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ---------- Account settings (every role, own account only) ----------

const currentPasswordSchema = z.string().min(1, "Enter your current password");

export const updateOwnProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
});

export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>;

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  currentPassword: currentPasswordSchema,
});

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: currentPasswordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Choose a password different from your current one",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
