import { prisma } from "@/shared/lib/prisma";
import type { EditPatientInput } from "../schemas/patient.schema";
import { demoStore, DemoPatient } from "@/shared/lib/demo-data";

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
    try {
      return await prisma.patient.findUnique({ where: { id }, select: DETAIL_SELECT });
    } catch {
      return demoStore.patients.find((p) => p.id === id) || demoStore.patients[0];
    }
  },

  async findByPatientNo(patientNo: string) {
    try {
      return await prisma.patient.findUnique({ where: { patientNo }, select: DETAIL_SELECT });
    } catch {
      return demoStore.patients.find((p) => p.patientNo === patientNo) || null;
    }
  },

  async findByProfileId(profileId: string) {
    try {
      return await prisma.patient.findUnique({ where: { profileId }, select: DETAIL_SELECT });
    } catch {
      return demoStore.patients.find((p) => p.profileId === profileId) || demoStore.patients[0];
    }
  },

  async findDuplicate(firstName: string, lastName: string, birthDate: Date) {
    try {
      return await prisma.patient.findFirst({
        where: {
          firstName: { equals: firstName, mode: "insensitive" },
          lastName: { equals: lastName, mode: "insensitive" },
          birthDate,
        },
        select: { id: true, patientNo: true },
      });
    } catch {
      const match = demoStore.patients.find(
        (p) =>
          p.firstName.toLowerCase() === firstName.toLowerCase() &&
          p.lastName.toLowerCase() === lastName.toLowerCase()
      );
      return match ? { id: match.id, patientNo: match.patientNo } : null;
    }
  },

  async list(params: {
    skip: number;
    take: number;
    search?: string;
    isArchived?: boolean;
  }) {
    const { skip, take, search, isArchived = false } = params;
    try {
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
      return await prisma.patient.findMany({ where, skip, take, select: LIST_SELECT, orderBy: { lastName: "asc" } });
    } catch {
      let filtered = demoStore.patients.filter((p) => p.isArchived === isArchived);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.firstName.toLowerCase().includes(q) ||
            p.lastName.toLowerCase().includes(q) ||
            p.patientNo.toLowerCase().includes(q)
        );
      }
      return filtered.slice(skip, skip + take).map((p) => ({
        id: p.id,
        patientNo: p.patientNo,
        firstName: p.firstName,
        middleName: p.middleName,
        lastName: p.lastName,
        birthDate: p.birthDate,
        sex: p.sex,
        contactNumber: p.contactNumber,
        isArchived: p.isArchived,
      }));
    }
  },

  async count(params: { search?: string; isArchived?: boolean }) {
    const { search, isArchived = false } = params;
    try {
      return await prisma.patient.count({
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
    } catch {
      let filtered = demoStore.patients.filter((p) => p.isArchived === isArchived);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.firstName.toLowerCase().includes(q) ||
            p.lastName.toLowerCase().includes(q) ||
            p.patientNo.toLowerCase().includes(q)
        );
      }
      return filtered.length;
    }
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
    try {
      return await prisma.patient.create({ data, select: DETAIL_SELECT });
    } catch {
      const newPat: DemoPatient = {
        id: `demo-pat-${demoStore.patients.length + 1}`,
        patientNo: data.patientNo,
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        birthDate: data.birthDate,
        sex: data.sex,
        contactNumber: data.contactNumber,
        address: data.address,
        guardianName: data.guardianName || null,
        guardianContact: data.guardianContact || null,
        emergencyName: data.emergencyName,
        emergencyContact: data.emergencyContact,
        bloodType: data.bloodType || null,
        allergies: data.allergies || null,
        existingConditions: data.existingConditions || null,
        consentGivenAt: data.consentGivenAt,
        isArchived: false,
        profileId: data.profileId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      demoStore.patients.unshift(newPat);
      return newPat;
    }
  },

  async update(id: string, data: Partial<EditPatientInput>) {
    try {
      return await prisma.patient.update({ where: { id }, data, select: DETAIL_SELECT });
    } catch {
      const index = demoStore.patients.findIndex((p) => p.id === id);
      if (index !== -1) {
        demoStore.patients[index] = { ...demoStore.patients[index], ...data } as DemoPatient;
        return demoStore.patients[index];
      }
      return demoStore.patients[0];
    }
  },

  async archive(id: string) {
    try {
      return await prisma.patient.update({
        where: { id },
        data: { isArchived: true },
        select: DETAIL_SELECT,
      });
    } catch {
      const p = demoStore.patients.find((item) => item.id === id);
      if (p) p.isArchived = true;
      return p || demoStore.patients[0];
    }
  },

  async getHistory(patientId: string) {
    try {
      return await prisma.appointment.findMany({
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
    } catch {
      return demoStore.appointments
        .filter((a) => a.patientId === patientId || a.patientId === "demo-pat-1")
        .map((a) => ({
          id: a.id,
          scheduledAt: a.scheduledAt,
          type: a.type,
          status: a.status,
          reason: a.reason,
          consultation: a.consultation
            ? {
                id: a.consultation.id,
                chiefComplaint: a.consultation.chiefComplaint || "Routine Checkup",
                diagnosis: a.consultation.diagnosis || "Hypertension",
                startedAt: a.consultation.startedAt || new Date(),
                endedAt: a.consultation.endedAt || new Date(),
              }
            : null,
        }));
    }
  },
};
