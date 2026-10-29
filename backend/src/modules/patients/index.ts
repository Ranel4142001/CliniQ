// Public API of the patients module. Other modules import only from here.
export { patientsController } from "./adapters/inbound/http/patients.controller";
export { patientService, patientDirectory } from "./patients.module";
