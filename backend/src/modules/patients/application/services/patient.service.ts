import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "@backend/shared/domain/errors/app-error";
import {
  getPaginationSkipTake,
  buildPaginatedResponse,
} from "@backend/shared/application/pagination";
import { formatFullName } from "@backend/shared/domain/person-name";
import type { PatientRepositoryPort } from "@backend/modules/patients/application/ports/outbound/patient-repository.port";
import type { AuditLogPort } from "@backend/shared/application/ports/audit-log.port";
import type { RecordNumberGeneratorPort } from "@backend/shared/application/ports/record-number-generator.port";
import { RECORD_PREFIXES } from "@backend/shared/domain/record-number";
import type { TransactionRunner } from "@backend/shared/application/ports/transaction.port";
import type {
  CreatePatientInput,
  EditPatientInput,
  ListPatientsInput,
} from "@backend/modules/patients/application/dto/patient.schema";
import type {
  PatientDTO,
  PatientListItem,
} from "@backend/modules/patients/application/dto/patient.types";
import { PATIENT_SELF_EDIT_FIELDS } from "@backend/modules/patients/domain/constants/patient.constants";
import type { Role } from "@prisma/client";

/** Compute age in full years from a Date */
function computeAge(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  return age;
}

/** Map a Prisma patient row → PatientDTO (safe for client) */
function toDTO(row: {
  id: string;
  patientNo: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  birthDate: Date;
  sex: "MALE" | "FEMALE";
  contactNumber: string;
  address: string;
  guardianName: string | null;
  guardianContact: string | null;
  emergencyName: string;
  emergencyContact: string;
  bloodType: string | null;
  allergies: string | null;
  existingConditions: string | null;
  consentGivenAt: Date;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PatientDTO {
  return {
    id: row.id,
    patientNo: row.patientNo,
    firstName: row.firstName,
    middleName: row.middleName,
    lastName: row.lastName,
    fullName: formatFullName(row.firstName, row.middleName, row.lastName),
    birthDate: row.birthDate.toISOString().split("T")[0],
    age: computeAge(row.birthDate),
    sex: row.sex,
    contactNumber: row.contactNumber,
    address: row.address,
    guardianName: row.guardianName,
    guardianContact: row.guardianContact,
    emergencyName: row.emergencyName,
    emergencyContact: row.emergencyContact,
    bloodType: row.bloodType,
    allergies: row.allergies,
    existingConditions: row.existingConditions,
    consentGivenAt: row.consentGivenAt.toISOString(),
    isArchived: row.isArchived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Map a list row → PatientListItem */
function toListItem(row: {
  id: string;
  patientNo: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  birthDate: Date;
  sex: "MALE" | "FEMALE";
  contactNumber: string;
  isArchived: boolean;
}): PatientListItem {
  return {
    id: row.id,
    patientNo: row.patientNo,
    fullName: formatFullName(row.firstName, row.middleName, row.lastName),
    birthDate: row.birthDate.toISOString().split("T")[0],
    age: computeAge(row.birthDate),
    sex: row.sex,
    contactNumber: row.contactNumber,
    isArchived: row.isArchived,
  };
}

export interface PatientServiceDeps {
  patientRepository: PatientRepositoryPort;
  transactions: TransactionRunner;
  recordNumbers: RecordNumberGeneratorPort;
  auditRepository: AuditLogPort;
}

export type PatientService = ReturnType<typeof createPatientService>;

export function createPatientService({
  patientRepository,
  transactions,
  recordNumbers,
  auditRepository,
}: PatientServiceDeps) {
  return {
    async listPatients(currentRole: Role, params: ListPatientsInput) {
      if (currentRole === "PATIENT") {
        throw new ForbiddenError("Patients may not list other patients.");
      }
      const { skip, take } = getPaginationSkipTake(params.page, params.pageSize);
      const [rows, total] = await Promise.all([
        patientRepository.list({
          skip,
          take,
          search: params.search,
          isArchived: params.isArchived,
        }),
        patientRepository.count({ search: params.search, isArchived: params.isArchived }),
      ]);
      return buildPaginatedResponse(rows.map(toListItem), total, params.page, params.pageSize);
    },

    async createPatient(
      currentRole: Role,
      currentProfileId: string,
      input: CreatePatientInput,
      forProfileId?: string | null
    ): Promise<PatientDTO> {
      if (currentRole === "PATIENT" && forProfileId !== currentProfileId) {
        throw new ForbiddenError("Patients may only create their own record.");
      }
      if (currentRole === "CLINICIAN") {
        throw new ForbiddenError("Clinicians may not create patient records.");
      }

      // Duplicate detection by name + birth date
      const dupe = await patientRepository.findDuplicate(
        input.firstName,
        input.lastName,
        new Date(input.birthDate)
      );
      if (dupe) {
        throw new ConflictError(
          `A patient with this name and birth date may already exist (${dupe.patientNo}). ` +
            "Please verify before continuing."
        );
      }

      // Assign the patient number inside the transaction that creates the patient
      const patient = await transactions.run(async (tx) => {
        const patientNo = await recordNumbers.next(RECORD_PREFIXES.PATIENT, (candidate) =>
          patientRepository.isPatientNoTaken(candidate, tx)
        );

        const created = await patientRepository.create(
          {
            patientNo,
            profileId: forProfileId ?? null,
            firstName: input.firstName,
            middleName: input.middleName ?? null,
            lastName: input.lastName,
            birthDate: new Date(input.birthDate),
            sex: input.sex,
            contactNumber: input.contactNumber,
            address: input.address,
            guardianName: input.guardianName ?? null,
            guardianContact: input.guardianContact ?? null,
            emergencyName: input.emergencyName,
            emergencyContact: input.emergencyContact,
            bloodType: input.bloodType ?? null,
            allergies: input.allergies ?? null,
            existingConditions: input.existingConditions ?? null,
            consentGivenAt: new Date(),
          },
          tx
        );

        await auditRepository.log(
          {
            actorId: currentProfileId,
            action: "CREATE",
            entity: "Patient",
            entityId: created.id,
          },
          tx
        );

        return created;
      });

      return toDTO(patient);
    },

    async getPatient(
      currentRole: Role,
      currentProfileId: string,
      patientId: string
    ): Promise<PatientDTO> {
      const row = await patientRepository.findById(patientId);
      if (!row) throw new NotFoundError("Patient not found.");

      // PATIENT can only view their own record
      if (currentRole === "PATIENT" && row.profileId !== currentProfileId) {
        throw new ForbiddenError("You may only view your own patient record.");
      }

      await auditRepository.log({
        actorId: currentProfileId,
        action: "VIEW",
        entity: "Patient",
        entityId: patientId,
      });

      return toDTO(row);
    },

    async getPatientByProfileId(profileId: string): Promise<PatientDTO | null> {
      const row = await patientRepository.findByProfileId(profileId);
      if (!row) return null;
      return toDTO(row);
    },

    async updatePatient(
      currentRole: Role,
      currentProfileId: string,
      patientId: string,
      input: EditPatientInput
    ): Promise<PatientDTO> {
      const row = await patientRepository.findById(patientId);
      if (!row) throw new NotFoundError("Patient not found.");
      if (row.isArchived) throw new ForbiddenError("Archived patients cannot be edited.");

      let updateData = input;

      // Patients may only update their own record, and only allowed fields
      if (currentRole === "PATIENT") {
        if (row.profileId !== currentProfileId) {
          throw new ForbiddenError("You may only edit your own patient record.");
        }
        const allowed = new Set<string>(PATIENT_SELF_EDIT_FIELDS);
        updateData = Object.fromEntries(
          Object.entries(input).filter(([k]) => allowed.has(k))
        ) as EditPatientInput;
      } else if (currentRole === "CLINICIAN") {
        throw new ForbiddenError("Clinicians may not edit patient records.");
      }

      const updated = await patientRepository.update(patientId, updateData);

      await auditRepository.log({
        actorId: currentProfileId,
        action: "UPDATE",
        entity: "Patient",
        entityId: patientId,
        metadata: { fields: Object.keys(updateData) },
      });

      return toDTO(updated);
    },

    async archivePatient(
      currentRole: Role,
      currentProfileId: string,
      patientId: string
    ): Promise<PatientDTO> {
      if (currentRole !== "ADMIN" && currentRole !== "STAFF") {
        throw new ForbiddenError("Only staff or admin may archive patients.");
      }
      const row = await patientRepository.findById(patientId);
      if (!row) throw new NotFoundError("Patient not found.");
      if (row.isArchived) throw new ConflictError("Patient is already archived.");

      const updated = await patientRepository.archive(patientId);

      await auditRepository.log({
        actorId: currentProfileId,
        action: "ARCHIVE",
        entity: "Patient",
        entityId: patientId,
      });

      return toDTO(updated);
    },

    async getPatientHistory(currentRole: Role, currentProfileId: string, patientId: string) {
      const row = await patientRepository.findById(patientId);
      if (!row) throw new NotFoundError("Patient not found.");

      if (currentRole === "PATIENT" && row.profileId !== currentProfileId) {
        throw new ForbiddenError("You may only view your own history.");
      }

      await auditRepository.log({
        actorId: currentProfileId,
        action: "VIEW",
        entity: "Patient",
        entityId: patientId,
        metadata: { section: "history" },
      });

      return patientRepository.getHistory(patientId);
    },
  };
}
