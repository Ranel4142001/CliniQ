// Composition for the dashboard module: binds its ports to concrete adapters.
import { DashboardService } from "./application/services/dashboard.service";
import { dashboardRepository } from "./infrastructure/persistence/repositories/dashboard.repository";

export const dashboardService = new DashboardService({ dashboardRepository });
