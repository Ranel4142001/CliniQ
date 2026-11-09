import { Hono } from "hono";
import { requireAuth } from "@backend/modules/auth";
import { sendFrontDeskMessageSchema } from "@backend/modules/front-desk/application/dto/front-desk.schema";
import { frontDeskService } from "@backend/modules/front-desk/front-desk.module";
import { withApiHandler } from "@backend/shared/adapters/http/api-handler";
import { getIdParam } from "@backend/shared/adapters/http/route-params";
import { ROLES } from "@backend/shared/domain/roles";

const FRONT_DESK_ROLES = [ROLES.ADMIN, ROLES.STAFF, ROLES.PATIENT];

export const frontDeskController = new Hono();

frontDeskController.get(
  "/api/front-desk/threads",
  withApiHandler(async () => {
    const user = await requireAuth(FRONT_DESK_ROLES);
    return { data: await frontDeskService.listThreads(user) };
  })
);

frontDeskController.get(
  "/api/front-desk/threads/:id/messages",
  withApiHandler(async (_req: Request, context) => {
    const user = await requireAuth(FRONT_DESK_ROLES);
    return { data: await frontDeskService.getChat(user, getIdParam(context)) };
  })
);

frontDeskController.post(
  "/api/front-desk/threads/:id/messages",
  withApiHandler(async (req: Request, context) => {
    const user = await requireAuth(FRONT_DESK_ROLES);
    const input = sendFrontDeskMessageSchema.parse(await req.json());
    return { data: await frontDeskService.sendMessage(user, getIdParam(context), input) };
  })
);

frontDeskController.post(
  "/api/front-desk/threads/:id/read",
  withApiHandler(async (_req: Request, context) => {
    const user = await requireAuth(FRONT_DESK_ROLES);
    return { data: await frontDeskService.markAsRead(user, getIdParam(context)) };
  })
);
