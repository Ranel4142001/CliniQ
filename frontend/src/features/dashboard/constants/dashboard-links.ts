import { ROUTES } from "@/constants/routes";

/** Where each dashboard number card leads; the target pages read these query params. */
export const DASHBOARD_LINKS = {
  TODAY: `${ROUTES.APPOINTMENTS}?view=calendar`,
  PENDING: `${ROUTES.APPOINTMENTS}?status=PENDING`,
  LOW_STOCK: `${ROUTES.MEDICINES}#stock-alerts`,
  EXPIRING: `${ROUTES.MEDICINES}#stock-alerts`,
  PATIENTS: ROUTES.PATIENTS,
} as const;
