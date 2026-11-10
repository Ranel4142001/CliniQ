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
import { TONE_TILES } from "@/lib/tones";

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
    tile: TONE_TILES.blue,
  },
  [ROUTES.PATIENTS]: {
    icon: Users,
    tile: TONE_TILES.teal,
  },
  [ROUTES.APPOINTMENTS]: {
    icon: Calendar,
    tile: TONE_TILES.violet,
  },
  [ROUTES.MESSAGES]: {
    icon: MessageCircle,
    tile: TONE_TILES.sky,
  },
  [ROUTES.MEDICINES]: {
    icon: Pill,
    tile: TONE_TILES.amber,
  },
  [ROUTES.PRESCRIPTIONS]: {
    icon: FileText,
    tile: TONE_TILES.red,
  },
  [ROUTES.REPORTS]: {
    icon: BarChart3,
    tile: TONE_TILES.indigo,
  },
  [ROUTES.SETTINGS]: {
    icon: Settings,
    tile: TONE_TILES.zinc,
  },
  [ROUTES.USERS]: {
    icon: ShieldCheck,
    tile: TONE_TILES.slate,
  },
};

const FALLBACK_TILE = TONE_TILES.blue;

export function featureTile(href: string): string {
  return FEATURE_STYLES[href]?.tile ?? FALLBACK_TILE;
}
