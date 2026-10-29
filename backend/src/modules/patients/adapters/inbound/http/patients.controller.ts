import { Hono } from "hono";
import { z } from "zod";
import { requireAuth } from "@backend/modules/auth";
import {
  createPatientSchema,
  editPatientSchema,
  listPatientsSchema,
} from "@backend/modules/patients/application/dto/patient.schema";
import { patientService } from "@backend/modules/patients/patients.module";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { getIdParam } from "@backend/shared/adapters/http/route-params";
import { ROLES } from "@backend/shared/domain/roles";

/** Staff/admin may link a new patient record to an existing account; otherwise it is a walk-in. */
const linkedProfileSchema = z.object({ profileId: z.string().uuid().optional() });

export const patientsController = new Hono();

patientsController.get(
  "/api/patients",
  withApiHandler(async (req: Request) => {
    const profile = await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);
    const searchParams = Object.fromEntries(new URL(req.url).searchParams.entries());
    const query = listPatientsSchema.parse(searchParams);

    const paginated = await patientService.listPatients(profile.role, query);
    return { data: paginated.items, meta: paginated };
  })
);

patientsController.post(
  "/api/patients",
  withApiHandler(async (req: Request) => {
    const profile = await requireAuth();
    const body = await req.json();
    const input = createPatientSchema.parse(body);

    // Patients can only create their own record; staff/admin may link one or register a walk-in.
    const forProfileId =
      profile.role === ROLES.PATIENT ? profile.id : linkedProfileSchema.parse(body).profileId;
    const patient = await patientService.createPatient(
      profile.role,
      profile.id,
      input,
      forProfileId
    );

    return { data: patient };
  })
);

patientsController.get(
  "/api/patients/:id",
  withApiHandler(async (_req: Request, context) => {
    const profile = await requireAuth();
    const id = getIdParam(context);
    const patient = await patientService.getPatient(profile.role, profile.id, id);
    return { data: patient };
  })
);

patientsController.patch(
  "/api/patients/:id",
  withApiHandler(async (req: Request, context) => {
    const profile = await requireAuth();
    const id = getIdParam(context);
    const body = await req.json();
    const input = editPatientSchema.parse(body);

    const updated = await patientService.updatePatient(profile.role, profile.id, id, input);
    return { data: updated };
  })
);

patientsController.patch(
  "/api/patients/:id/archive",
  withApiHandler(async (_req: Request, context) => {
    const profile = await requireAuth([ROLES.ADMIN, ROLES.STAFF]);
    const id = getIdParam(context);
    const archived = await patientService.archivePatient(profile.role, profile.id, id);
    return { data: archived };
  })
);

patientsController.get(
  "/api/patients/:id/history",
  withApiHandler(async (_req: Request, context) => {
    const profile = await requireAuth();
    const id = getIdParam(context);
    const history = await patientService.getPatientHistory(profile.role, profile.id, id);
    return { data: history };
  })
);
