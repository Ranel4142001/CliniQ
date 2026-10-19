import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { AppShellClient } from "./AppShellClient";
import { ROUTES } from "@/shared/constants/routes";
import { authRepository } from "@/features/auth/repositories/auth.repository";
import { isDemoMode } from "@/shared/lib/supabase/demo-mode";

/**
 * Server component layout for the authenticated app shell.
 * Reads the Supabase session on the server, fetches the profile,
 * then passes minimal user props down to the client shell.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "dummy-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
    },
  });

  let userProps: { fullName: string; email: string; role: string } | null = null;

  if (!isDemoMode()) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(ROUTES.LOGIN);
    }

    const profile = await authRepository.findByAuthId(user.id);
    if (!profile || !profile.isActive) {
      redirect(ROUTES.LOGIN);
    }

    userProps = {
      fullName: profile.fullName,
      email: profile.email,
      role: profile.role,
    };
  } else {
    // Demo mode – check if a demo user is logged in via cookie
    const demoCookie = cookieStore.get("cliniq_demo_user")?.value;
    if (demoCookie) {
      try {
        const parsed = JSON.parse(demoCookie);
        userProps = {
          fullName: parsed.fullName || "Ranel Dahil",
          email: parsed.email || "raneldahil@gmail.com",
          role: parsed.role || "PATIENT",
        };
      } catch {
        userProps = { fullName: "Demo User", email: "demo@cliniq.local", role: "ADMIN" };
      }
    } else {
      userProps = { fullName: "Demo User", email: "demo@cliniq.local", role: "ADMIN" };
    }
  }

  return <AppShellClient user={userProps}>{children}</AppShellClient>;
}
