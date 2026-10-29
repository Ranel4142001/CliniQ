import type { SequenceGeneratorPort } from "@backend/shared/application/ports/sequence-generator.port";
import { dbClient } from "./prisma-transaction";

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

export interface CounterClient {
  counter: {
    upsert: (args: {
      where: { key: string };
      create: { key: string; value: number };
      update: { value: { increment: number } };
    }) => Promise<{ key: string; value: number }>;
  };
}

export async function nextSequenceNumber(
  client: CounterClient,
  key: string,
  padLength = 4
): Promise<string> {
  const counter = await client.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });

  const [prefix, yearStr] = key.split("-");
  const year = parseInt(yearStr, 10);
  return formatSequenceNumber(prefix, year, counter.value, padLength);
}

/** Counter-table implementation of the sequence generator port. */
export const prismaSequenceGenerator: SequenceGeneratorPort = {
  next: (key, tx) => nextSequenceNumber(dbClient(tx), key),
};
