import { Hono } from "hono";
import { requireAuth } from "@backend/modules/auth";
import { sendMessageSchema } from "@backend/modules/consultations/application/dto/consultation-message.schema";
import { consultationMessageService } from "@backend/modules/consultations/consultations.module";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { getIdParam } from "@backend/shared/adapters/http/route-params";
import { ROLES } from "@backend/shared/domain/roles";

const CHAT_ROLES = [ROLES.CLINICIAN, ROLES.PATIENT];

export const consultationChatController = new Hono();

consultationChatController.get(
  "/api/appointments/:id/messages",
  withApiHandler(async (_req: Request, context) => {
    const user = await requireAuth(CHAT_ROLES);
    const chat = await consultationMessageService.getChat(user, getIdParam(context));
    return { data: chat };
  })
);

consultationChatController.post(
  "/api/appointments/:id/messages",
  withApiHandler(async (req: Request, context) => {
    const user = await requireAuth(CHAT_ROLES);
    const input = sendMessageSchema.parse(await req.json());
    const message = await consultationMessageService.sendMessage(user, getIdParam(context), input);
    return { data: message };
  })
);

consultationChatController.post(
  "/api/appointments/:id/messages/read",
  withApiHandler(async (_req: Request, context) => {
    const user = await requireAuth([ROLES.CLINICIAN, ROLES.PATIENT]);
    const result = await consultationMessageService.markAsRead(user, getIdParam(context));
    return { data: result };
  })
);
