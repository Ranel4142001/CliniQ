import type { AppointmentStatus, AppointmentType } from "@prisma/client";

export interface AppointmentDTO {
  id: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  patientContact: string;
  clinicianId: string;
  clinicianName: string;
  scheduledAt: string; // ISO UTC string
  endsAt: string; // ISO UTC string
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  meetingUrl: string | null;
  cancelReason: string | null;
  hasConsultation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentListItem {
  id: string;
  patientId: string;
  patientNo: string;
  patientName: string;
  clinicianId: string;
  clinicianName: string;
  scheduledAt: string;
  endsAt: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  meetingUrl: string | null;
  hasConsultation: boolean;
}

export interface RepositoryAppointmentRow {
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
