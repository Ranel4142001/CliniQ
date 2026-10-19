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
