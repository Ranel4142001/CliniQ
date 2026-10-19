import { prisma } from "@/shared/lib/prisma";
import type { EditPatientInput } from "../schemas/patient.schema";

/** All columns returned for list views */
const LIST_SELECT = {
  id: true,
  patientNo: true,
  firstName: true,
  middleName: true,
  lastName: true,
  birthDate: true,
  sex: true,
  contactNumber: true,
  isArchived: true,
} as const;

/** All columns returned for detail / profile views */
const DETAIL_SELECT = {
  id: true,
  patientNo: true,
  firstName: true,
  middleName: true,
  lastName: true,
  birthDate: true,
  sex: true,
  contactNumber: true,
  address: true,
  guardianName: true,
  guardianContact: true,
  emergencyName: true,
  emergencyContact: true,
  bloodType: true,
  allergies: true,
  existingConditions: true,
  consentGivenAt: true,
  isArchived: true,
  createdAt: true,
  updatedAt: true,
  profileId: true,
} as const;

export const patientRepository = {
  async findById(id: string) {
    return prisma.patient.findUnique({ where: { id }, select: DETAIL_SELECT });
  },

  async findByPatientNo(patientNo: string) {
    return prisma.patient.findUnique({ where: { patientNo }, select: DETAIL_SELECT });
  },

  async findByProfileId(profileId: string) {
    return prisma.patient.findUnique({ where: { profileId }, select: DETAIL_SELECT });
  },

  async findDuplicate(firstName: string, lastName: string, birthDate: Date) {
    return prisma.patient.findFirst({
      where: {
        firstName: { equals: firstName, mode: "insensitive" },
        lastName: { equals: lastName, mode: "insensitive" },
        birthDate,
      },
      select: { id: true, patientNo: true },
    });
  },

  async list(params: {
    skip: number;
    take: number;
    search?: string;
    isArchived?: boolean;
  }) {
    const { skip, take, search, isArchived = false } = params;
    const where = {
      isArchived,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { patientNo: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    return prisma.patient.findMany({ where, skip, take, select: LIST_SELECT, orderBy: { lastName: "asc" } });
  },

  async count(params: { search?: string; isArchived?: boolean }) {
    const { search, isArchived = false } = params;
    return prisma.patient.count({
      where: {
        isArchived,
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" as const } },
                { lastName: { contains: search, mode: "insensitive" as const } },
                { patientNo: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      },
    });
  },

  async create(data: {
    patientNo: string;
    profileId?: string | null;
    firstName: string;
    middleName?: string | null;
    lastName: string;
    birthDate: Date;
    sex: "MALE" | "FEMALE";
    contactNumber: string;
    address: string;
    guardianName?: string | null;
    guardianContact?: string | null;
    emergencyName: string;
    emergencyContact: string;
    bloodType?: string | null;
    allergies?: string | null;
    existingConditions?: string | null;
    consentGivenAt: Date;
  }) {
    return prisma.patient.create({ data, select: DETAIL_SELECT });
  },

  async update(id: string, data: Partial<EditPatientInput>) {
    return prisma.patient.update({ where: { id }, data, select: DETAIL_SELECT });
  },

  async archive(id: string) {
    return prisma.patient.update({
      where: { id },
      data: { isArchived: true },
      select: DETAIL_SELECT,
    });
  },

  async getHistory(patientId: string) {
    return prisma.appointment.findMany({
      where: { patientId },
      select: {
        id: true,
        scheduledAt: true,
        type: true,
        status: true,
        reason: true,
        consultation: {
          select: {
            id: true,
            chiefComplaint: true,
            diagnosis: true,
            startedAt: true,
            endedAt: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });
  },
};
