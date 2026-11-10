import React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";
import { TONE_TILES } from "@/lib/tones";

/** Soft tints that rotate by name, so neighbouring rows are easy to tell apart. */
const AVATAR_TINTS = [
  TONE_TILES.blue,
  TONE_TILES.teal,
  TONE_TILES.amber,
  TONE_TILES.red,
  TONE_TILES.violet,
] as const;

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
      {getInitials(name)}
    </span>
  );
}
