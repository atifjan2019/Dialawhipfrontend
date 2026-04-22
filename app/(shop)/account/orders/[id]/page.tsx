import Link from "next/link";
import { notFound } from "next/navigation";
import { apiServer, ApiRequestError } from "@/lib/api-server";
import type { Order } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateTime } from "@/components/ui/datetime";
import { Eyebrow } from "@/components/shop/eyebrow";

type Params = Promise<{ id: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  let order: Order;
  try {
    const res = await apiServer<{ data: Order }>(`/api/v1/me/orders/${id}`);
    order = res.data;
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) return notFound();
    throw e;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href="/account/orders" className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest">
        ← All orders
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <Eyebrow>Order</Eyebrow>
          <h1 className="mt-4 font-display text-[42px] leading-[1] text-ink md:text-[56px]">
            {order.reference}
          </h1>
          <div className="mt-3 text-[13px] text-ink-muted">
            Placed <DateTime iso={order.created_at} />
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-lg border hairline bg-paper">
            <header className="flex items-center justify-between border-b hairline px-6 py-4">
              <h2 className="font-display text-[18px] text-ink">Items</h2>
              <span className="text-[12px] text-ink-muted">{order.items.length} line{order.items.length === 1 ? "" : "s"}</span>
            </header>
            <ul className="divide-y hairline">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <div className="font-display text-[16px] text-ink">{i.name}</div>
                    <div className="mt-0.5 text-[12px] text-ink-muted">
                      Qty <span className="number">{i.quantity}</span> · <Money pence={i.unit_price_pence} /> each
                    </div>
                  </div>
                  <Money pence={i.line_total_pence} className="text-[14px] text-ink" />
                </li>
              ))}
            </ul>
          </section>

          {order.notes ? (
            <section className="rounded-lg border hairline bg-paper p-6">
              <h2 className="font-display text-[14px] italic text-clay">A note from you</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft whitespace-pre-line">{order.notes}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-5">
          {order.address ? (
            <div className="rounded-lg border hairline bg-paper p-6">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Delivering to</div>
              <div className="mt-3 text-[14px] leading-relaxed text-ink">
                <div className="font-medium">{order.address.label ?? "Address"}</div>
                <div className="mt-1 text-ink-soft">
                  {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                  {order.address.city}, {order.address.postcode}
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border hairline bg-paper p-6">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Totals</div>
            <div className="mt-4 space-y-2 text-[13px]">
              <Row label="Subtotal"><Money pence={order.subtotal_pence} /></Row>
              <Row label="Delivery"><Money pence={order.delivery_fee_pence} /></Row>
              {order.vat_pence > 0 ? <Row label="VAT"><Money pence={order.vat_pence} /></Row> : null}
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t hairline pt-5">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Total</span>
              <Money pence={order.total_pence} className="font-display text-[24px] text-forest" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="text-ink">{children}</span>
    </div>
  );
}
