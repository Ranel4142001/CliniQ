import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import type {
  TransactionContext,
  TransactionRunner,
} from "@backend/shared/application/ports/transaction.port";

export type DbClient = Prisma.TransactionClient | typeof prisma;

/** Resolves the Prisma client to use: the open transaction if there is one, else the global client. */
export function dbClient(tx?: TransactionContext): DbClient {
  return tx ? (tx as unknown as Prisma.TransactionClient) : prisma;
}

export const prismaTransactionRunner: TransactionRunner = {
  run: (work) => prisma.$transaction((tx) => work(tx as unknown as TransactionContext)),
};
