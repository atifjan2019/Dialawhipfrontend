import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, ok, validationError } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";

const Body = z.object({ driver_id: z.string().uuid() });
type Ctx = { params: Promise<{ order: string }> };

export const PATCH = handle(async (req: NextRequest, { params }: Ctx) => {
  await requireRole("admin", "staff");
  const { order: id } = await params;
  const body = await parseJson(req, Body);
  const admin = supabaseAdmin();
  const { data: driver } = await admin.from("profiles").select("id,role").eq("id", body.driver_id).single();
  if (!driver || driver.role !== "driver") return validationError({ driver_id: ["User is not a driver"] });
  await admin.from("orders").update({ assigned_driver_id: body.driver_id }).eq("id", id);
  const { data } = await admin
    .from("orders")
    .select(`*, items:order_items(*), address:addresses(*),
      customer:profiles!orders_customer_id_fkey(*),
      driver:profiles!orders_assigned_driver_id_fkey(*)`)
    .eq("id", id).single();
  return ok(serializeOrder(data!));
});
