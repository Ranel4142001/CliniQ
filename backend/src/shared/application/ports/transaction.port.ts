declare const transactionBrand: unique symbol;

/**
 * Opaque handle for an open transaction. Application code only passes it
 * through to repositories; only infrastructure knows what is inside.
 */
export type TransactionContext = { readonly [transactionBrand]: true };

/** Runs work atomically: everything done with `tx` commits or rolls back together. */
export interface TransactionRunner {
  run<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}
