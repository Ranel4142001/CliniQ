import { Hono } from "hono";
import { requireAuth } from "@backend/modules/auth";
import {
  completeConsultationSchema,
  startConsultationSchema,
  updateConsultationSchema,
} from "@backend/modules/consultations/application/dto/consultation.schema";
import type { ConsultationWithRelations } from "@backend/modules/consultations/application/dto/consultation.types";
import { consultationService } from "@backend/modules/consultations/consultations.module";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { getIdParam } from "@backend/shared/adapters/http/route-params";
import { ROLES } from "@backend/shared/domain/roles";
import { z } from "zod";

const querySchema = z.object({
  appointmentId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const consultationsController = new Hono();

consultationsController.get(
  "/api/consultations",
  withApiHandler<ConsultationWithRelations[] | ConsultationWithRelations | null>(
    async (req: Request) => {
      const user = await requireAuth();
      const url = new URL(req.url);
      const query = querySchema.parse(Object.fromEntries(url.searchParams));

      if (query.appointmentId) {
        const consultation = await consultationService.getConsultationByAppointment(
          { id: user.id, role: user.role },
          query.appointmentId
        );
        return { data: consultation };
      }

      const result = await consultationService.listConsultations(
        { id: user.id, role: user.role },
        {
          page: query.page,
          pageSize: query.pageSize,
          patientId: query.patientId,
        }
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
    }
  )
);

consultationsController.post(
  "/api/consultations",
  withApiHandler(async (req: Request) => {
    const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
    const body = await req.json();
    const input = startConsultationSchema.parse(body);

    const consultation = await consultationService.startConsultation(
      { id: user.id, role: user.role },
      input
    );

    return { data: consultation };
  })
);

consultationsController.get(
  "/api/consultations/:id",
  withApiHandler(async (_req: Request, context) => {
    const user = await requireAuth();
    const id = getIdParam(context);

    const consultation = await consultationService.getConsultation(
      { id: user.id, role: user.role },
      id
    );

    return { data: consultation };
  })
);

consultationsController.patch(
  "/api/consultations/:id",
  withApiHandler(async (req: Request, context) => {
    const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
    const id = getIdParam(context);
    const body = await req.json();
    const input = updateConsultationSchema.parse(body);

    const updated = await consultationService.updateConsultation(
      { id: user.id, role: user.role },
      id,
      input
    );

    return { data: updated };
  })
);

consultationsController.post(
  "/api/consultations/:id/complete",
  withApiHandler(async (req: Request, context) => {
    const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
    const id = getIdParam(context);
    const body = await req.json();
    const input = completeConsultationSchema.parse(body);

    const completed = await consultationService.completeConsultation(
      { id: user.id, role: user.role },
      id,
      input
    );

    return { data: completed };
  })
);
