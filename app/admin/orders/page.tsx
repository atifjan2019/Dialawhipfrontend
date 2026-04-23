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
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <Eyebrow>Orders</Eyebrow>
      <h1 className="mt-5 font-display text-[44px] leading-[1] text-ink">All orders</h1>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((f) => {
          const href = f.v ? `/admin/orders?status=${f.v}` : "/admin/orders";
          const active = (f.v ?? "") === (status ?? "");
          return (
            <Link
              key={f.label}
              href={href}
              className={
                active
                  ? "inline-flex items-center rounded-full bg-forest px-4 py-1.5 text-[12px] font-medium text-cream"
                  : "inline-flex items-center rounded-full border hairline bg-paper px-4 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-forest hover:text-forest"
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border hairline bg-paper">
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
            {res.data.map((o) => (
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
            {res.data.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center italic text-ink-muted">No orders.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex justify-between text-[13px]">
        <div>
          {res.meta.prev_cursor ? (
            <Link href={`/admin/orders?cursor=${res.meta.prev_cursor}${status ? `&status=${status}` : ""}`} className="font-medium text-ink-muted transition-colors hover:text-forest">← Previous</Link>
          ) : null}
        </div>
        <div>
          {res.meta.next_cursor ? (
            <Link href={`/admin/orders?cursor=${res.meta.next_cursor}${status ? `&status=${status}` : ""}`} className="font-medium text-ink-muted transition-colors hover:text-forest">Next →</Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
