import type { Role } from "@prisma/client";
import type { StockStatus } from "@backend/modules/medicines";

export interface DashboardAppointmentItem {
  id: string;
  scheduledAt: Date | string;
  type: "IN_PERSON" | "ONLINE";
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  reason: string;
  meetingUrl?: string | null;
  patient?: {
    id: string;
    patientNo: string;
    firstName: string;
    lastName: string;
  } | null;
  clinician?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface DashboardPrescriptionItem {
  id: string;
  prescriptionNo?: string | null;
  status: "DRAFT" | "ISSUED" | "DISPENSED" | "VOIDED";
  issuedAt?: Date | string | null;
  createdAt: Date | string;
  itemsCount: number;
  clinician?: {
    fullName: string;
  } | null;
}

export interface DashboardLowStockItem {
  id: string;
  name: string;
  strength: string;
  dosageForm: string;
  totalStock: number;
  unit: string;
  reorderLevel: number;
  stockStatus: StockStatus;
}

export interface AdminStaffDashboardData {
  stats: {
    todayAppointmentsCount: number;
    pendingAppointmentsCount: number;
    lowStockCount: number;
    expiringCount: number;
    totalPatientsCount: number;
  };
  todayAppointments: DashboardAppointmentItem[];
  pendingAppointments: DashboardAppointmentItem[];
  lowStockMedicines: DashboardLowStockItem[];
}

export interface PatientDashboardData {
  stats: {
    upcomingAppointmentsCount: number;
    totalConsultationsCount: number;
    activePrescriptionsCount: number;
  };
  upcomingAppointments: DashboardAppointmentItem[];
  recentPrescriptions: DashboardPrescriptionItem[];
}

export interface DashboardResponse {
  role: Role;
  data: AdminStaffDashboardData | PatientDashboardData;
}
