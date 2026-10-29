import { Hono } from "hono";
import {
  bookAppointmentSchema,
  listAppointmentsSchema,
  querySlotsSchema,
  rescheduleAppointmentSchema,
  updateAppointmentStatusSchema,
} from "@backend/modules/appointments/application/dto/appointment.schema";
import { appointmentService } from "@backend/modules/appointments/appointments.module";
import { requireAuth } from "@backend/modules/auth";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { getIdParam } from "@backend/shared/adapters/http/route-params";

export const appointmentsController = new Hono();

appointmentsController.get(
  "/api/appointments",
  withApiHandler(async (req: Request) => {
    const profile = await requireAuth();
    const searchParams = Object.fromEntries(new URL(req.url).searchParams.entries());
    const query = listAppointmentsSchema.parse(searchParams);

    const paginated = await appointmentService.listAppointments(profile.role, profile.id, query);

    return { data: paginated.items, meta: paginated };
  })
);

appointmentsController.post(
  "/api/appointments",
  withApiHandler(async (req: Request) => {
    const profile = await requireAuth();
    const body = await req.json();
    const input = bookAppointmentSchema.parse(body);

    const appt = await appointmentService.bookAppointment(profile.role, profile.id, input);

    return { data: appt };
  })
);

appointmentsController.get(
  "/api/appointments/slots",
  withApiHandler(
    async (req: Request) => {
      await requireAuth();
      const searchParams = Object.fromEntries(new URL(req.url).searchParams.entries());
      const query = querySlotsSchema.parse(searchParams);

      const slots = await appointmentService.getAvailableSlots(query.clinicianId, query.date);

      return { data: slots };
    },
    { cacheSeconds: 60 }
  )
);

appointmentsController.get(
  "/api/appointments/:id",
  withApiHandler(async (_req: Request, context) => {
    const profile = await requireAuth();
    const id = getIdParam(context);
    const appt = await appointmentService.getAppointment(profile.role, profile.id, id);
    return { data: appt };
  })
);

appointmentsController.patch(
  "/api/appointments/:id",
  withApiHandler(async (req: Request, context) => {
    const profile = await requireAuth();
    const id = getIdParam(context);
    const body = await req.json();
    const input = rescheduleAppointmentSchema.parse(body);

    const updated = await appointmentService.rescheduleAppointment(
      profile.role,
      profile.id,
      id,
      input
    );

    return { data: updated };
  })
);

appointmentsController.patch(
  "/api/appointments/:id/status",
  withApiHandler(async (req: Request, context) => {
    const profile = await requireAuth();
    const id = getIdParam(context);
    const body = await req.json();
    const input = updateAppointmentStatusSchema.parse(body);

    const updated = await appointmentService.updateStatus(profile.role, profile.id, id, input);

    return { data: updated };
  })
);
