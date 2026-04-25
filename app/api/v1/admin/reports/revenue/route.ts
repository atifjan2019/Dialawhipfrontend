import type { NextRequest } from "next/server";
import { handle, ok } from "@/lib/api/responses";
import { requireRole } from "@/lib/api/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const COUNTED_STATUSES = ["confirmed", "in_prep", "out_for_delivery", "delivered", "refunded"];

function bucketKey(d: Date, group: "day" | "week" | "month") {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  if (group === "month") return `${y}-${m}`;
  if (group === "week") {
    const start = new Date(Date.UTC(y, 0, 1));
    const week = Math.ceil((((d.getTime() - start.getTime()) / 86400000) + start.getUTCDay() + 1) / 7);
    return `${y}-W${String(week).padStart(2, "0")}`;
  }
  return `${y}-${m}-${day}`;
}

export const GET = handle(async (req: NextRequest) => {
  await requireRole("admin", "staff");
  const sp = req.nextUrl.searchParams;
  const to = sp.get("to") ? new Date(sp.get("to")!) : new Date();
  const from = sp.get("from") ? new Date(sp.get("from")!) : new Date(to.getTime() - 30 * 86400000);
  const group = (sp.get("groupBy") as "day" | "week" | "month") || "day";

  const admin = supabaseAdmin();
  const { data } = await admin
    .from("orders")
    .select("created_at,total_pence,status")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString())
    .in("status", COUNTED_STATUSES);

  const buckets = new Map<string, { revenue_pence: number; count: number }>();
  for (const o of data ?? []) {
    const key = bucketKey(new Date(o.created_at), group);
    const cur = buckets.get(key) ?? { revenue_pence: 0, count: 0 };
    cur.revenue_pence += o.total_pence ?? 0;
    cur.count += 1;
    buckets.set(key, cur);
  }
  const out = Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucket, v]) => ({ bucket, ...v }));
  return ok(out);
});
