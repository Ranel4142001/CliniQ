import { describe, it, expect, vi, beforeEach } from "vitest";
import { DashboardService } from "@/features/dashboard/services/dashboard.service";
import { dashboardRepository } from "@/features/dashboard/repositories/dashboard.repository";
import type { UserProfile } from "@/features/auth/types/auth.types";

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    appointment: { findMany: vi.fn(), count: vi.fn() },
    patient: { count: vi.fn(), findFirst: vi.fn() },
    medicine: { findMany: vi.fn() },
    medicineBatch: { count: vi.fn() },
    prescription: { findMany: vi.fn(), count: vi.fn() },
    consultation: { count: vi.fn() },
  },
}));

describe("DashboardService", () => {
  let service: DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardService();
  });

  const mockAdminUser: UserProfile = {
    id: "admin-1",
    authId: "admin-auth",
    email: "admin@cliniq.local",
    fullName: "Admin User",
    role: "ADMIN",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPatientUser: UserProfile = {
    id: "patient-profile-1",
    authId: "patient-auth",
    email: "patient@cliniq.local",
    fullName: "Juan Dela Cruz",
    role: "PATIENT",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: "pt-1",
      patientNo: "PT-2026-0001",
    },
  };

  it("returns patient-specific dashboard data for PATIENT role", async () => {
    vi.spyOn(dashboardRepository, "getPatientUpcomingAppointments").mockResolvedValue([
      {
        id: "appt-1",
        scheduledAt: new Date("2026-10-21T10:00:00Z"),
        type: "ONLINE",
        status: "CONFIRMED",
        reason: "Follow-up",
        meetingUrl: "https://meet.google.com/abc-defg-hij",
        clinician: { id: "doc-1", fullName: "Dr. Santos", email: "doc@cliniq.local" },
      } as any,
    ]);
    vi.spyOn(dashboardRepository, "countPatientUpcomingAppointments").mockResolvedValue(1);
    vi.spyOn(dashboardRepository, "countPatientConsultations").mockResolvedValue(3);
    vi.spyOn(dashboardRepository, "getPatientPrescriptions").mockResolvedValue([
      {
        id: "rx-1",
        prescriptionNo: "RX-2026-0001",
        status: "ISSUED",
        issuedAt: new Date(),
        createdAt: new Date(),
        items: [{ id: "item-1" }],
        clinician: { fullName: "Dr. Santos" },
      } as any,
    ]);
    vi.spyOn(dashboardRepository, "countPatientActivePrescriptions").mockResolvedValue(1);

    const result = await service.getDashboardData(mockPatientUser);

    expect(result.role).toBe("PATIENT");
    const data = result.data as any;
    expect(data.stats.upcomingAppointmentsCount).toBe(1);
    expect(data.stats.totalConsultationsCount).toBe(3);
    expect(data.stats.activePrescriptionsCount).toBe(1);
    expect(data.upcomingAppointments).toHaveLength(1);
    expect(data.recentPrescriptions).toHaveLength(1);
  });

  it("returns admin/staff dashboard metrics for ADMIN role", async () => {
    vi.spyOn(dashboardRepository, "getTodayAppointments").mockResolvedValue([]);
    vi.spyOn(dashboardRepository, "countAppointmentsToday").mockResolvedValue(5);
    vi.spyOn(dashboardRepository, "getPendingAppointments").mockResolvedValue([]);
    vi.spyOn(dashboardRepository, "countPendingAppointments").mockResolvedValue(2);
    vi.spyOn(dashboardRepository, "countTotalPatients").mockResolvedValue(45);
    vi.spyOn(dashboardRepository, "countExpiringBatches").mockResolvedValue(3);
    vi.spyOn(dashboardRepository, "getMedicinesWithBatches").mockResolvedValue([
      {
        id: "med-1",
        name: "Amoxicillin",
        strength: "500mg",
        dosageForm: "Capsule",
        unit: "capsule",
        reorderLevel: 20,
        batches: [{ quantity: 5, expiryDate: new Date("2026-12-01") }],
      } as any,
    ]);

    const result = await service.getDashboardData(mockAdminUser);

    expect(result.role).toBe("ADMIN");
    const data = result.data as any;
    expect(data.stats.todayAppointmentsCount).toBe(5);
    expect(data.stats.pendingAppointmentsCount).toBe(2);
    expect(data.stats.totalPatientsCount).toBe(45);
    expect(data.stats.lowStockCount).toBe(1);
    expect(data.stats.expiringCount).toBe(3);
    expect(data.lowStockMedicines).toHaveLength(1);
  });

  it("filters clinician's today appointments when role is CLINICIAN", async () => {
    const mockClinicianUser: UserProfile = {
      ...mockAdminUser,
      id: "doc-1",
      role: "CLINICIAN",
    };

    const getTodaySpy = vi.spyOn(dashboardRepository, "getTodayAppointments").mockResolvedValue([]);
    vi.spyOn(dashboardRepository, "countAppointmentsToday").mockResolvedValue(2);
    vi.spyOn(dashboardRepository, "getPendingAppointments").mockResolvedValue([]);
    vi.spyOn(dashboardRepository, "countPendingAppointments").mockResolvedValue(0);
    vi.spyOn(dashboardRepository, "countTotalPatients").mockResolvedValue(45);
    vi.spyOn(dashboardRepository, "getMedicinesWithBatches").mockResolvedValue([]);
    vi.spyOn(dashboardRepository, "countExpiringBatches").mockResolvedValue(0);

    const result = await service.getDashboardData(mockClinicianUser);

    expect(result.role).toBe("CLINICIAN");
    expect(getTodaySpy).toHaveBeenCalledWith(expect.any(Date), expect.any(Date), "doc-1");
  });
});
