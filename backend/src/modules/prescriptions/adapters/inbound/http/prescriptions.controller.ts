import { Hono } from "hono";
import { requireAuth } from "@backend/modules/auth";
import {
  createPrescriptionSchema,
  listPrescriptionsSchema,
  updatePrescriptionSchema,
  voidPrescriptionSchema,
} from "@backend/modules/prescriptions/application/dto/prescription.schema";
import { prescriptionService } from "@backend/modules/prescriptions/prescriptions.module";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { getIdParam } from "@backend/shared/adapters/http/route-params";
import { ROLES } from "@backend/shared/domain/roles";

export const prescriptionsController = new Hono();

prescriptionsController.get(
  "/api/prescriptions",
  withApiHandler(async (req: Request) => {
    const user = await requireAuth();
    const url = new URL(req.url);
    const query = listPrescriptionsSchema.parse(Object.fromEntries(url.searchParams));

    const result = await prescriptionService.listPrescriptions(
      { id: user.id, role: user.role, patientId: user.id },
      query
    );

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

prescriptionsController.post(
  "/api/prescriptions",
  withApiHandler(async (req: Request) => {
    const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
    const body = await req.json();
    const input = createPrescriptionSchema.parse(body);

    const prescription = await prescriptionService.createPrescription(
      { id: user.id, role: user.role },
      input
    );

    return { data: prescription };
  })
);

prescriptionsController.get(
  "/api/prescriptions/stats",
  withApiHandler(
    async () => {
      const user = await requireAuth();
      const stats = await prescriptionService.getStats({
        id: user.id,
        role: user.role,
        patientId: user.id,
      });

      return { data: stats };
    },
    { cacheSeconds: 30 }
  )
);

prescriptionsController.get(
  "/api/prescriptions/:id",
  withApiHandler(async (_req: Request, context) => {
    const user = await requireAuth();
    const id = getIdParam(context);

    const prescription = await prescriptionService.getPrescription(
      { id: user.id, role: user.role, patientId: user.id },
      id
    );

    return { data: prescription };
  })
);

prescriptionsController.patch(
  "/api/prescriptions/:id",
  withApiHandler(async (req: Request, context) => {
    const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
    const id = getIdParam(context);
    const body = await req.json();
    const input = updatePrescriptionSchema.parse(body);

    const updated = await prescriptionService.updatePrescription(
      { id: user.id, role: user.role },
      id,
      input
    );

    return { data: updated };
  })
);

prescriptionsController.post(
  "/api/prescriptions/:id/dispense",
  withApiHandler(async (_req: Request, context) => {
    const user = await requireAuth([ROLES.STAFF, ROLES.ADMIN]);
    const id = getIdParam(context);

    const dispensed = await prescriptionService.dispensePrescription(
      { id: user.id, role: user.role },
      id
    );

    return { data: dispensed };
  })
);

prescriptionsController.post(
  "/api/prescriptions/:id/issue",
  withApiHandler(async (_req: Request, context) => {
    const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
    const id = getIdParam(context);

    const issued = await prescriptionService.issuePrescription(
      { id: user.id, role: user.role },
      id
    );

    return { data: issued };
  })
);

prescriptionsController.post(
  "/api/prescriptions/:id/void",
  withApiHandler(async (req: Request, context) => {
    const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
    const id = getIdParam(context);
    const body = await req.json();
    const input = voidPrescriptionSchema.parse(body);

    const voided = await prescriptionService.voidPrescription(
      { id: user.id, role: user.role },
      id,
      input
    );

    return { data: voided };
  })
);
