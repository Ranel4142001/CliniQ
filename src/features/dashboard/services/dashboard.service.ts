import { dashboardRepository } from "../repositories/dashboard.repository";
import { calculateStockStatus } from "@/features/medicines/utils/stock-status";
import { MEDICINE_CONFIG, STOCK_STATUS } from "@/features/medicines/constants/medicine.constants";
import type { UserProfile } from "@/features/auth/types/auth.types";
import type {
  AdminStaffDashboardData,
  PatientDashboardData,
  DashboardResponse,
  DashboardLowStockItem,
} from "../types/dashboard.types";

export class DashboardService {
  async getDashboardData(user: UserProfile): Promise<DashboardResponse> {
    if (user.role === "PATIENT") {
      const data = await this.getPatientDashboard(user);
      return { role: "PATIENT", data };
    }

    const data = await this.getAdminStaffDashboard(user);
    return { role: user.role, data };
  }

  private async getPatientDashboard(user: UserProfile): Promise<PatientDashboardData> {
    const patient = user.patient?.id
      ? { id: user.patient.id }
      : await dashboardRepository.getPatientByProfileId(user.id);

    if (!patient) {
      return {
        stats: { upcomingAppointmentsCount: 0, totalConsultationsCount: 0, activePrescriptionsCount: 0 },
        upcomingAppointments: [],
        recentPrescriptions: [],
      };
    }

    const now = new Date();
    const [upcomingAppts, upcomingCount, consultationsCount, prescriptions, activePrescriptionsCount] =
      await Promise.all([
        dashboardRepository.getPatientUpcomingAppointments(patient.id, now),
        dashboardRepository.countPatientUpcomingAppointments(patient.id, now),
        dashboardRepository.countPatientConsultations(patient.id),
        dashboardRepository.getPatientPrescriptions(patient.id),
        dashboardRepository.countPatientActivePrescriptions(patient.id),
      ]);

    return {
      stats: {
        upcomingAppointmentsCount: upcomingCount,
        totalConsultationsCount: consultationsCount,
        activePrescriptionsCount,
      },
      upcomingAppointments: upcomingAppts,
      recentPrescriptions: prescriptions.map((p) => ({
        id: p.id,
        prescriptionNo: p.prescriptionNo,
        status: p.status,
        issuedAt: p.issuedAt,
        createdAt: p.createdAt,
        itemsCount: p.items.length,
        clinician: p.clinician,
      })),
    };
  }

  private async getAdminStaffDashboard(user: UserProfile): Promise<AdminStaffDashboardData> {
    const clinicianId = user.role === "CLINICIAN" ? user.id : undefined;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const expiringLimit = new Date(todayStart);
    expiringLimit.setDate(expiringLimit.getDate() + MEDICINE_CONFIG.EXPIRING_SOON_DAYS);

    const [todayAppts, todayCount, pendingAppts, pendingCount, totalPatients, medicines, expiringCount] =
      await Promise.all([
        dashboardRepository.getTodayAppointments(todayStart, todayEnd, clinicianId),
        dashboardRepository.countAppointmentsToday(todayStart, todayEnd, clinicianId),
        dashboardRepository.getPendingAppointments(clinicianId),
        dashboardRepository.countPendingAppointments(clinicianId),
        dashboardRepository.countTotalPatients(),
        dashboardRepository.getMedicinesWithBatches(),
        dashboardRepository.countExpiringBatches(todayStart, expiringLimit),
      ]);

    const { lowStockMedicines, lowStockCount } = this.processLowStockMedicines(medicines);

    return {
      stats: {
        todayAppointmentsCount: todayCount,
        pendingAppointmentsCount: pendingCount,
        lowStockCount,
        expiringCount,
        totalPatientsCount: totalPatients,
      },
      todayAppointments: todayAppts,
      pendingAppointments: pendingAppts,
      lowStockMedicines,
    };
  }

  private processLowStockMedicines(
    medicines: Array<{
      id: string;
      name: string;
      strength: string;
      dosageForm: string;
      unit: string;
      reorderLevel: number;
      batches: Array<{ quantity: number; expiryDate: Date | string }>;
    }>
  ) {
    const lowStockMedicines: DashboardLowStockItem[] = [];
    let lowStockCount = 0;

    for (const med of medicines) {
      const stockStatus = calculateStockStatus(med.batches, med.reorderLevel);
      const totalStock = med.batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);

      if (stockStatus === STOCK_STATUS.LOW_STOCK || stockStatus === STOCK_STATUS.OUT_OF_STOCK) {
        lowStockCount++;
        if (lowStockMedicines.length < 5) {
          lowStockMedicines.push({
            id: med.id,
            name: med.name,
            strength: med.strength,
            dosageForm: med.dosageForm,
            totalStock,
            unit: med.unit,
            reorderLevel: med.reorderLevel,
            stockStatus,
          });
        }
      }
    }

    return { lowStockMedicines, lowStockCount };
  }
}

export const dashboardService = new DashboardService();
