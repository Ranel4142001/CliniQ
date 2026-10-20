import { reportsRepository } from "../repositories/reports.repository";
import { calculateStockStatus } from "@/features/medicines/utils/stock-status";
import { ValidationError } from "@/shared/lib/errors";
import type {
  ReportKey,
  ReportFilterParams,
  AppointmentReportRow,
  ConsultationReportRow,
  InventoryReportRow,
  MovementReportRow,
  PrescriptionReportRow,
} from "../types/reports.types";

export class ReportsService {
  async generateReport(
    reportKey: ReportKey,
    filters: ReportFilterParams
  ): Promise<Record<string, unknown>[]> {
    const { fromDate, toDate } = this.parseDateRange(filters.from, filters.to);

    switch (reportKey) {
      case "appointments":
        return this.getAppointmentsReport(fromDate, toDate, filters.status);
      case "consultations":
        return this.getConsultationsReport(fromDate, toDate);
      case "inventory":
        return this.getInventoryReport();
      case "movements":
        return this.getMovementsReport(fromDate, toDate);
      case "prescriptions":
        return this.getPrescriptionsReport(fromDate, toDate, filters.status);
      default:
        throw new ValidationError(`Unknown report key: ${reportKey}`);
    }
  }

  private parseDateRange(from?: string, to?: string) {
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from) {
      fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
    }
    if (to) {
      toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
    }

    return { fromDate, toDate };
  }

  private async getAppointmentsReport(
    from?: Date,
    to?: Date,
    status?: string
  ): Promise<AppointmentReportRow[]> {
    const list = await reportsRepository.getAppointments(from, to, status);
    return list.map((a) => ({
      id: a.id,
      scheduledAt: new Date(a.scheduledAt).toLocaleString(),
      patientName: `${a.patient?.firstName ?? ""} ${a.patient?.lastName ?? ""}`.trim(),
      patientNo: a.patient?.patientNo ?? "—",
      clinicianName: a.clinician?.fullName || "Unassigned",
      type: a.type,
      status: a.status,
      reason: a.reason,
    }));
  }

  private async getConsultationsReport(from?: Date, to?: Date): Promise<ConsultationReportRow[]> {
    const list = await reportsRepository.getConsultations(from, to);
    return list.map((c) => ({
      id: c.id,
      consultationDate: c.startedAt ? new Date(c.startedAt).toLocaleDateString() : "—",
      patientName: `${c.patient?.firstName ?? ""} ${c.patient?.lastName ?? ""}`.trim(),
      patientNo: c.patient?.patientNo ?? "—",
      clinicianName: c.clinician?.fullName || "Unassigned",
      chiefComplaint: c.chiefComplaint,
      diagnosis: c.diagnosis || "No diagnosis recorded",
      completedAt: c.endedAt ? new Date(c.endedAt).toLocaleTimeString() : "—",
    }));
  }

  private async getInventoryReport(): Promise<InventoryReportRow[]> {
    const list = await reportsRepository.getInventory();
    return list.map((m) => {
      const stockStatus = calculateStockStatus(m.batches, m.reorderLevel);
      const totalStock = m.batches.reduce((sum, b) => sum + Math.max(0, b.quantity), 0);
      return {
        id: m.id,
        name: m.name,
        genericName: m.genericName || "—",
        dosageForm: m.dosageForm,
        strength: m.strength,
        totalStock,
        unit: m.unit,
        reorderLevel: m.reorderLevel,
        stockStatus,
      };
    });
  }

  private async getMovementsReport(from?: Date, to?: Date): Promise<MovementReportRow[]> {
    const list = await reportsRepository.getMovements(from, to);
    return list.map((m) => ({
      id: m.id,
      date: new Date(m.createdAt).toLocaleString(),
      medicineName: `${m.medicine.name} ${m.medicine.strength}`,
      batchNo: m.batch.batchNo,
      type: m.type,
      quantity: m.quantity,
      reason: m.reason || "—",
      performedBy: m.performedBy?.fullName || "Staff",
    }));
  }

  private async getPrescriptionsReport(
    from?: Date,
    to?: Date,
    status?: string
  ): Promise<PrescriptionReportRow[]> {
    const list = await reportsRepository.getPrescriptions(from, to, status);
    return list.map((p) => ({
      id: p.id,
      prescriptionNo: p.prescriptionNo || "DRAFT",
      issuedAt: p.issuedAt ? new Date(p.issuedAt).toLocaleDateString() : "—",
      patientName: `${p.patient?.firstName ?? ""} ${p.patient?.lastName ?? ""}`.trim(),
      patientNo: p.patient?.patientNo ?? "—",
      clinicianName: p.clinician?.fullName || "Unassigned",
      status: p.status,
      itemsCount: p.items.length,
      dispensedAt: p.dispensedAt ? new Date(p.dispensedAt).toLocaleDateString() : "—",
    }));
  }
}

export const reportsService = new ReportsService();
