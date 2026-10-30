import { ReactNode } from "react";
import { AppShellClient } from "@/app/(app)/AppShellClient";

/**
 * Layout for the authenticated app. Deliberately does no server-side data fetching,
 * so pages are served instantly; the signed-in user is loaded (and cached) in the
 * browser by AppShellClient. Middleware already redirects visitors without a session.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShellClient>{children}</AppShellClient>;
}
