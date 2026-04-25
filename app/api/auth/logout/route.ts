import { supabaseServer } from "@/lib/supabase/server";
import { handle, ok } from "@/lib/api/responses";

export const POST = handle(async () => {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  return ok({ ok: true });
});
