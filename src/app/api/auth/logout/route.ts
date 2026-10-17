import { withApiHandler } from "@/shared/lib/api-handler";
import { createClient } from "@/shared/lib/supabase/server";

export const POST = withApiHandler(async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return { data: { success: true } };
});
