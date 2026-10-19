import { addMinutes, isBefore } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { appointmentRepository } from "../repositories/appointment.repository";
import { patientRepository } from "@/features/patients/repositories/patient.repository";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "@/shared/lib/errors";
import { getPaginationSkipTake, buildPaginatedResponse } from "@/shared/lib/pagination";
import { formatFullName } from "@/shared/lib/format";
import { prisma } from "@/shared/lib/prisma";
import { auditRepository } from "@/shared/lib/audit";
import {
  APPOINTMENT_CONFIG,
  CLINIC_TIMEZONE,
} from "../constants/appointment.constants";
import { generateSlots, AppointmentSlot } from "../utils/generate-slots";
import { validateStatusTransition } from "../utils/appointment-transitions";
import type {
  BookAppointmentInput,
  RescheduleAppointmentInput,
  UpdateAppointmentStatusInput,
  ListAppointmentsInput,
} from "../schemas/appointment.schema";
import type { AppointmentDTO, AppointmentListItem } from "../types/appointment.types";
import type { Role, AppointmentStatus, AppointmentType } from "@prisma/client";

interface RepositoryAppointmentRow {
  id: string;
  patientId: string;
  clinicianId: string;
  scheduledAt: Date;
  endsAt: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  meetingUrl: string | null;
  cancelReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: {
    id: string;
    patientNo: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    contactNumber: string;
    profileId: string | null;
  };
  clinician: {
    id: string;
    fullName: string;
    email: string;
  };
  consultation: {
    id: string;
  } | null;
}

function toDTO(row: RepositoryAppointmentRow): AppointmentDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    patientNo: row.patient.patientNo,
    patientName: formatFullName(row.patient.firstName, row.patient.middleName, row.patient.lastName),
    patientContact: row.patient.contactNumber,
    clinicianId: row.clinicianId,
    clinicianName: row.clinician.fullName,
    scheduledAt: row.scheduledAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    type: row.type,
    status: row.status,
    reason: row.reason,
    meetingUrl: row.meetingUrl,
    cancelReason: row.cancelReason,
    hasConsultation: !!row.consultation,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toListItem(row: RepositoryAppointmentRow): AppointmentListItem {
  return {
    id: row.id,
    patientId: row.patientId,
    patientNo: row.patient.patientNo,
    patientName: formatFullName(row.patient.firstName, row.patient.middleName, row.patient.lastName),
    clinicianId: row.clinicianId,
    clinicianName: row.clinician.fullName,
    scheduledAt: row.scheduledAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    type: row.type,
    status: row.status,
    reason: row.reason,
    meetingUrl: row.meetingUrl,
    hasConsultation: !!row.consultation,
  };
}

