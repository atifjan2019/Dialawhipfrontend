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
    <>
      <section className="border-b-2 border-ink bg-yellow">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Insights</Eyebrow>
              <h1 className="mt-5 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink md:text-[64px]">
                <span className="text-brand">Reports.</span>
              </h1>
            </div>
            <Link
              href="/api/v1/admin/exports/orders.csv"
              className="inline-flex h-12 items-center rounded-full border-2 border-ink bg-paper px-5 text-[13px] font-bold text-ink transition-colors hover:bg-ink hover:text-yellow"
            >
              Export CSV →
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Revenue" value={<Money pence={revenue.data.total_pence} />} hint="Last 30 days" />
          <Stat label="Orders" value={<span className="number">{revenue.data.order_count}</span>} hint="Last 30 days" />
          <Stat label="Average order" value={<Money pence={revenue.data.average_pence} />} hint="Rolling mean" />
        </div>

        <div className="mt-6 rounded-2xl bg-paper p-6 ring-2 ring-ink/10">
          <h2 className="font-display text-[20px] font-bold text-ink">Daily revenue</h2>
          <div className="mt-5 h-64">
            <RevenueChart data={revenue.data.daily ?? []} />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-paper ring-2 ring-ink/10">
          <header className="border-b-2 border-ink/10 px-6 py-4">
            <h2 className="font-display text-[20px] font-bold text-ink">Top products</h2>
          </header>
          <table className="w-full text-[13px]">
            <thead className="border-b-2 border-ink/10 bg-yellow text-left text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
              <tr>
                <th className="px-6 py-3.5">Product</th>
                <th className="px-6 py-3.5 text-right">Units</th>
                <th className="px-6 py-3.5 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {top.data.map((t, idx) => (
                <tr key={t.product_id} className={(idx > 0 ? "border-t-2 border-ink/10 " : "") + "transition-colors hover:bg-yellow"}>
                  <td className="px-6 py-3.5 font-display text-[15px] font-bold text-ink">{t.name}</td>
                  <td className="px-6 py-3.5 text-right font-medium tabular-nums text-ink-muted">{t.units_sold}</td>
                  <td className="px-6 py-3.5 text-right font-display text-[16px] font-bold text-ink"><Money pence={t.revenue_pence} /></td>
                </tr>
              ))}
              {top.data.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-12 text-center font-medium italic text-ink-muted">No data.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return (
    <div className="rounded-2xl bg-paper p-6 ring-2 ring-ink/10 transition-all hover:ring-brand">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">{label}</div>
      <div className="mt-4 font-display text-[40px] font-bold leading-none text-ink">{value}</div>
      <div className="mt-3 text-[12px] font-medium text-ink-muted">{hint}</div>
    </div>
  );
}
