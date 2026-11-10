/**
 * The app's soft colour tiles (tinted background + matching icon/text colour, light and dark).
 * Every icon tile, avatar tint and feature colour draws from this one palette.
 */
export const TONE_TILES = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  teal: "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  red: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
} as const;

export type Tone = keyof typeof TONE_TILES;
