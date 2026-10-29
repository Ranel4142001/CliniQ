import { Hono } from "hono";
import { requireAuth } from "@backend/modules/auth";
import {
  createMedicineSchema,
  listMedicinesSchema,
  listMovementsSchema,
  movementActionSchema,
  stockInSchema,
  updateMedicineSchema,
} from "@backend/modules/medicines/application/dto/medicine.schema";
import { medicineService } from "@backend/modules/medicines/medicines.module";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { getIdParam } from "@backend/shared/adapters/http/route-params";
import { ROLES } from "@backend/shared/domain/roles";

export const medicinesController = new Hono();

medicinesController.get(
  "/api/medicines",
  withApiHandler(async (req: Request) => {
    await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);
    const url = new URL(req.url);
    const query = listMedicinesSchema.parse(Object.fromEntries(url.searchParams));

    const result = await medicineService.listMedicines(query);

    return {
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    };
  })
);

medicinesController.post(
  "/api/medicines",
  withApiHandler(async (req: Request) => {
    const user = await requireAuth([ROLES.ADMIN, ROLES.STAFF]);
    const body = await req.json();
    const input = createMedicineSchema.parse(body);

    const medicine = await medicineService.createMedicine(user, input);

    return { data: medicine };
  })
);

medicinesController.get(
  "/api/medicines/alerts",
  withApiHandler(
    async () => {
      await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);

      const alerts = await medicineService.getAlerts();

      return { data: alerts };
    },
    { cacheSeconds: 30 }
  )
);

medicinesController.get(
  "/api/medicines/movements",
  withApiHandler(async (req: Request) => {
    await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);
    const url = new URL(req.url);
    const query = listMovementsSchema.parse(Object.fromEntries(url.searchParams));

    const result = await medicineService.listMovements(query);

    return {
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    };
  })
);

medicinesController.get(
  "/api/medicines/:id",
  withApiHandler(async (_req: Request, context) => {
    await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);
    const id = getIdParam(context);

    const medicine = await medicineService.getMedicine(id);

    return { data: medicine };
  })
);

medicinesController.patch(
  "/api/medicines/:id",
  withApiHandler(async (req: Request, context) => {
    const user = await requireAuth([ROLES.ADMIN, ROLES.STAFF]);
    const id = getIdParam(context);
    const body = await req.json();
    const input = updateMedicineSchema.parse(body);

    const updated = await medicineService.updateMedicine(user, id, input);

    return { data: updated };
  })
);

medicinesController.post(
  "/api/medicines/:id/batches",
  withApiHandler(async (req: Request, context) => {
    const user = await requireAuth([ROLES.ADMIN, ROLES.STAFF]);
    const medicineId = getIdParam(context);
    const body = await req.json();
    const input = stockInSchema.parse(body);

    const movement = await medicineService.stockIn(user, medicineId, input);

    return { data: movement };
  })
);

medicinesController.post(
  "/api/medicines/:id/movements",
  withApiHandler(async (req: Request, context) => {
    const user = await requireAuth([ROLES.ADMIN, ROLES.STAFF]);
    const medicineId = getIdParam(context);
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
  })
);
