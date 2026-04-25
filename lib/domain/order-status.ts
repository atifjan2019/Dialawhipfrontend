import type { OrderStatus } from "../types";
import { supabaseAdmin } from "../supabase/admin";
import { allowed } from "./state-machine";
import { InvalidStateTransitionError } from "./errors";

export async function transitionOrder(opts: {
  orderId: string;
  toStatus: OrderStatus;
  actorUserId: string | null;
  note: string | null;
}) {
  const admin = supabaseAdmin();
  const { data: current } = await admin.from("orders").select("status").eq("id", opts.orderId).single();
  if (!current) throw new Error("Order not found");
  const fromStatus = current.status as OrderStatus;
  if (!allowed(fromStatus, opts.toStatus)) {
    throw new InvalidStateTransitionError(fromStatus, opts.toStatus);
  }
  const { error: updateErr } = await admin.from("orders").update({ status: opts.toStatus }).eq("id", opts.orderId);
  if (updateErr) throw updateErr;
  await admin.from("order_events").insert({
    order_id: opts.orderId,
    from_status: fromStatus,
    to_status: opts.toStatus,
    actor_user_id: opts.actorUserId,
    note: opts.note,
  });
  return { fromStatus, toStatus: opts.toStatus };
}

export async function recordInitialEvent(orderId: string, actorUserId: string | null) {
  const admin = supabaseAdmin();
  await admin.from("order_events").insert({
    order_id: orderId,
    from_status: null,
    to_status: "pending",
    actor_user_id: actorUserId,
  });
}
