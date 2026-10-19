import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "VIEW"
  | "CREATE"
  | "UPDATE"
  | "ARCHIVE"
  | "ISSUE"
  | "DISPENSE"
  | "VOID";

export interface LogAuditInput {
  actorId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}

export const auditRepository = {
  async log(data: LogAuditInput, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        metadata: data.metadata,
      },
    });
  },
};
