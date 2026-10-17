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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);
}

export function formatQuantity(qty: number, unit?: string | null): string {
  return unit ? `${qty} ${unit}` : `${qty}`;
}
