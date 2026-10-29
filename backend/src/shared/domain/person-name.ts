/** Joins name parts, skipping blanks ("Juan", null, "Cruz" → "Juan Cruz"). */
export function formatFullName(
  firstName?: string | null,
  middleName?: string | null,
  lastName?: string | null
): string {
  const parts = [firstName, middleName, lastName].filter(
    (name): name is string => typeof name === "string" && name.trim().length > 0
  );
  return parts.length > 0 ? parts.join(" ") : "-";
}
