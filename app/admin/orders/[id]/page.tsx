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

  const driversRes = await apiServer<{ data: User[] }>("/api/v1/admin/drivers")
    .catch(() => ({ data: [] as User[] }));

  // UX prompt — the admin's two big decisions in order:
  //   pending  → "Accept order ✓"  (OrderActions)
  //   confirmed without driver → highlight AssignDriver
  const needsAccept = order.status === "pending";
  const needsDriver = order.status === "confirmed" && !order.driver;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <Link
        href="/admin/orders"
        className="text-[12px] font-bold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-brand"
      >
        ← All orders
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <Eyebrow>Order</Eyebrow>
          <h1 className="mt-4 font-display text-[36px] font-bold leading-[1] tracking-tight text-ink sm:text-[48px]">
            {order.reference}
          </h1>
          <div className="mt-3 text-[13px] font-medium text-ink-muted">
            <DateTime iso={order.created_at} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          {order.payment ? <PaymentPill status={order.payment.status} /> : null}
        </div>
      </div>

      {/* Workflow hint banner */}
      {needsAccept ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-yellow p-5 ring-2 ring-ink">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Action needed</div>
            <div className="mt-1.5 font-display text-[18px] font-bold text-ink">
              New order — accept it to start prep.
            </div>
          </div>
          <span className="text-[12px] font-bold text-ink/70">
            Use <strong>Accept order ✓</strong> on the right →
          </span>
        </div>
      ) : null}
      {needsDriver ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-yellow p-5 ring-2 ring-ink">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Next step</div>
            <div className="mt-1.5 font-display text-[18px] font-bold text-ink">
              Order accepted — assign a driver.
            </div>
          </div>
          <span className="text-[12px] font-bold text-ink/70">
            Pick a driver in the panel on the right →
          </span>
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl bg-paper ring-2 ring-ink/15">
            <header className="border-b-2 border-ink/10 px-6 py-4">
              <h2 className="font-display text-[20px] font-bold text-ink">Items</h2>
            </header>
            <ul>
              {order.items.map((i, idx) => (
                <li
                  key={i.id}
                  className={
                    "flex justify-between gap-4 px-6 py-4 text-[13px] " +
                    (idx > 0 ? "border-t-2 border-ink/10" : "")
                  }
                >
                  <div className="flex-1">
                    <span className="font-display font-bold text-ink">{i.quantity} ×</span>{" "}
                    <span className="font-medium text-ink-soft">{i.name}</span>
                    {i.variant_label ? (
                      <span className="ml-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                        · {i.variant_label}
                      </span>
                    ) : null}
                  </div>
                  <Money pence={i.line_total_pence} className="font-bold text-ink" />
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t-2 border-ink/10 px-6 py-5 text-[13px]">
              <Row label="Subtotal"><Money pence={order.subtotal_pence} /></Row>
              <Row label={`Delivery${order.delivery_tier ? ` (${order.delivery_tier})` : ""}`}>
                <Money pence={order.delivery_fee_pence} />
              </Row>
              {order.vat_pence > 0 ? <Row label="VAT"><Money pence={order.vat_pence} /></Row> : null}
              <div className="mt-2 flex items-baseline justify-between border-t-2 border-ink/15 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Total</span>
                <Money pence={order.total_pence} className="font-display text-[28px] font-bold text-ink" />
              </div>
            </div>
          </section>

          {order.customer_notes ? (
            <section className="rounded-2xl bg-paper p-6 ring-2 ring-ink/15">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Customer notes</h2>
              <p className="mt-3 whitespace-pre-line text-[14px] font-medium leading-relaxed text-ink-soft">
                {order.customer_notes}
              </p>
            </section>
          ) : null}

          {order.driver_notes ? (
            <section className="rounded-2xl bg-paper p-6 ring-2 ring-ink/15">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Driver log</h2>
              <pre className="mt-3 whitespace-pre-line font-mono text-[12px] leading-relaxed text-ink-soft">
                {order.driver_notes}
              </pre>
            </section>
          ) : null}

          <PaymentPanel orderId={order.id} payment={order.payment ?? null} />

          <section className="rounded-2xl bg-paper p-6 ring-2 ring-ink/15">
            <h2 className="font-display text-[20px] font-bold text-ink">Activity</h2>
            <div className="mt-5">
              <OrderTimeline events={order.events ?? []} />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <div
            className={
              needsAccept
                ? "rounded-2xl bg-paper p-6 ring-2 ring-ink"
                : "rounded-2xl bg-paper p-6 ring-2 ring-ink/15"
            }
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Actions</h2>
            <div className="mt-4">
              <OrderActions orderId={order.id} status={order.status} />
            </div>
          </div>

          <div
            className={
              needsDriver
                ? "rounded-2xl bg-paper p-6 ring-2 ring-ink"
                : "rounded-2xl bg-paper p-6 ring-2 ring-ink/15"
            }
          >
            <AssignDriver
              orderId={order.id}
              drivers={driversRes.data}
              current={order.driver ?? null}
              highlight={needsDriver}
            />
          </div>

          <div className="rounded-2xl bg-paper p-6 ring-2 ring-ink/15">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Customer</div>
            <div className="mt-3">
              {order.customer ? (
                <>
                  <div className="font-display text-[18px] font-bold text-ink">{order.customer.name}</div>
                  <div className="mt-1 text-[13px] font-medium text-ink-muted">{order.customer.email}</div>
                  {order.customer.phone ? (
                    <div className="text-[13px] font-medium text-ink-muted">{order.customer.phone}</div>
                  ) : null}
                </>
              ) : (
                "—"
              )}
            </div>
          </div>

          {order.address ? (
            <div className="rounded-2xl bg-paper p-6 ring-2 ring-ink/15">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Delivery</div>
              <div className="mt-3 text-[14px] font-medium leading-relaxed text-ink-soft">
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
    <div className="flex justify-between font-medium">
      <span className="text-ink-muted">{label}</span>
      <span className="font-bold text-ink">{children}</span>
    </div>
  );
}

function PaymentPill({ status }: { status: "paid" | "unpaid" | "refunded" }) {
  const cls =
    status === "paid"
      ? "bg-ink text-yellow"
      : status === "refunded"
      ? "bg-paper text-ink-muted ring-2 ring-ink/15"
      : "bg-yellow text-ink ring-2 ring-ink";
  const label = status === "paid" ? "Paid" : status === "refunded" ? "Refunded" : "Unpaid";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
