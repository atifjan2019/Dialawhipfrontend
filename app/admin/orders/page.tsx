import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Order, Paginated } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateTime } from "@/components/ui/datetime";
import { Eyebrow } from "@/components/shop/eyebrow";

type SP = Promise<{ status?: string; cursor?: string }>;

export default async function AdminOrdersList({ searchParams }: { searchParams: SP }) {
  const { status, cursor } = await searchParams;
  const res = await apiServer<Paginated<Order>>("/api/v1/admin/orders", {
    query: { status, cursor, limit: 50 },
  }).catch(() => ({ data: [], meta: { next_cursor: null, prev_cursor: null } }));

  const filters: Array<{ v?: string; label: string }> = [
    { label: "All" },
    { v: "pending", label: "Pending" },
    { v: "confirmed", label: "Confirmed" },
    { v: "in_prep", label: "In prep" },
    { v: "out_for_delivery", label: "Out" },
    { v: "delivered", label: "Delivered" },
    { v: "cancelled", label: "Cancelled" },
  ];

  return (
    <>
      <section className="border-b-2 border-ink bg-yellow">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
          <Eyebrow>Operations</Eyebrow>
          <h1 className="mt-5 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink md:text-[64px]">
            All <span className="text-brand">orders.</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 py-10 md:px-10">
        <div className="flex flex-wrap gap-2 border-b-2 border-ink/10 pb-5">
          {filters.map((f) => {
            const href = f.v ? `/admin/orders?status=${f.v}` : "/admin/orders";
            const active = (f.v ?? "") === (status ?? "");
            return (
              <Link
                key={f.label}
                href={href}
                className={
                  active
                    ? "rounded-full bg-ink px-4 py-1.5 text-[12px] font-bold text-yellow"
                    : "rounded-full border-2 border-ink/15 bg-paper px-4 py-1.5 text-[12px] font-bold text-ink transition-colors hover:border-ink hover:bg-yellow"
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl bg-paper ring-2 ring-ink/10">
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
              {res.data.map((o, idx) => (
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
              {res.data.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center font-medium italic text-ink-muted">No orders.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex justify-between text-[13px]">
          <div>
            {res.meta.prev_cursor ? (
              <Link
                href={`/admin/orders?cursor=${res.meta.prev_cursor}${status ? `&status=${status}` : ""}`}
                className="font-bold text-ink-muted transition-colors hover:text-brand"
              >
                ← Previous
              </Link>
            ) : null}
          </div>
          <div>
            {res.meta.next_cursor ? (
              <Link
                href={`/admin/orders?cursor=${res.meta.next_cursor}${status ? `&status=${status}` : ""}`}
                className="font-bold text-ink-muted transition-colors hover:text-brand"
              >
                Next →
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
