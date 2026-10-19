import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { appointmentService } from "@/features/appointments/services/appointment.service";
import { rescheduleAppointmentSchema } from "@/features/appointments/schemas/appointment.schema";

export const GET = withApiHandler(async (_req: NextRequest, context) => {
  const profile = await requireAuth();
  const id = context?.params?.id as string;
  const appt = await appointmentService.getAppointment(
    profile.role,
    profile.id,
    id
  );
  return { data: appt };
});

export const PATCH = withApiHandler(async (req: NextRequest, context) => {
  const profile = await requireAuth();
  const id = context?.params?.id as string;
  const body = await req.json();
  const input = rescheduleAppointmentSchema.parse(body);

  const updated = await appointmentService.rescheduleAppointment(
    profile.role,
    profile.id,
    id,
    input
  );

  return { data: updated };
});
