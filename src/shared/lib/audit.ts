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
    let validActorId = data.actorId;

    try {
      // Ensure actor exists in Profile table before attempting auditLog insert
      const actorExists = await client.profile.findUnique({
        where: { id: validActorId },
        select: { id: true },
      });

      if (!actorExists) {
        const fallbackProfile = await client.profile.findFirst({
          select: { id: true },
        });
        if (fallbackProfile) {
          validActorId = fallbackProfile.id;
        } else {
          return null;
        }
      }

      return await client.auditLog.create({
        data: {
          actorId: validActorId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          metadata: data.metadata,
        },
      });
    } catch (err: unknown) {
      console.warn("Audit logging skipped:", (err as Error)?.message);
      return null;
    }
  },
};
