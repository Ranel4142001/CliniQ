import { vi } from "vitest";
import type { AuditLogPort } from "@backend/shared/application/ports/audit-log.port";
import type {
  RecordNumberGeneratorPort,
  RecordNumberStore,
} from "@backend/shared/application/ports/record-number-generator.port";
import type {
  TransactionContext,
  TransactionRunner,
} from "@backend/shared/application/ports/transaction.port";

/** A transaction handle for tests; repositories under test are fakes and ignore it. */
export const FAKE_TX = {} as TransactionContext;

/** Runs the work immediately with a dummy transaction handle. */
export function fakeTransactions(): TransactionRunner & { run: ReturnType<typeof vi.fn> } {
  return { run: vi.fn(async (work) => work(FAKE_TX)) } as TransactionRunner & {
    run: ReturnType<typeof vi.fn>;
  };
}

export function fakeAuditLog() {
  return { log: vi.fn().mockResolvedValue(undefined) } satisfies AuditLogPort;
}

/** Always issues `value`, after asking the service's lookups about it. */
export function fakeRecordNumbers(value = "PT-261110-347") {
  return {
    next: vi.fn(async (_prefix, store: RecordNumberStore) => {
      await store.countIssued(value.slice(0, value.lastIndexOf("-") + 1));
      await store.isTaken(value);
      return value;
    }),
  } satisfies RecordNumberGeneratorPort;
}
