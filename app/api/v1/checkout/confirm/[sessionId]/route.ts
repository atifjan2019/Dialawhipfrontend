import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ sessionId: string }> };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireRole("customer", "staff", "admin");
  const { sessionId } = await params;
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select("*, items:order_items(*), address:addresses(*)")
    .eq("stripe_session_id", sessionId)
    .eq("customer_id", user.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ status: "pending" }, { status: 202 });
  return ok(serializeOrder(data));
});
