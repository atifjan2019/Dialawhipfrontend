import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, syncPaymentToOrder } from "@/lib/domain/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { transitionOrder } from "@/lib/domain/order-status";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ message: "Missing signature or secret" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json({ message: `Webhook signature failed: ${(err as Error).message}` }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: existing } = await admin.from("stripe_events").select("processed_at").eq("id", event.id).maybeSingle();
  if (existing?.processed_at) return NextResponse.json({ status: "duplicate" });

  await admin.from("stripe_events").upsert({
    id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  }, { onConflict: "id" });

  try {
    await processEvent(event);
    await admin.from("stripe_events").update({ processed_at: new Date().toISOString() }).eq("id", event.id);
  } catch (err) {
    console.error("[stripe-webhook]", err);
    return NextResponse.json({ message: "Processing failed" }, { status: 500 });
  }
  return NextResponse.json({ status: "ok" });
}

async function processEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = (session.metadata?.order_id ?? session.client_reference_id ?? "") as string;
      if (!orderId) return;
      const admin = supabaseAdmin();
      const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
      if (piId) await admin.from("orders").update({ stripe_payment_intent_id: piId }).eq("id", orderId);
      await syncPaymentToOrder(orderId);
      const { data: o } = await admin.from("orders").select("status").eq("id", orderId).single();
      if (o?.status === "pending") {
        await transitionOrder({ orderId, toStatus: "confirmed", actorUserId: null, note: "Stripe checkout completed" });
      }
      return;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const piId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!piId) return;
      const admin = supabaseAdmin();
      const { data: order } = await admin.from("orders").select("id,status").eq("stripe_payment_intent_id", piId).maybeSingle();
      if (!order) return;
      await syncPaymentToOrder(order.id);
      if (order.status === "delivered") {
        await transitionOrder({ orderId: order.id, toStatus: "refunded", actorUserId: null, note: "Refund issued via Stripe" });
      }
      return;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const admin = supabaseAdmin();
      const { data: order } = await admin.from("orders").select("id,status").eq("stripe_payment_intent_id", intent.id).maybeSingle();
      if (order && order.status === "pending") {
        await transitionOrder({ orderId: order.id, toStatus: "cancelled", actorUserId: null, note: "Payment failed" });
      }
      return;
    }
    default:
      return;
  }
}
