import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import { Money } from "@/components/ui/money";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Eyebrow } from "@/components/shop/eyebrow";

interface RevenueData {
  total_pence: number;
  order_count: number;
  average_pence: number;
  daily: Array<{ date: string; revenue_pence: number; orders: number }>;
}

interface TopProduct {
  product_id: string;
  name: string;
  units_sold: number;
  revenue_pence: number;
}

export default async function ReportsPage() {
  const [revenue, top] = await Promise.all([
    apiServer<{ data: RevenueData }>("/api/v1/admin/reports/revenue").catch(() => ({
      data: { total_pence: 0, order_count: 0, average_pence: 0, daily: [] },
    })),
    apiServer<{ data: TopProduct[] }>("/api/v1/admin/reports/top-products").catch(() => ({ data: [] })),
  ]);

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>Insights</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">Reports</h1>
        </div>
        <Link
          href="/api/v1/admin/exports/orders.csv"
          className="inline-flex h-11 items-center rounded-full border hairline bg-paper px-5 text-[13px] font-medium text-ink transition-colors hover:border-ink/30"
        >
          Export CSV →
        </Link>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Stat label="Revenue" value={<Money pence={revenue.data.total_pence} />} hint="Last 30 days" />
        <Stat label="Orders" value={<span className="number">{revenue.data.order_count}</span>} hint="Last 30 days" />
        <Stat label="Average order" value={<Money pence={revenue.data.average_pence} />} hint="Rolling mean" />
      </div>

      <div className="mt-6 rounded-lg border hairline bg-paper p-6">
        <h2 className="font-display text-[18px] text-ink">Daily revenue</h2>
        <div className="mt-5 h-64">
          <RevenueChart data={revenue.data.daily ?? []} />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border hairline bg-paper">
        <header className="border-b hairline px-6 py-4">
          <h2 className="font-display text-[18px] text-ink">Top products</h2>
        </header>
        <table className="w-full text-[13px]">
          <thead className="border-b hairline bg-cream-deep/50 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3 text-right">Units</th>
              <th className="px-6 py-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {top.data.map((t) => (
              <tr key={t.product_id} className="transition-colors hover:bg-cream-deep/40">
                <td className="px-6 py-3.5 font-display text-[14px] text-ink">{t.name}</td>
                <td className="px-6 py-3.5 text-right text-ink-muted number">{t.units_sold}</td>
                <td className="px-6 py-3.5 text-right font-display text-[15px] text-forest"><Money pence={t.revenue_pence} /></td>
              </tr>
            ))}
            {top.data.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-10 text-center italic text-ink-muted">No data.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return (
    <div className="rounded-lg border hairline bg-paper p-6">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">{label}</div>
      <div className="mt-4 font-display text-[36px] leading-none text-forest">{value}</div>
      <div className="mt-3 text-[12px] text-ink-muted">{hint}</div>
    </div>
  );
}
