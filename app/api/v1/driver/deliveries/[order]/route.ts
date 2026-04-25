import { handle, ok, notFound, forbidden } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";

type Ctx = { params: Promise<{ order: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const driver = await requireRole("driver", "admin");
  const { order: id } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select(`*, items:order_items(*), address:addresses(*),
      customer:profiles!orders_customer_id_fkey(*),
      events:order_events(*, actor:profiles!order_events_actor_user_id_fkey(*))`)
    .eq("id", id)
    .single();
  if (!data) return notFound();
  if (data.assigned_driver_id !== driver.id && driver.role !== "admin") return forbidden();
  return ok(serializeOrder(data));
});
