import { vi } from "vitest";
import type { AuditLogPort } from "@backend/shared/application/ports/audit-log.port";
import type { SequenceGeneratorPort } from "@backend/shared/application/ports/sequence-generator.port";
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

export function fakeSequences(value = "SEQ-2026-0001") {
  return { next: vi.fn().mockResolvedValue(value) } satisfies SequenceGeneratorPort;
}
