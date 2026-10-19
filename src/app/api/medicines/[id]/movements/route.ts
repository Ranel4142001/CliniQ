import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { medicineService } from "@/features/medicines/services/medicine.service";
import { movementActionSchema } from "@/features/medicines/schemas/medicine.schema";
import { ROLES } from "@/shared/constants/roles";
import { z } from "zod";

export const dynamic = "force-dynamic";

const idSchema = z.string().uuid("Invalid medicine ID");

export const POST = withApiHandler(async (req: NextRequest, context) => {
  const user = await requireAuth([ROLES.ADMIN, ROLES.STAFF]);
  const medicineId = idSchema.parse(context?.params?.id);
  const body = await req.json();
  const input = movementActionSchema.parse(body);

  if (input.type === "STOCK_OUT") {
    const movements = await medicineService.stockOut(user, medicineId, {
      quantity: input.quantity,
      reason: input.reason,
      batchId: input.batchId,
    });
    return { data: movements };
  } else {
    const movements = await medicineService.adjustment(user, medicineId, {
      quantity: input.quantity,
      reason: input.reason,
      batchId: input.batchId,
    });
    return { data: movements };
  }
});
