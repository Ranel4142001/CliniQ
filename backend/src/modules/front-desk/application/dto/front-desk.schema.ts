import { z } from "zod";
import { FRONT_DESK_CONFIG } from "@backend/modules/front-desk/domain/constants/front-desk.constants";

export const sendFrontDeskMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(
      FRONT_DESK_CONFIG.MAX_MESSAGE_LENGTH,
      `Message must be at most ${FRONT_DESK_CONFIG.MAX_MESSAGE_LENGTH} characters`
    ),
});

export type SendFrontDeskMessageInput = z.infer<typeof sendFrontDeskMessageSchema>;
