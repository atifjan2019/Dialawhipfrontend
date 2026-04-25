import Link from "next/link";
import { notFound } from "next/navigation";
import { apiServer, ApiRequestError } from "@/lib/api-server";
import type { Order, User } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateTime } from "@/components/ui/datetime";
import { OrderActions } from "@/components/admin/order-actions";
import { AssignDriver } from "@/components/admin/assign-driver";
import { OrderTimeline } from "@/components/admin/order-timeline";
import { PaymentPanel } from "@/components/admin/payment-panel";
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

  // Available drivers for assignment.
  const driversRes = await apiServer<{ data: User[] }>("/api/v1/admin/drivers")
    .catch(() => ({ data: [] as User[] }));

  return (
    <div className="mx-auto max-w-[1280px] px-10 py-10">
      <Link href="/admin/orders" className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest">
        ← All orders
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <Eyebrow>Order</Eyebrow>
          <h1 className="mt-4 font-display text-[42px] leading-[1] text-ink">{order.reference}</h1>
          <div className="mt-3 text-[13px] text-ink-muted"><DateTime iso={order.created_at} /></div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          {order.payment ? <PaymentPill status={order.payment.status} /> : null}
        </div>
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
                  <div className="flex-1">
                    <span className="font-medium text-ink">{i.quantity} ×</span> <span className="text-ink-soft">{i.name}</span>
                    {i.variant_label ? (
                      <span className="ml-1 text-[11px] uppercase tracking-[0.12em] text-clay">· {i.variant_label}</span>
                    ) : null}
                  </div>
                  <Money pence={i.line_total_pence} className="text-ink" />
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t hairline px-6 py-5 text-[13px]">
              <Row label="Subtotal"><Money pence={order.subtotal_pence} /></Row>
              <Row label={`Delivery${order.delivery_tier ? ` (${order.delivery_tier})` : ""}`}><Money pence={order.delivery_fee_pence} /></Row>
              {order.vat_pence > 0 ? <Row label="VAT"><Money pence={order.vat_pence} /></Row> : null}
              <div className="mt-2 flex justify-between border-t hairline pt-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Total</span>
                <Money pence={order.total_pence} className="font-display text-[22px] text-forest" />
              </div>
            </div>
          </section>

          {order.customer_notes ? (
            <section className="rounded-lg border hairline bg-paper p-6">
              <h2 className="font-display text-[14px] italic text-clay">Customer notes</h2>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">{order.customer_notes}</p>
            </section>
          ) : null}

          {order.driver_notes ? (
            <section className="rounded-lg border hairline bg-paper p-6">
              <h2 className="font-display text-[14px] italic text-clay">Driver log</h2>
              <pre className="mt-2 whitespace-pre-line font-mono text-[12px] leading-relaxed text-ink-soft">{order.driver_notes}</pre>
            </section>
          ) : null}

          <PaymentPanel orderId={order.id} payment={order.payment ?? null} />

          <section className="rounded-lg border hairline bg-paper p-6">
            <h2 className="font-display text-[18px] text-ink">Activity</h2>
            <div className="mt-5">
              <OrderTimeline events={order.events ?? []} />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border hairline bg-paper p-6">
            <h2 className="font-display text-[14px] italic text-clay">Actions</h2>
            <div className="mt-3">
              <OrderActions orderId={order.id} status={order.status} />
            </div>
          </div>

          <div className="rounded-lg border hairline bg-paper p-6">
            <AssignDriver orderId={order.id} drivers={driversRes.data} current={order.driver ?? null} />
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

function PaymentPill({ status }: { status: "paid" | "unpaid" | "refunded" }) {
  const cls =
    status === "paid"
      ? "bg-[#DCE6DB] text-forest-deep ring-moss/40"
      : status === "refunded"
      ? "bg-cream-deep text-ink-muted ring-line"
      : "bg-[#F3D4CC] text-[#8B2A1D] ring-[#C87863]/40";
  const label = status === "paid" ? "Paid" : status === "refunded" ? "Refunded" : "Unpaid";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ring-1 ring-inset ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
