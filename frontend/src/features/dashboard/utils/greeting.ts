/** "Good morning" / "Good afternoon" / "Good evening" for the viewer's local hour. */
export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Short form of a profile name for greetings:
 * "Dr. Alberto Cruz, MD" → "Dr. Cruz", "Ana Santos" → "Ana".
 */
export function greetingName(fullName?: string | null): string {
  const name = (fullName ?? "").split(",")[0].trim();
  if (!name) return "there";
  const words = name.split(/\s+/);
  if (/^dr\.?$/i.test(words[0]) && words.length > 1) return `Dr. ${words[words.length - 1]}`;
  return words[0];
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** One-line summary of what needs attention today, built only from real counts. */
export function clinicSummary(stats: {
  todayAppointmentsCount: number;
  pendingAppointmentsCount: number;
  lowStockCount: number;
}): string {
  const parts = [
    stats.todayAppointmentsCount === 0
      ? "Your schedule is clear today."
      : `${plural(stats.todayAppointmentsCount, "appointment")} on today's schedule.`,
  ];
  if (stats.pendingAppointmentsCount > 0) {
    parts.push(`${plural(stats.pendingAppointmentsCount, "request")} awaiting confirmation.`);
  }
  if (stats.lowStockCount > 0)
    parts.push(`${plural(stats.lowStockCount, "medicine")} running low.`);
  return parts.join(" ");
}
