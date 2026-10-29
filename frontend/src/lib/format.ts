// Name formatting is a domain rule owned by the backend; re-exported for UI use.
export { formatFullName } from "@backend/contracts";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

export function formatQuantity(qty: number, unit?: string | null): string {
  return unit ? `${qty} ${unit}` : `${qty}`;
}

/** Two-letter initials for avatars ("Maria Elena Reyes" → "MR"). */
export function getInitials(name?: string | null): string {
  if (!name) return "CQ";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
