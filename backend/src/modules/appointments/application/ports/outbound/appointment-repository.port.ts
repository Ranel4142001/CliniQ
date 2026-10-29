import type { Appointment, AppointmentStatus, AppointmentType } from "@prisma/client";
import type { TransactionContext } from "@backend/shared/application/ports/transaction.port";

export type AppointmentRecord = Appointment & {
  patient: {
    id: string;
    patientNo: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    contactNumber: string;
    profileId: string | null;
  };
  clinician: { id: string; fullName: string; email: string };
  consultation: { id: string } | null;
};

export type BookedInterval = Pick<
  Appointment,
  "id" | "clinicianId" | "patientId" | "scheduledAt" | "endsAt" | "status"
>;

export interface AppointmentFilter {
  patientId?: string;
  clinicianId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  startDate?: Date;
  endDate?: Date;
}

export interface NewAppointment {
  patientId: string;
  clinicianId: string;
  scheduledAt: Date;
  endsAt: Date;
  type: AppointmentType;
  reason: string;
  meetingUrl?: string | null;
}

export interface AppointmentChanges {
  scheduledAt?: Date;
  endsAt?: Date;
  meetingUrl?: string | null;
  status?: AppointmentStatus;
  cancelReason?: string | null;
}

export interface AppointmentRepositoryPort {
  findById(id: string): Promise<AppointmentRecord | null>;
  /** Non-cancelled bookings of the clinician or the patient that overlap [start, end). */
  findOverlapping(
    clinicianId: string,
    patientId: string,
    start: Date,
    end: Date,
    excludeAppointmentId?: string,
    tx?: TransactionContext
  ): Promise<BookedInterval[]>;
  findByClinicianAndDate(
    clinicianId: string,
    dayStart: Date,
    dayEnd: Date
  ): Promise<Pick<Appointment, "id" | "scheduledAt" | "endsAt" | "status">[]>;
  list(params: AppointmentFilter & { skip: number; take: number }): Promise<AppointmentRecord[]>;
  count(params: AppointmentFilter): Promise<number>;
  create(data: NewAppointment, tx?: TransactionContext): Promise<AppointmentRecord>;
  update(id: string, data: AppointmentChanges, tx?: TransactionContext): Promise<AppointmentRecord>;
}
