import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { appointmentService } from "@/features/appointments/services/appointment.service";
import {
  bookAppointmentSchema,
  listAppointmentsSchema,
} from "@/features/appointments/schemas/appointment.schema";

export const GET = withApiHandler(async (req: NextRequest) => {
  const profile = await requireAuth();
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = listAppointmentsSchema.parse(searchParams);

  const paginated = await appointmentService.listAppointments(
    profile.role,
    profile.id,
    query
  );

  return { data: paginated.items, meta: paginated };
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const profile = await requireAuth();
  const body = await req.json();
  const input = bookAppointmentSchema.parse(body);

  const appt = await appointmentService.bookAppointment(
    profile.role,
    profile.id,
    input
  );

  return { data: appt };
});
