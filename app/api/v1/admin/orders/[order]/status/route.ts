import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { transitionOrder } from "@/lib/domain/order-status";
import { serializeOrder } from "@/lib/api/resources";

const Body = z.object({
  to_status: z.enum(["pending", "confirmed", "in_prep", "out_for_delivery", "delivered", "failed", "cancelled", "refunded"]),
  note: z.string().max(500).optional().nullable(),
});

type Ctx = { params: Promise<{ order: string }> };

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireRole("admin", "staff");
  const { order: id } = await params;
  const body = await parseJson(req, Body);
  await transitionOrder({ orderId: id, toStatus: body.to_status, actorUserId: user.id, note: body.note ?? null });
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select(`*, items:order_items(*), address:addresses(*),
      events:order_events(*, actor:profiles!order_events_actor_user_id_fkey(*)),
      customer:profiles!orders_customer_id_fkey(*),
      driver:profiles!orders_assigned_driver_id_fkey(*)`)
    .eq("id", id).single();
  return ok(serializeOrder(data!));
});
