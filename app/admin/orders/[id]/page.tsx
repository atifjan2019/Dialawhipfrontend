import Link from "next/link";
import { notFound } from "next/navigation";
import { apiServer, ApiRequestError } from "@/lib/api-server";
import type { Order } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateTime } from "@/components/ui/datetime";
import { OrderActions } from "@/components/admin/order-actions";
import { Eyebrow } from "@/components/shop/eyebrow";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetail({ params }: { params: Params }) {
  const { id } = await params;
  let order: Order;
  try {
    order = (await apiServer<{ data: Order }>(`/api/v1/admin/orders/${id}`)).data;
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) return notFound();
    throw e;
  }

  return (
    <div className="mx-auto max-w-6xl px-10 py-10">
      <Link href="/admin/orders" className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest">
        ← All orders
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <Eyebrow>Order</Eyebrow>
          <h1 className="mt-4 font-display text-[42px] leading-[1] text-ink">{order.reference}</h1>
          <div className="mt-3 text-[13px] text-ink-muted"><DateTime iso={order.created_at} /></div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="overflow-hidden rounded-lg border hairline bg-paper">
            <header className="border-b hairline px-6 py-4">
              <h2 className="font-display text-[18px] text-ink">Items</h2>
            </header>
            <ul className="divide-y hairline">
              {order.items.map((i) => (
                <li key={i.id} className="flex justify-between px-6 py-4 text-[13px]">
                  <span className="text-ink-soft"><span className="font-medium text-ink">{i.quantity} ×</span> {i.name}</span>
                  <Money pence={i.line_total_pence} className="text-ink" />
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t hairline px-6 py-5 text-[13px]">
              <Row label="Subtotal"><Money pence={order.subtotal_pence} /></Row>
              <Row label="Delivery"><Money pence={order.delivery_fee_pence} /></Row>
              {order.vat_pence > 0 ? <Row label="VAT"><Money pence={order.vat_pence} /></Row> : null}
              <div className="mt-2 flex justify-between border-t hairline pt-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Total</span>
                <Money pence={order.total_pence} className="font-display text-[22px] text-forest" />
              </div>
            </div>
          </section>

          {order.notes ? (
            <section className="rounded-lg border hairline bg-paper p-6">
              <h2 className="font-display text-[14px] italic text-clay">Customer notes</h2>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">{order.notes}</p>
            </section>
          ) : null}
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border hairline bg-paper p-6">
            <h2 className="font-display text-[14px] italic text-clay">Actions</h2>
            <div className="mt-3">
              <OrderActions orderId={order.id} status={order.status} />
            </div>
          </div>

          <div className="rounded-lg border hairline bg-paper p-6">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Customer</div>
            <div className="mt-3 text-[14px]">
              {order.customer ? (
                <>
                  <div className="font-display text-[18px] text-ink">{order.customer.name}</div>
                  <div className="mt-1 text-ink-muted">{order.customer.email}</div>
                  {order.customer.phone ? <div className="text-ink-muted">{order.customer.phone}</div> : null}
                </>
              ) : "—"}
            </div>
          </div>

          {order.address ? (
            <div className="rounded-lg border hairline bg-paper p-6">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Delivery</div>
              <div className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}<br />
                {order.address.city}, {order.address.postcode}
              </div>
            </div>
          ) : null}
        </div>
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
