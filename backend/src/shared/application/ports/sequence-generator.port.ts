import type { TransactionContext } from "./transaction.port";

/** Issues gap-free, human-readable numbers such as `PT-2026-0001` for a counter key like `PT-2026`. */
export interface SequenceGeneratorPort {
  next(key: string, tx?: TransactionContext): Promise<string>;
}
