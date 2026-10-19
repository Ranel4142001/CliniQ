import { prisma } from "@/shared/lib/prisma";
import { Role } from "@prisma/client";

export const authRepository = {
  async findByAuthId(authId: string) {
    return prisma.profile.findUnique({
      where: { authId },
      include: {
        patient: {
          select: { id: true, patientNo: true },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.profile.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, patientNo: true },
        },
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.profile.findUnique({
      where: { email },
    });
  },

  async createProfile(data: {
    authId: string;
    email: string;
    fullName: string;
    role?: Role;
    isActive?: boolean;
  }) {
    return prisma.profile.create({
      data: {
        authId: data.authId,
        email: data.email,
        fullName: data.fullName,
        role: data.role ?? "PATIENT",
        isActive: data.isActive ?? true,
      },
    });
  },

  async updateProfile(
    id: string,
    data: {
      fullName?: string;
      role?: Role;
      isActive?: boolean;
    }
  ) {
    return prisma.profile.update({
      where: { id },
      data,
    });
  },

  async listProfiles(params: {
    skip?: number;
    take?: number;
    search?: string;
    role?: Role;
  }) {
    const { skip, take, search, role } = params;
    return prisma.profile.findMany({
      where: {
        ...(role ? { role } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  },

  async countProfiles(params: { search?: string; role?: Role }) {
    const { search, role } = params;
    return prisma.profile.count({
      where: {
        ...(role ? { role } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
    });
  },

  async listActiveClinicians() {
    return prisma.profile.findMany({
      where: { role: "CLINICIAN", isActive: true },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });
  },
};
