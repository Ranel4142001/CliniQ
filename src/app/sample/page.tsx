import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";

export default function SamplePage() {
  redirect(ROUTES.LOGIN);
}
