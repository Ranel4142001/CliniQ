import { cookies } from "next/headers";
import { withApiHandler } from "@/shared/lib/api-handler";
import { createClient } from "@/shared/lib/supabase/server";
import { isDemoMode } from "@/shared/lib/supabase/demo-mode";

export const POST = withApiHandler(async () => {
  cookies().delete("cliniq_demo_user");
  if (!isDemoMode()) {
    const supabase = createClient();
    await supabase.auth.signOut();
  }
  return { data: { success: true } };
});
