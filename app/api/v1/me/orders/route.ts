import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serializeOrder } from "@/lib/api/resources";

export const GET = handle(async (req: NextRequest) => {
  const user = await requireRole("customer", "staff", "admin");
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get("limit") ?? 25) || 25));
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select("*, items:order_items(*), address:addresses(*)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ok((data ?? []).map(serializeOrder));
});
