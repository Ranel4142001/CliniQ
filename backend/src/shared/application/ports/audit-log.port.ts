import type { TransactionContext } from "./transaction.port";

export const AUDIT_ACTIONS = [
  "VIEW",
  "CREATE",
  "UPDATE",
  "ARCHIVE",
  "VOID",
  "START_CONSULTATION",
  "COMPLETE_CONSULTATION",
  "CREATE_MEDICINE",
  "UPDATE_MEDICINE",
  "CREATE_PRESCRIPTION",
  "UPDATE_PRESCRIPTION",
  "ISSUE_PRESCRIPTION",
  "DISPENSE_PRESCRIPTION",
  "VOID_PRESCRIPTION",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditEntry {
  actorId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  /** Any JSON-serialisable details (dates are stored as ISO strings). */
  metadata?: Record<string, unknown>;
}

/** Append-only audit trail. Failures are reported but never break the business operation. */
export interface AuditLogPort {
  log(entry: AuditEntry, tx?: TransactionContext): Promise<void>;
}
