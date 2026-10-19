// Public API for medicines feature (Spec 10.5)

import { medicineService } from "./services/medicine.service";

/**
 * Public function exported for Phase 7 Digital Prescriptions.
 * Dispenses medicines using FEFO (First-Expired, First-Out).
 */
export const dispenseMedicine = medicineService.dispenseMedicine.bind(medicineService);

export { medicineService };

// Constants
export * from "./constants/medicine.constants";

// Types
export * from "./types/medicine.types";

// Schemas
export * from "./schemas/medicine.schema";

// Utils
export { calculateStockStatus } from "./utils/stock-status";
export { calculateFefoDeductions } from "./utils/fefo-deduction";

// Hooks
export * from "./hooks/use-medicines";

// Components
export { MedicineTable } from "./components/MedicineTable";
export { MedicineForm } from "./components/MedicineForm";
export { MedicineFormFields } from "./components/MedicineFormFields";
export { BatchForm } from "./components/BatchForm";
export { StockMovementDialog } from "./components/StockMovementDialog";
export { MovementHistoryTable } from "./components/MovementHistoryTable";
export { LowStockPanel } from "./components/LowStockPanel";
export { ExpiringPanel } from "./components/ExpiringPanel";
export { MedicineSelect } from "./components/MedicineSelect";
export { MedicineStats } from "./components/MedicineStats";
