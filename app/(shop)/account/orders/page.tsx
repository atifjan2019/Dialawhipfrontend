import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Order, Paginated } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateTime } from "@/components/ui/datetime";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function OrdersPage() {
  const res = await apiServer<Paginated<Order>>("/api/v1/me/orders").catch((): Paginated<Order> => ({ data: [], meta: { next_cursor: null, prev_cursor: null } }));

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14">
      <Link href="/account" className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest">
        ← Account
      </Link>
      <div className="mt-8">
        <Eyebrow>History</Eyebrow>
        <h1 className="mt-5 font-display text-[48px] leading-[1] text-ink md:text-[56px]">
          Your <span className="italic font-light text-forest">orders</span>
        </h1>
      </div>

      {res.data.length === 0 ? (
        <div className="mt-16 rounded-lg border hairline bg-paper p-14 text-center">
          <p className="font-display text-[24px] italic text-ink-muted">No orders yet.</p>
          <p className="mt-3 text-[14px] text-ink-muted">Your first order will appear here.</p>
          <Link
            href="/menu"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-forest px-6 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Browse menu →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y hairline overflow-hidden rounded-lg border hairline bg-paper">
          {res.data.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.id}`} className="flex items-center justify-between gap-6 p-6 transition-colors hover:bg-cream-deep/40">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-deep font-display text-[18px] text-ink-soft">
                    №{String(res.data.indexOf(o) + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="font-display text-[18px] text-ink">{o.reference}</div>
                    <div className="mt-0.5 text-[13px] text-ink-muted">
                      <DateTime iso={o.created_at} /> · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <StatusBadge status={o.status} />
                  <div className="w-20 text-right font-display text-[20px] text-forest">
                    <Money pence={o.total_pence} />
                  </div>
                  <span className="text-[18px] text-ink-muted transition-transform">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
