import { apiServer } from "@/lib/api-server";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateTime } from "@/components/ui/datetime";
import Link from "next/link";
import type { Order, Paginated } from "@/lib/types";
import { Eyebrow } from "@/components/shop/eyebrow";

interface RevenueSummary {
  total_pence: number;
  order_count: number;
  average_pence: number;
}

export default async function AdminDashboard() {
  const [orders, revenue] = await Promise.all([
    apiServer<Paginated<Order>>("/api/v1/admin/orders", { query: { limit: 8 } }).catch(() => ({
      data: [],
      meta: { next_cursor: null, prev_cursor: null },
    })),
    apiServer<{ data: RevenueSummary }>("/api/v1/admin/reports/revenue").catch(() => ({
      data: { total_pence: 0, order_count: 0, average_pence: 0 },
    })),
  ]);

  const pendingCount = orders.data.filter((o) => o.status === "pending").length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <>
      <section className="border-b-2 border-ink bg-yellow">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Dashboard</Eyebrow>
              <h1 className="mt-5 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink md:text-[64px]">
                Good <span className="text-brand">{greeting}.</span>
              </h1>
              <p className="mt-4 text-[14px] font-medium text-ink/75">
                Here&rsquo;s how the kitchen&rsquo;s running over the last 30 days.
              </p>
            </div>
            {pendingCount > 0 ? (
              <Link
                href="/admin/orders?status=pending"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[12px] font-bold text-yellow transition-transform hover:-translate-y-0.5"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow text-[11px] font-bold text-ink">
                  {pendingCount}
                </span>
                Pending order{pendingCount === 1 ? "" : "s"} →
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Revenue" value={<Money pence={revenue.data.total_pence} />} hint="Last 30 days" />
          <Stat label="Orders" value={<span className="number">{revenue.data.order_count}</span>} hint="Last 30 days" />
          <Stat label="Average order" value={<Money pence={revenue.data.average_pence} />} hint="Rolling mean" />
        </div>

        <div className="mt-12">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-[28px] font-bold text-ink">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-[12px] font-bold uppercase tracking-[0.18em] text-brand transition-colors hover:text-brand-deep"
            >
              All orders →
            </Link>
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl bg-paper ring-2 ring-ink/10">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead className="border-b-2 border-ink/10 bg-yellow text-left text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
                <tr>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Placed</th>
                  <th className="px-5 py-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.data.map((o, idx) => (
                  <tr key={o.id} className={(idx > 0 ? "border-t-2 border-ink/10 " : "") + "transition-colors hover:bg-yellow"}>
                    <td className="px-5 py-3.5 font-display text-[15px] font-bold text-ink">
                      <Link href={`/admin/orders/${o.id}`} className="hover:text-brand">{o.reference}</Link>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-ink-soft">{o.customer?.name ?? "—"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-[12px] font-medium text-ink-muted"><DateTime iso={o.created_at} /></td>
                    <td className="px-5 py-3.5 text-right font-display text-[16px] font-bold text-ink"><Money pence={o.total_pence} /></td>
                  </tr>
                ))}
                {orders.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center font-medium italic text-ink-muted">
                      No orders yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return (
    <div className="rounded-2xl bg-paper p-6 ring-2 ring-ink/10 transition-all hover:ring-brand">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">{label}</div>
      <div className="mt-4 font-display text-[44px] font-bold leading-none text-ink">{value}</div>
      <div className="mt-3 text-[12px] font-medium text-ink-muted">{hint}</div>
    </div>
  );
}
