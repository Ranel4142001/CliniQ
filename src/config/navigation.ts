import { Role, ROLES } from "@/shared/constants/roles";
import { ROUTES } from "@/shared/constants/routes";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Pill,
  FileText,
  BarChart3,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const NAVIGATION_ITEMS: Record<Role, NavItem[]> = {
  [ROLES.ADMIN]: [
    { title: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { title: "Patients", href: ROUTES.PATIENTS, icon: Users },
    { title: "Appointments", href: ROUTES.APPOINTMENTS, icon: Calendar },
    { title: "Medicines", href: ROUTES.MEDICINES, icon: Pill },
    { title: "Prescriptions", href: ROUTES.PRESCRIPTIONS, icon: FileText },
    { title: "Reports", href: ROUTES.REPORTS, icon: BarChart3 },
    { title: "User Management", href: ROUTES.USERS, icon: ShieldCheck },
  ],
  [ROLES.CLINICIAN]: [
    { title: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { title: "Patients", href: ROUTES.PATIENTS, icon: Users },
    { title: "Appointments", href: ROUTES.APPOINTMENTS, icon: Calendar },
    { title: "Prescriptions", href: ROUTES.PRESCRIPTIONS, icon: FileText },
  ],
  [ROLES.STAFF]: [
    { title: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { title: "Patients", href: ROUTES.PATIENTS, icon: Users },
    { title: "Appointments", href: ROUTES.APPOINTMENTS, icon: Calendar },
    { title: "Medicines", href: ROUTES.MEDICINES, icon: Pill },
    { title: "Prescriptions", href: ROUTES.PRESCRIPTIONS, icon: FileText },
    { title: "Reports", href: ROUTES.REPORTS, icon: BarChart3 },
  ],
  [ROLES.PATIENT]: [
    { title: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { title: "My Appointments", href: ROUTES.APPOINTMENTS, icon: Calendar },
    { title: "My Prescriptions", href: ROUTES.PRESCRIPTIONS, icon: FileText },
  ],
};

export function getNavigationForRole(role?: Role | null): NavItem[] {
  if (!role || !NAVIGATION_ITEMS[role]) {
    return NAVIGATION_ITEMS[ROLES.PATIENT];
  }
  return NAVIGATION_ITEMS[role];
}
