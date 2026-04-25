import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const COUNTED_STATUSES = ["confirmed", "in_prep", "out_for_delivery", "delivered", "refunded"];

export const GET = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const sp = req.nextUrl.searchParams;
  const to = sp.get("to") ? new Date(sp.get("to")!) : new Date();
  const from = sp.get("from") ? new Date(sp.get("from")!) : new Date(to.getTime() - 30 * 86400000);

  const admin = supabaseAdmin();
  const { data } = await admin
    .from("order_items")
    .select("product_id,quantity,line_total_pence,order_id,orders!inner(created_at,status)")
    .gte("orders.created_at", from.toISOString())
    .lte("orders.created_at", to.toISOString())
    .in("orders.status", COUNTED_STATUSES);

  const tally = new Map<string, { units: number; revenue_pence: number }>();
  for (const row of (data ?? []) as Array<{ product_id: string | null; quantity: number; line_total_pence: number }>) {
    if (!row.product_id) continue;
    const cur = tally.get(row.product_id) ?? { units: 0, revenue_pence: 0 };
    cur.units += row.quantity ?? 0;
    cur.revenue_pence += row.line_total_pence ?? 0;
    tally.set(row.product_id, cur);
  }
  const out = Array.from(tally.entries())
    .sort(([, a], [, b]) => b.revenue_pence - a.revenue_pence)
    .slice(0, 20)
    .map(([product_id, v]) => ({ product_id, ...v }));
  return ok(out);
});
