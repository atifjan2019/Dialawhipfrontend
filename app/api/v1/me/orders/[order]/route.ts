import { handle, ok, notFound, forbidden } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";

type Ctx = { params: Promise<{ order: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireRole("customer", "staff", "admin");
  const { order: id } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select(`*,
      items:order_items(*),
      address:addresses(*),
      events:order_events(*, actor:profiles!order_events_actor_user_id_fkey(*)),
      driver:profiles!orders_assigned_driver_id_fkey(*)`)
    .eq("id", id)
    .single();
  if (!data) return notFound();
  if (data.customer_id !== user.id) return forbidden();
  const sorted = { ...data, events: (data.events ?? []).slice().sort((a: { created_at: string }, b: { created_at: string }) => a.created_at.localeCompare(b.created_at)) };
  return ok(serializeOrder(sorted));
});
