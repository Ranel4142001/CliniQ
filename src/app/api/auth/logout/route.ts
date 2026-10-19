import { cookies } from "next/headers";
import { withApiHandler } from "@/shared/lib/api-handler";
import { createClient } from "@/shared/lib/supabase/server";

export const POST = withApiHandler(async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  cookies().delete("cliniq_demo_user");
  return { data: { success: true } };
});
