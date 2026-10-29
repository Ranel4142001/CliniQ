import type { Profile, Role } from "@prisma/client";

export type ProfileWithPatient = Profile & { patient: { id: string; patientNo: string } | null };

export interface ProfileListQuery {
  skip?: number;
  take?: number;
  search?: string;
  role?: Role;
}

export interface ProfileRepositoryPort {
  findByAuthId(authId: string): Promise<ProfileWithPatient | null>;
  findById(id: string): Promise<ProfileWithPatient | null>;
  findByEmail(email: string): Promise<Profile | null>;
  createProfile(data: {
    authId: string;
    email: string;
    fullName: string;
    role: Role;
  }): Promise<Profile>;
  updateProfile(
    id: string,
    data: { fullName?: string; role?: Role; isActive?: boolean }
  ): Promise<Profile>;
  listProfiles(query: ProfileListQuery): Promise<Profile[]>;
  countProfiles(query: Pick<ProfileListQuery, "search" | "role">): Promise<number>;
  listActiveClinicians(): Promise<{ id: string; fullName: string; email: string }[]>;
}
