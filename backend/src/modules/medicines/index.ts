// Public API of the medicines module. Other modules import only from here.
import { medicineService } from "./medicines.module";

export { medicinesController } from "./adapters/inbound/http/medicines.controller";
export { medicineService };
export { calculateStockStatus } from "./domain/services/stock-status";
export {
  MEDICINE_CONFIG,
  STOCK_STATUS,
  type StockStatus,
} from "./domain/constants/medicine.constants";

/** Dispenses medicines using FEFO (First-Expired, First-Out). Used by prescriptions. */
export const dispenseMedicine = medicineService.dispenseMedicine.bind(medicineService);
