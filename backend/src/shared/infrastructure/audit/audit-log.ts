import type { Prisma } from "@prisma/client";
import { dbClient } from "@backend/shared/infrastructure/persistence/prisma-transaction";
import type { AuditEntry, AuditLogPort } from "@backend/shared/application/ports/audit-log.port";
import type { TransactionContext } from "@backend/shared/application/ports/transaction.port";

async function writeEntry(entry: AuditEntry, tx?: TransactionContext): Promise<void> {
  await dbClient(tx).auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      metadata: entry.metadata
        ? (JSON.parse(JSON.stringify(entry.metadata)) as Prisma.InputJsonValue)
        : undefined,
    },
  });
}

/**
 * Prisma-backed audit trail, always attributed to the real actor.
 * - Inside a transaction the entry is atomic with the change: if it cannot be written, the change rolls back.
 * - Outside a transaction it is best-effort: a failure is logged and the operation still succeeds.
 */
export const prismaAuditLog: AuditLogPort = {
  async log(entry, tx) {
    if (tx) return writeEntry(entry, tx);
    try {
      await writeEntry(entry);
    } catch (err: unknown) {
      console.error(
        `[Audit] Failed to record ${entry.action} on ${entry.entity}/${entry.entityId}:`,
        err
      );
    }
  },
};
