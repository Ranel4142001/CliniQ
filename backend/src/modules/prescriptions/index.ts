// Public API of the prescriptions module. Other modules import only from here.
export { prescriptionsController } from "./adapters/inbound/http/prescriptions.controller";
export { prescriptionService } from "./prescriptions.module";
