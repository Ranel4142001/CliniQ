import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { consultationService } from "@/features/consultations/services/consultation.service";
import { startConsultationSchema } from "@/features/consultations/schemas/consultation.schema";
import type { ConsultationWithRelations } from "@/features/consultations/types/consultation.types";
import { ROLES } from "@/shared/constants/roles";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  appointmentId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const user = await requireAuth([ROLES.CLINICIAN, ROLES.ADMIN]);
  const body = await req.json();
  const input = startConsultationSchema.parse(body);

  const consultation = await consultationService.startConsultation(
    { id: user.id, role: user.role },
    input
  );

  return { data: consultation };
});

export const GET = withApiHandler<
  ConsultationWithRelations[] | ConsultationWithRelations | null
>(async (req: NextRequest) => {
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
});
