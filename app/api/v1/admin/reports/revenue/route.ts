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
    .from("orders")
    .select("created_at,total_pence,status")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString())
    .in("status", COUNTED_STATUSES);

  const rows = data ?? [];

  // Headline numbers — always numbers, never undefined. The dashboard
  // and reports pages destructure these directly.
  const total_pence = rows.reduce((s, o) => s + (o.total_pence ?? 0), 0);
  const order_count = rows.length;
  const average_pence = order_count > 0 ? Math.round(total_pence / order_count) : 0;

  // Daily breakdown bucketed by UTC day.
  const buckets = new Map<string, { revenue_pence: number; orders: number }>();
  for (const o of rows) {
    const d = new Date(o.created_at);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const cur = buckets.get(key) ?? { revenue_pence: 0, orders: 0 };
    cur.revenue_pence += o.total_pence ?? 0;
    cur.orders += 1;
    buckets.set(key, cur);
  }
  const daily = Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, revenue_pence: v.revenue_pence, orders: v.orders }));

  return ok({ total_pence, order_count, average_pence, daily });
});
