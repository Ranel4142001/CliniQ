// Public API for dashboard feature (Spec 10.7)

export { dashboardService } from "./services/dashboard.service";

// Types
export * from "./types/dashboard.types";

// Hooks
export * from "./hooks/use-dashboard";

// Components
export { AdminStaffDashboard } from "./components/AdminStaffDashboard";
export { PatientDashboard } from "./components/PatientDashboard";
