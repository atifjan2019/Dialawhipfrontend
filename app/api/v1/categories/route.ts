import { handle, ok } from "@/lib/api/responses";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeCategory } from "@/lib/api/resources";

export const GET = handle(async () => {
  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return ok((data ?? []).map(serializeCategory));
});
