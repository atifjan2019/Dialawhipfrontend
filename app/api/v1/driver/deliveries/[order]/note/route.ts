import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, notFound, forbidden } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";

const Body = z.object({ note: z.string().min(1).max(500) });
type Ctx = { params: Promise<{ order: string }> };

export const POST = handle(async (req: NextRequest, { params }: Ctx) => {
  const driver = await requireRole("driver", "admin");
  const { order: id } = await params;
  const body = await parseJson(req, Body);
  const admin = supabaseAdmin();
  const { data: existing } = await admin.from("orders").select("assigned_driver_id,driver_notes").eq("id", id).single();
  if (!existing) return notFound();
  if (existing.assigned_driver_id !== driver.id && driver.role !== "admin") return forbidden();

  const stamped = `[${new Date().toISOString()}] ${body.note}`;
  const next = existing.driver_notes ? `${existing.driver_notes}\n${stamped}` : stamped;
  await admin.from("orders").update({ driver_notes: next }).eq("id", id);

  const { data } = await admin
    .from("orders")
    .select(`*, items:order_items(*), address:addresses(*),
      customer:profiles!orders_customer_id_fkey(*)`)
    .eq("id", id).single();
  return ok(serializeOrder(data!));
});
