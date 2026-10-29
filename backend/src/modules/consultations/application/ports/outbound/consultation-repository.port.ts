import type {
  ConsultationWithRelations,
  VitalsData,
} from "@backend/modules/consultations/application/dto/consultation.types";

export interface NewConsultation {
  appointmentId: string;
  patientId: string;
  clinicianId: string;
  chiefComplaint: string;
  vitals?: VitalsData | null;
  startedAt?: Date;
}

export interface ConsultationChanges {
  chiefComplaint?: string;
  vitals?: VitalsData | null;
  findings?: string | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
}

export interface ConsultationFilter {
  patientId?: string;
  clinicianId?: string;
}

export interface ConsultationRepositoryPort {
  findById(id: string): Promise<ConsultationWithRelations | null>;
  findByAppointmentId(appointmentId: string): Promise<ConsultationWithRelations | null>;
  create(data: NewConsultation): Promise<ConsultationWithRelations>;
  update(id: string, data: ConsultationChanges): Promise<ConsultationWithRelations>;
  /** Closes the consultation and marks its appointment COMPLETED atomically. */
  completeInTransaction(
    id: string,
    appointmentId: string,
    data: { diagnosis: string; treatmentPlan?: string | null; endedAt: Date }
  ): Promise<ConsultationWithRelations>;
  list(
    params: ConsultationFilter & { skip?: number; take?: number }
  ): Promise<ConsultationWithRelations[]>;
  count(params: ConsultationFilter): Promise<number>;
}
