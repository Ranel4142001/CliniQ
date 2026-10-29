import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPatientService } from "@backend/modules/patients/application/services/patient.service";
import { createPatientSchema } from "@backend/modules/patients/application/dto/patient.schema";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@backend/shared/domain/errors/app-error";
import { fakeAuditLog, fakeSequences, fakeTransactions } from "../../support/fakes";

const createdPatient = {
  id: "pt-123",
  patientNo: "PT-2026-0001",
  profileId: null,
  firstName: "John",
  middleName: null,
  lastName: "Doe",
  birthDate: new Date("1995-05-15"),
  sex: "MALE" as const,
  contactNumber: "09123456789",
  address: "123 Main St",
  guardianName: null,
  guardianContact: null,
  emergencyName: "Jane Doe",
  emergencyContact: "09987654321",
  bloodType: "O+",
  allergies: "None",
  existingConditions: "None",
  consentGivenAt: new Date(),
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const patientRepository = {
  findById: vi.fn(),
  findByPatientNo: vi.fn(),
  findByProfileId: vi.fn(),
  findDuplicate: vi.fn(),
  list: vi.fn(),
  count: vi.fn(),
  create: vi.fn().mockResolvedValue(createdPatient),
  update: vi.fn(),
  archive: vi.fn(),
  getHistory: vi.fn(),
};

const patientService = createPatientService({
  patientRepository,
  transactions: fakeTransactions(),
  sequences: fakeSequences("PT-2026-0001"),
  auditRepository: fakeAuditLog(),
});

describe("Patient Service & Business Rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    patientRepository.create.mockResolvedValue(createdPatient);
  });

  const validAdultInput = {
    firstName: "John",
    lastName: "Doe",
    birthDate: "1995-05-15",
    sex: "MALE" as const,
    contactNumber: "09123456789",
    address: "123 Main St",
    emergencyName: "Jane Doe",
    emergencyContact: "09987654321",
    consentGiven: true as const,
  };

  it("validates that patients under 18 require guardian information", () => {
    const under18Input = {
      ...validAdultInput,
      birthDate: "2015-05-15",
    };

    const result = createPatientSchema.safeParse(under18Input);
    expect(result.success).toBe(false);

    const withGuardian = {
      ...under18Input,
      guardianName: "Mother Mary",
      guardianContact: "09112223333",
    };
    const validResult = createPatientSchema.safeParse(withGuardian);
    expect(validResult.success).toBe(true);
  });

  it("throws ConflictError when a duplicate patient is detected", async () => {
    vi.mocked(patientRepository.findDuplicate).mockResolvedValueOnce({
      id: "pt-existing",
      patientNo: "PT-2026-0005",
    });

    await expect(patientService.createPatient("STAFF", "staff-1", validAdultInput)).rejects.toThrow(
      ConflictError
    );
  });

  it("prevents CLINICIAN from creating patient records", async () => {
    await expect(
      patientService.createPatient("CLINICIAN", "doc-1", validAdultInput)
    ).rejects.toThrow(ForbiddenError);
  });

  it("prevents PATIENT from listing other patients", async () => {
    await expect(
      patientService.listPatients("PATIENT", { page: 1, pageSize: 10, isArchived: false })
    ).rejects.toThrow(ForbiddenError);
  });

  it("prevents PATIENT from viewing another patient's record", async () => {
    vi.mocked(patientRepository.findById).mockResolvedValueOnce({
      id: "pt-123",
      patientNo: "PT-2026-0001",
      profileId: "profile-other",
      firstName: "Secret",
      middleName: null,
      lastName: "Patient",
      birthDate: new Date("1990-01-01"),
      sex: "MALE",
      contactNumber: "123",
      address: "abc",
      guardianName: null,
      guardianContact: null,
      emergencyName: "Em",
      emergencyContact: "456",
      bloodType: null,
      allergies: null,
      existingConditions: null,
      consentGivenAt: new Date(),
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(patientService.getPatient("PATIENT", "my-profile-id", "pt-123")).rejects.toThrow(
      ForbiddenError
    );
  });

  it("allows PATIENT to only update allowed self-edit fields", async () => {
    vi.mocked(patientRepository.findById).mockResolvedValueOnce({
      id: "pt-123",
      patientNo: "PT-2026-0001",
      profileId: "my-profile-id",
      firstName: "Original",
      middleName: null,
      lastName: "Name",
      birthDate: new Date("1990-01-01"),
      sex: "MALE",
      contactNumber: "09111111111",
      address: "Old Address",
      guardianName: null,
      guardianContact: null,
      emergencyName: "Old Contact",
      emergencyContact: "09222222222",
      bloodType: null,
      allergies: null,
      existingConditions: null,
      consentGivenAt: new Date(),
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(patientRepository.update).mockImplementation(async (id, data) => ({
      id,
      patientNo: "PT-2026-0001",
      profileId: "my-profile-id",
      firstName: "Original", // Did not change
      middleName: null,
      lastName: "Name",
      birthDate: new Date("1990-01-01"),
      sex: "MALE",
      contactNumber: data.contactNumber ?? "09111111111",
      address: data.address ?? "Old Address",
      guardianName: null,
      guardianContact: null,
      emergencyName: data.emergencyName ?? "Old Contact",
      emergencyContact: data.emergencyContact ?? "09222222222",
      bloodType: null,
      allergies: data.allergies ?? null,
      existingConditions: null,
      consentGivenAt: new Date(),
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await patientService.updatePatient("PATIENT", "my-profile-id", "pt-123", {
      firstName: "HackedName", // Not allowed
      address: "New Address 456", // Allowed
    });

    expect(patientRepository.update).toHaveBeenCalledWith("pt-123", {
      address: "New Address 456",
    });
  });

  it("throws NotFoundError when archiving a non-existent patient", async () => {
    vi.mocked(patientRepository.findById).mockResolvedValueOnce(null);

    await expect(patientService.archivePatient("STAFF", "staff-1", "non-existent")).rejects.toThrow(
      NotFoundError
    );
  });
});
