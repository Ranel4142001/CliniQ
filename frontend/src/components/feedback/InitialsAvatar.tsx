import React from "react";
import { cn } from "@/lib/utils";

/** Soft tints that rotate by name, so neighbouring rows are easy to tell apart. */
const AVATAR_TINTS = [
  "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
  "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
  "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
] as const;

export function initialsOf(name: string): string {
  const words = name
    .split(",")[0]
    .trim()
    .split(/\s+/)
    .filter((w) => !/^dr\.?$/i.test(w));
  if (words.length === 0) return "?";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

function tintFor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

/** Round avatar showing a person's initials in a colour derived from their name. */
export function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        tintFor(name),
        className
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
