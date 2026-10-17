import { Role } from "@prisma/client";

export interface UserProfile {
  id: string;
  authId: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Present when the profile was fetched with the patient relation included. */
  patient?: {
    id: string;
    patientNo: string;
  } | null;
}

export interface CreateUserData {
  email: string;
  password?: string;
  fullName: string;
  role: Role;
}

export interface UpdateUserData {
  role?: Role;
  isActive?: boolean;
}
