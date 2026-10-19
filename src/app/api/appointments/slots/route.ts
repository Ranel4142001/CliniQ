import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { appointmentService } from "@/features/appointments/services/appointment.service";
import { querySlotsSchema } from "@/features/appointments/schemas/appointment.schema";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (req: NextRequest) => {
  await requireAuth();
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = querySlotsSchema.parse(searchParams);

  const slots = await appointmentService.getAvailableSlots(
    query.clinicianId,
    query.date
  );

  return { data: slots };
});
