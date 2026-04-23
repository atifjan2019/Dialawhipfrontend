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
    apiServer<Paginated<Order>>("/api/v1/admin/orders", { query: { limit: 6 } }).catch(() => ({
      data: [],
      meta: { next_cursor: null, prev_cursor: null },
    })),
    apiServer<{ data: RevenueSummary }>("/api/v1/admin/reports/revenue").catch(() => ({
      data: { total_pence: 0, order_count: 0, average_pence: 0 },
    })),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <Eyebrow>Dashboard</Eyebrow>
      <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">
        Good <span className="italic font-light text-forest">morning</span>.
      </h1>
      <p className="mt-3 text-[14px] text-ink-muted">Here's how the kitchen's running over the last 30 days.</p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Stat label="Revenue" value={<Money pence={revenue.data.total_pence} />} hint="Last 30 days" />
        <Stat label="Orders" value={<span className="number">{revenue.data.order_count}</span>} hint="Last 30 days" />
        <Stat label="Average order" value={<Money pence={revenue.data.average_pence} />} hint="Rolling mean" />
      </div>

      <div className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-[24px] text-ink">Recent orders</h2>
          <Link href="/admin/orders" className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest">
            All orders →
          </Link>
        </div>
        <div className="mt-5 overflow-hidden rounded-lg border hairline bg-paper">
          <table className="w-full text-[13px]">
            <thead className="border-b hairline bg-cream-deep/50 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Placed</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y hairline">
              {orders.data.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-cream-deep/40">
                  <td className="px-5 py-3.5 font-display text-[14px] text-ink">
                    <Link href={`/admin/orders/${o.id}`} className="hover:text-forest">{o.reference}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft">{o.customer?.name ?? "—"}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3.5 text-ink-muted"><DateTime iso={o.created_at} /></td>
                  <td className="px-5 py-3.5 text-right font-display text-[15px] text-forest"><Money pence={o.total_pence} /></td>
                </tr>
              ))}
              {orders.data.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-muted italic">No orders yet.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return (
    <div className="rounded-lg border hairline bg-paper p-6">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">{label}</div>
      <div className="mt-4 font-display text-[40px] leading-none text-forest">{value}</div>
      <div className="mt-3 text-[12px] text-ink-muted">{hint}</div>
    </div>
  );
}
