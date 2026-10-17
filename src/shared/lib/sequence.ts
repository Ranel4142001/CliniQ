export function formatSequenceNumber(
  prefix: string,
  year: number,
  sequence: number,
  padLength = 4
): string {
  const padded = String(sequence).padStart(padLength, "0");
  return `${prefix}-${year}-${padded}`;
}

export function parseSequenceNumber(
  sequenceNumber: string
): { prefix: string; year: number; sequence: number } | null {
  const parts = sequenceNumber.split("-");
  if (parts.length !== 3) return null;

  const prefix = parts[0];
  const year = parseInt(parts[1], 10);
  const sequence = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(sequence)) return null;

  return { prefix, year, sequence };
}
