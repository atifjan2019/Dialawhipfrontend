import Link from "next/link";
import { apiServer } from "@/lib/api-server";
import type { Order, Paginated } from "@/lib/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Eyebrow } from "@/components/shop/eyebrow";

export default async function DriverDashboard() {
  const res = await apiServer<Paginated<Order>>("/api/v1/driver/deliveries")
    .catch(() => ({ data: [], meta: { next_cursor: null, prev_cursor: null } }));

  const active = res.data.filter((o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "refunded");
  const done = res.data.filter((o) => o.status === "delivered");

  return (
    <div>
      <Eyebrow>Today</Eyebrow>
      <h1 className="mt-3 font-display text-[34px] leading-[1.05] text-ink">Your runs</h1>
      <p className="mt-2 text-[13px] text-ink-muted">
        <span className="number">{active.length}</span> active · <span className="number">{done.length}</span> completed
      </p>

      <section className="mt-7">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-clay">Active</h2>
        <ul className="mt-3 space-y-2.5">
          {active.length === 0 ? (
            <li className="rounded-lg border hairline bg-paper p-6 text-center text-[13px] italic text-ink-muted">
              No active deliveries.
            </li>
          ) : null}
          {active.map((o) => (
            <li key={o.id}>
              <Link
                href={`/driver/deliveries/${o.id}`}
                className="block rounded-lg border hairline bg-paper p-4 transition-colors hover:border-ink/30 active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-display text-[16px] text-ink">{o.reference}</div>
                    {o.address ? (
                      <div className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                        {o.address.line1}
                        <span className="text-ink-muted"> · </span>
                        <span className="number font-medium">{o.address.postcode}</span>
                      </div>
                    ) : null}
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {done.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-ink-muted">Completed today</h2>
          <ul className="mt-3 space-y-2">
            {done.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/driver/deliveries/${o.id}`}
                  className="block rounded-lg border hairline bg-paper px-4 py-3 text-[13px] opacity-70 transition-opacity hover:opacity-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[14px] text-ink">{o.reference}</span>
                    <StatusBadge status={o.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
