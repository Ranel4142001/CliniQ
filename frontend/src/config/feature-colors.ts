import {
  BarChart3,
  Calendar,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Pill,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export interface FeatureStyle {
  icon: LucideIcon;
  /** Soft tinted tile for the feature's icon, light and dark. */
  tile: string;
}

/**
 * One identity colour per feature, used for its sidebar icon and page header,
 * so each area of the app is recognisable at a glance. All are soft tints that
 * sit alongside the primary blue.
 */
export const FEATURE_STYLES: Record<string, FeatureStyle> = {
  [ROUTES.DASHBOARD]: {
    icon: LayoutDashboard,
    tile: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  },
  [ROUTES.PATIENTS]: {
    icon: Users,
    tile: "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300",
  },
  [ROUTES.APPOINTMENTS]: {
    icon: Calendar,
    tile: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  [ROUTES.MESSAGES]: {
    icon: MessageCircle,
    tile: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  },
  [ROUTES.MEDICINES]: {
    icon: Pill,
    tile: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  [ROUTES.PRESCRIPTIONS]: {
    icon: FileText,
    tile: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  },
  [ROUTES.REPORTS]: {
    icon: BarChart3,
    tile: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  [ROUTES.SETTINGS]: {
    icon: Settings,
    tile: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
  },
  [ROUTES.USERS]: {
    icon: ShieldCheck,
    tile: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  },
};

const FALLBACK_TILE = "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300";

export function featureTile(href: string): string {
  return FEATURE_STYLES[href]?.tile ?? FALLBACK_TILE;
}
