import { z } from "zod";
import { CHAT_CONFIG } from "@backend/modules/consultations/domain/constants/consultation.constants";

export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(
      CHAT_CONFIG.MAX_MESSAGE_LENGTH,
      `Message must be at most ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters`
    ),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
