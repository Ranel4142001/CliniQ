import { prisma } from "@/shared/lib/prisma";
import { Role } from "@prisma/client";
import { DEMO_CLINICIANS } from "@/shared/lib/demo-data";

const DEMO_PROFILES = [
  { id: "demo-admin-id", authId: "demo-admin-auth", email: "admin@gmail.com", fullName: "System Administrator", role: "ADMIN" as Role, isActive: true },
  { id: DEMO_CLINICIANS[0].id, authId: "demo-doc-1-auth", email: "doctor@gmail.com", fullName: "Dr. Alberto Cruz", role: "CLINICIAN" as Role, isActive: true },
  { id: DEMO_CLINICIANS[1].id, authId: "demo-doc-2-auth", email: "dr.reyes@cliniq.local", fullName: "Dr. Maria Elena Reyes", role: "CLINICIAN" as Role, isActive: true },
  { id: "demo-staff-1", authId: "demo-staff-1-auth", email: "staff@gmail.com", fullName: "Ana Santos", role: "STAFF" as Role, isActive: true },
  { id: "demo-patient-1", authId: "demo-patient-1-auth", email: "raneldahil@gmail.com", fullName: "Ranel Dahil", role: "PATIENT" as Role, isActive: true },
];

export const authRepository = {
  async findByAuthId(authId: string) {
    try {
      return await prisma.profile.findUnique({
        where: { authId },
        include: {
          patient: {
            select: { id: true, patientNo: true },
          },
        },
      });
    } catch {
      const match = DEMO_PROFILES.find((p) => p.authId === authId || p.id === authId);
      if (match) {
        return {
          ...match,
          createdAt: new Date(),
          updatedAt: new Date(),
          patient: match.role === "PATIENT" ? { id: "demo-pat-1", patientNo: "PT-2026-0001" } : null,
        };
      }
      return null;
    }
  },

  async findById(id: string) {
    try {
      return await prisma.profile.findUnique({
        where: { id },
        include: {
          patient: {
            select: { id: true, patientNo: true },
          },
        },
      });
    } catch {
      const match = DEMO_PROFILES.find((p) => p.id === id);
      if (match) {
        return {
          ...match,
          createdAt: new Date(),
          updatedAt: new Date(),
          patient: match.role === "PATIENT" ? { id: "demo-pat-1", patientNo: "PT-2026-0001" } : null,
        };
      }
      return null;
    }
  },

  async findByEmail(email: string) {
    try {
      return await prisma.profile.findUnique({
        where: { email },
      });
    } catch {
      const match = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (match) {
        return { ...match, createdAt: new Date(), updatedAt: new Date() };
      }
      return null;
    }
  },

  async createProfile(data: {
    authId: string;
    email: string;
    fullName: string;
    role?: Role;
    isActive?: boolean;
  }) {
    try {
      return await prisma.profile.create({
        data: {
          authId: data.authId,
          email: data.email,
          fullName: data.fullName,
          role: data.role ?? "PATIENT",
          isActive: data.isActive ?? true,
        },
      });
    } catch {
      const prof = {
        id: `demo-${data.authId}`,
        authId: data.authId,
        email: data.email,
        fullName: data.fullName,
        role: data.role ?? ("PATIENT" as Role),
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      DEMO_PROFILES.push(prof);
      return prof;
    }
  },

  async updateProfile(
    id: string,
    data: {
      fullName?: string;
      role?: Role;
      isActive?: boolean;
    }
  ) {
    try {
      return await prisma.profile.update({
        where: { id },
        data,
      });
    } catch {
      const match = DEMO_PROFILES.find((p) => p.id === id);
      if (match) {
        if (data.fullName !== undefined) match.fullName = data.fullName;
        if (data.role !== undefined) match.role = data.role;
        if (data.isActive !== undefined) match.isActive = data.isActive;
        return { ...match, createdAt: new Date(), updatedAt: new Date() };
      }
      return {
        id,
        authId: `auth-${id}`,
        email: "user@cliniq.local",
        fullName: data.fullName || "User",
        role: data.role || ("PATIENT" as Role),
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  },

  async listProfiles(params: {
    skip?: number;
    take?: number;
    search?: string;
    role?: Role;
  }) {
    const { skip = 0, take = 10, search, role } = params;
    try {
      return await prisma.profile.findMany({
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
    } catch {
      let filtered = [...DEMO_PROFILES];
      if (role) filtered = filtered.filter((p) => p.role === role);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((p) => p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
      }
      return filtered.slice(skip, skip + take).map((p) => ({ ...p, createdAt: new Date(), updatedAt: new Date() }));
    }
  },

  async countProfiles(params: { search?: string; role?: Role }) {
    const { search, role } = params;
    try {
      return await prisma.profile.count({
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
    } catch {
      let filtered = [...DEMO_PROFILES];
      if (role) filtered = filtered.filter((p) => p.role === role);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((p) => p.fullName.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
      }
      return filtered.length;
    }
  },

  async listActiveClinicians() {
    try {
      return await prisma.profile.findMany({
        where: { role: "CLINICIAN", isActive: true },
        select: { id: true, fullName: true, email: true },
        orderBy: { fullName: "asc" },
      });
    } catch {
      return DEMO_CLINICIANS.map((c) => ({ id: c.id, fullName: c.fullName, email: c.email }));
    }
  },
};
