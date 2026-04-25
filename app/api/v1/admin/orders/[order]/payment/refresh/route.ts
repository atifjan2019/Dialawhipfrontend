import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { syncPaymentToOrder } from "@/lib/domain/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";

type Ctx = { params: Promise<{ order: string }> };

export const POST = handle(async (_req: Request, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { order: id } = await params;
  await syncPaymentToOrder(id);
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select(`*, items:order_items(*), address:addresses(*),
      customer:profiles!orders_customer_id_fkey(*),
      driver:profiles!orders_assigned_driver_id_fkey(*)`)
    .eq("id", id).single();
  return ok(serializeOrder(data!));
});
