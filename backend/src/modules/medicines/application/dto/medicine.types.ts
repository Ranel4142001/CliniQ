import type { Medicine, MedicineBatch, StockMovement, Profile } from "@prisma/client";
import type { StockStatus } from "@backend/modules/medicines/domain/constants/medicine.constants";

export interface MedicineWithStock extends Medicine {
  batches: MedicineBatch[];
  stockStatus: StockStatus;
  totalStock: number;
}

export interface MedicineBatchWithMedicine extends MedicineBatch {
  medicine: Medicine;
}

export interface StockMovementWithRelations extends StockMovement {
  medicine: Pick<Medicine, "id" | "name" | "strength" | "dosageForm">;
  batch: Pick<MedicineBatch, "id" | "batchNo" | "expiryDate">;
  performedBy: Pick<Profile, "id" | "fullName" | "email">;
}

export interface AlertsDTO {
  lowStock: MedicineWithStock[];
  expiringSoon: MedicineBatchWithMedicine[];
  expired: MedicineBatchWithMedicine[];
}
