import { handle, okList } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";

export const GET = handle(async () => {
  const driver = await requireRole("driver", "admin");
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select(`*, items:order_items(*), address:addresses(*),
      customer:profiles!orders_customer_id_fkey(*)`)
    .eq("assigned_driver_id", driver.id)
    .not("status", "in", "(delivered,cancelled,refunded)")
    .order("scheduled_for", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  return okList((data ?? []).map(serializeOrder));
});