export const appointmentService = {
  async getAvailableSlots(
    clinicianId: string,
    dateStr: string,
    now: Date = new Date()
  ): Promise<AppointmentSlot[]> {
    const dayStart = fromZonedTime(`${dateStr} 00:00:00`, CLINIC_TIMEZONE);
    const dayEnd = fromZonedTime(`${dateStr} 23:59:59`, CLINIC_TIMEZONE);

    const bookedAppointments = await appointmentRepository.findByClinicianAndDate(
      clinicianId,
      dayStart,
      dayEnd
    );

    return generateSlots(dateStr, bookedAppointments, now);
  },

  async bookAppointment(
    currentRole: Role,
    currentProfileId: string,
    input: BookAppointmentInput
  ): Promise<AppointmentDTO> {
    const start = new Date(input.scheduledAt);
    const now = new Date();

    if (isBefore(start, now)) {
      throw new ValidationError("Cannot book an appointment in the past.");
    }

    const end = addMinutes(start, APPOINTMENT_CONFIG.SLOT_DURATION_MINUTES);

    let targetPatientId = input.patientId;

    // PATIENT role books for themselves; resolve patient record by their profile
    if (currentRole === "PATIENT") {
      const patient = await patientRepository.findByProfileId(currentProfileId);
      if (!patient) {
        throw new NotFoundError(
          "No patient profile found. Please complete the credential form first."
        );
      }
      targetPatientId = patient.id;
    } else {
      if (!targetPatientId) {
        throw new ValidationError("Patient ID is required.");
      }
      const patient = await patientRepository.findById(targetPatientId);
      if (!patient) throw new NotFoundError("Patient record not found.");
      if (patient.isArchived) throw new ValidationError("Cannot book for an archived patient.");
    }

    // Double-booking check inside a transaction
    const created = await prisma.$transaction(async (tx) => {
      const conflicts = await appointmentRepository.findOverlapping(
        input.clinicianId,
        targetPatientId!,
        start,
        end,
        undefined,
        tx
      );

      if (conflicts.length > 0) {
        const clinicianConflict = conflicts.some((c) => c.clinicianId === input.clinicianId);
        if (clinicianConflict) {
          throw new ConflictError("The selected clinician is already booked for this time slot.");
        }
        throw new ConflictError("The patient already has an appointment scheduled during this time.");
      }

      const appt = await appointmentRepository.create(
        {
          patientId: targetPatientId!,
          clinicianId: input.clinicianId,
          scheduledAt: start,
          endsAt: end,
          type: input.type,
          reason: input.reason,
        },
        tx
      );

      await auditRepository.log(
        {
          actorId: currentProfileId,
          action: "CREATE",
          entity: "Appointment",
          entityId: appt.id,
          metadata: { type: input.type, scheduledAt: input.scheduledAt },
        },
        tx
      );

      return appt;
    });

    return toDTO(created);
  },

  async getAppointment(
    currentRole: Role,
    currentProfileId: string,
    id: string
  ): Promise<AppointmentDTO> {
    const appt = await appointmentRepository.findById(id);
    if (!appt) throw new NotFoundError("Appointment not found.");

    if (currentRole === "PATIENT" && appt.patient.profileId !== currentProfileId) {
      throw new ForbiddenError("You may only view your own appointments.");
    }

    return toDTO(appt);
  },

  async listAppointments(
    currentRole: Role,
    currentProfileId: string,
    params: ListAppointmentsInput
  ) {
    let effectivePatientId = params.patientId;

    if (currentRole === "PATIENT") {
      const patient = await patientRepository.findByProfileId(currentProfileId);
      if (!patient) {
        return buildPaginatedResponse([], 0, params.page, params.pageSize);
      }
      effectivePatientId = patient.id;
    }

    const { skip, take } = getPaginationSkipTake(params.page, params.pageSize);

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (params.date) {
      startDate = fromZonedTime(`${params.date} 00:00:00`, CLINIC_TIMEZONE);
      endDate = fromZonedTime(`${params.date} 23:59:59`, CLINIC_TIMEZONE);
    } else {
      if (params.startDate) startDate = new Date(params.startDate);
      if (params.endDate) endDate = new Date(params.endDate);
    }

    const queryParams = {
      skip,
      take,
      patientId: effectivePatientId,
      clinicianId: params.clinicianId,
      status: params.status,
      type: params.type,
      startDate,
      endDate,
    };

    const [rows, total] = await Promise.all([
      appointmentRepository.list(queryParams),
      appointmentRepository.count(queryParams),
    ]);

    return buildPaginatedResponse(rows.map(toListItem), total, params.page, params.pageSize);
  },

  async rescheduleAppointment(
    currentRole: Role,
    currentProfileId: string,
    id: string,
    input: RescheduleAppointmentInput
  ): Promise<AppointmentDTO> {
    const appt = await appointmentRepository.findById(id);
    if (!appt) throw new NotFoundError("Appointment not found.");

    if (currentRole === "PATIENT" && appt.patient.profileId !== currentProfileId) {
      throw new ForbiddenError("You may only reschedule your own appointments.");
    }

    if (appt.status !== "PENDING" && appt.status !== "CONFIRMED") {
      throw new ValidationError(`Cannot reschedule an appointment with status ${appt.status}.`);
    }

    const start = new Date(input.scheduledAt);
    const end = addMinutes(start, APPOINTMENT_CONFIG.SLOT_DURATION_MINUTES);

    const updated = await prisma.$transaction(async (tx) => {
      const conflicts = await appointmentRepository.findOverlapping(
        appt.clinicianId,
        appt.patientId,
        start,
        end,
        appt.id,
        tx
      );

      if (conflicts.length > 0) {
        throw new ConflictError("The new time slot conflicts with an existing booking.");
      }

      const res = await appointmentRepository.update(
        appt.id,
        {
          scheduledAt: start,
          endsAt: end,
          meetingUrl: input.meetingUrl !== undefined ? input.meetingUrl : appt.meetingUrl,
        },
        tx
      );

      await auditRepository.log(
        {
          actorId: currentProfileId,
          action: "UPDATE",
          entity: "Appointment",
          entityId: appt.id,
          metadata: { action: "reschedule", newScheduledAt: input.scheduledAt },
        },
        tx
      );

      return res;
    });

    return toDTO(updated);
  },

  async updateStatus(
    currentRole: Role,
    currentProfileId: string,
    id: string,
    input: UpdateAppointmentStatusInput
  ): Promise<AppointmentDTO> {
    const appt = await appointmentRepository.findById(id);
    if (!appt) throw new NotFoundError("Appointment not found.");

    if (currentRole === "PATIENT") {
      if (appt.patient.profileId !== currentProfileId) {
        throw new ForbiddenError("You may only update your own appointment.");
      }
      if (input.status !== "CANCELLED") {
        throw new ForbiddenError("Patients may only cancel their appointments.");
      }
    }

    const validation = validateStatusTransition({
      currentStatus: appt.status,
      nextStatus: input.status,
      type: appt.type,
      meetingUrl: input.meetingUrl ?? appt.meetingUrl,
      scheduledAt: appt.scheduledAt,
      role: currentRole,
      cancelReason: input.cancelReason,
    });

    if (!validation.valid) {
      throw new ValidationError(validation.error!);
    }

    const updated = await appointmentRepository.update(id, {
      status: input.status,
      meetingUrl: input.meetingUrl !== undefined ? input.meetingUrl : appt.meetingUrl,
      cancelReason: input.cancelReason ?? appt.cancelReason,
    });

    await auditRepository.log({
      actorId: currentProfileId,
      action: input.status === "CANCELLED" ? "VOID" : "UPDATE",
      entity: "Appointment",
      entityId: id,
      metadata: { fromStatus: appt.status, toStatus: input.status },
    });

    return toDTO(updated);
  },
};
