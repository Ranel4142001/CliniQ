// Public API of the consultations module. Other modules import only from here.
export { consultationsController } from "./adapters/inbound/http/consultations.controller";
export { consultationChatController } from "./adapters/inbound/http/consultation-chat.controller";
export { consultationService, consultationMessageService } from "./consultations.module";
