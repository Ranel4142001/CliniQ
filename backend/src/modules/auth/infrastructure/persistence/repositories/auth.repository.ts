import { prisma } from "@backend/shared/infrastructure/persistence/prisma";
import { Prisma, Role } from "@prisma/client";
import type { ProfileRepositoryPort } from "@backend/modules/auth/application/ports/outbound/profile-repository.port";

const WITH_PATIENT = {
  patient: { select: { id: true, patientNo: true } },
} satisfies Prisma.ProfileInclude;

function buildProfileWhere(search?: string, role?: Role): Prisma.ProfileWhereInput {
  return {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export const authRepository = {
  async findByAuthId(authId: string) {
    return prisma.profile.findUnique({ where: { authId }, include: WITH_PATIENT });
  },

  async findById(id: string) {
    return prisma.profile.findUnique({ where: { id }, include: WITH_PATIENT });
  },

  async findByEmail(email: string) {
    return prisma.profile.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  },

  async createProfile(data: { authId: string; email: string; fullName: string; role: Role }) {
    return prisma.profile.create({ data: { ...data, isActive: true } });
  },

  async updateProfile(id: string, data: { fullName?: string; role?: Role; isActive?: boolean }) {
    return prisma.profile.update({ where: { id }, data });
  },

  async listProfiles(params: { skip?: number; take?: number; search?: string; role?: Role }) {
    const { skip, take, search, role } = params;
    return prisma.profile.findMany({
      where: buildProfileWhere(search, role),
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  },

  async countProfiles(params: { search?: string; role?: Role }) {
    return prisma.profile.count({ where: buildProfileWhere(params.search, params.role) });
  },

  async listActiveClinicians() {
    return prisma.profile.findMany({
      where: { role: "CLINICIAN", isActive: true },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });
  },
} satisfies ProfileRepositoryPort;
