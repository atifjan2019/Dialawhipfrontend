import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, notFound, forbidden, validationError } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { transitionOrder } from "@/lib/domain/order-status";
import { serializeOrder } from "@/lib/api/resources";

const Body = z.object({
  to_status: z.enum(["in_prep", "out_for_delivery", "delivered", "failed", "cancelled"]),
  note: z.string().max(500).optional().nullable(),
});

type Ctx = { params: Promise<{ order: string }> };

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  const driver = await requireRole("driver", "admin");
  const { order: id } = await params;
  const body = await parseJson(req, Body);
  const admin = supabaseAdmin();
  const { data: ord } = await admin.from("orders").select("assigned_driver_id").eq("id", id).single();
  if (!ord) return notFound();
  if (ord.assigned_driver_id !== driver.id && driver.role !== "admin") return forbidden();
  if ((body.to_status === "cancelled" || body.to_status === "failed") && !body.note) {
    return validationError({ note: ["A note is required for this status."] });
  }
  await transitionOrder({ orderId: id, toStatus: body.to_status, actorUserId: driver.id, note: body.note ?? null });
  const { data } = await admin
    .from("orders")
    .select(`*, items:order_items(*), address:addresses(*),
      customer:profiles!orders_customer_id_fkey(*),
      events:order_events(*, actor:profiles!order_events_actor_user_id_fkey(*))`)
    .eq("id", id).single();
  return ok(serializeOrder(data!));
});
