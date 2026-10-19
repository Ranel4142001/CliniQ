import { NextRequest } from "next/server";
import { withApiHandler } from "@/shared/lib/api-handler";
import { requireAuth } from "@/features/auth/utils/auth-guards";
import { patientService } from "@/features/patients/services/patient.service";
import {
  createPatientSchema,
  listPatientsSchema,
} from "@/features/patients/schemas/patient.schema";
import { ROLES } from "@/shared/constants/roles";

export const GET = withApiHandler(async (req: NextRequest) => {
  const profile = await requireAuth([ROLES.ADMIN, ROLES.STAFF, ROLES.CLINICIAN]);
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const query = listPatientsSchema.parse(searchParams);

  const paginated = await patientService.listPatients(profile.role, query);
  return { data: paginated.items, meta: paginated };
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const profile = await requireAuth();
  const body = await req.json();
  const input = createPatientSchema.parse(body);

  // If user is a PATIENT, associate with their profile. If STAFF/ADMIN, can specify or walk-in.
  const forProfileId = profile.role === ROLES.PATIENT ? profile.id : body.profileId;
  const patient = await patientService.createPatient(
    profile.role,
    profile.id,
    input,
    forProfileId
  );

  return { data: patient };
});
