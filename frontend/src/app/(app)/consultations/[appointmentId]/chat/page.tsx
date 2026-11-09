import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Old full-screen chat URL; conversations now live in Messages. */
export default async function ConsultationChatPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  redirect(ROUTES.MESSAGE_THREAD(appointmentId));
}
