import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShellClient } from "@/app/(app)/AppShellClient";
import { ROUTES } from "@/constants/routes";
import { getCurrentUser } from "@/lib/server-api";

/**
 * Server layout for the authenticated app shell. Asks the backend for the
 * signed-in profile, then passes minimal user props to the client shell.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentUser();
  if (!profile) redirect(ROUTES.LOGIN);

  const user = { fullName: profile.fullName, email: profile.email, role: profile.role };
  return <AppShellClient user={user}>{children}</AppShellClient>;
}
