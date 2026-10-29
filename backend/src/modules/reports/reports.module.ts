// Composition for the reports module: binds its ports to concrete adapters.
import { ReportsService } from "./application/services/reports.service";
import { reportsRepository } from "./infrastructure/persistence/repositories/reports.repository";

export const reportsService = new ReportsService({ reportsRepository });
