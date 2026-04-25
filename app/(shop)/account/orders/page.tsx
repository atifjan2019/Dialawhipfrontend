import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Order, Paginated } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateTime } from "@/components/ui/datetime";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function OrdersPage() {
  const res = await apiServer<Paginated<Order>>("/api/v1/me/orders").catch((): Paginated<Order> => ({
    data: [],
    meta: { next_cursor: null, prev_cursor: null },
  }));

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14">
      <Link
        href="/account"
        className="text-[12px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-brand"
      >
        ← Account
      </Link>
      <div className="mt-8">
        <Eyebrow>History</Eyebrow>
        <h1 className="mt-5 font-display text-[48px] font-bold leading-[1] tracking-tight text-ink md:text-[64px]">
          Your <span className="text-brand">orders.</span>
        </h1>
      </div>

      {res.data.length === 0 ? (
        <div className="mt-16 rounded-3xl bg-yellow p-14 text-center ring-2 ring-ink">
          <p className="font-display text-[28px] font-bold text-ink">No orders yet.</p>
          <p className="mt-3 text-[14px] font-medium text-ink/75">Your first order will appear here.</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-[13px] font-bold text-yellow transition-transform hover:-translate-y-0.5"
          >
            Browse the catalogue →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 overflow-hidden rounded-2xl bg-paper ring-2 ring-ink">
          {res.data.map((o, idx) => (
            <li key={o.id} className={idx > 0 ? "border-t-2 border-ink/10" : ""}>
              <Link
                href={`/account/orders/${o.id}`}
                className="flex items-center justify-between gap-6 p-6 transition-colors hover:bg-yellow"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow font-display text-[16px] font-bold text-ink ring-2 ring-ink">
                    №{String(idx + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="font-display text-[20px] font-bold text-ink">{o.reference}</div>
                    <div className="mt-0.5 text-[13px] font-medium text-ink-muted">
                      <DateTime iso={o.created_at} /> · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <StatusBadge status={o.status} />
                  <div className="w-20 text-right font-display text-[22px] font-bold text-ink">
                    <Money pence={o.total_pence} />
                  </div>
                  <span className="text-[18px] font-bold text-ink-muted" aria-hidden>→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
