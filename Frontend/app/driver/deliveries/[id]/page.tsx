import Link from "next/link";
import { notFound } from "next/navigation";
import { apiServer, ApiRequestError } from "@/lib/api-server";
import type { Order } from "@/lib/types";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import { DateTime } from "@/components/ui/datetime";
import { DeliveryActions } from "@/components/driver/delivery-actions";
import { MapPin, Phone } from "lucide-react";

type Params = Promise<{ id: string }>;

export default async function DeliveryDetail({ params }: { params: Params }) {
  const { id } = await params;
  let order: Order;
  try {
    order = (await apiServer<{ data: Order }>(`/api/v1/driver/deliveries/${id}`)).data;
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) return notFound();
    throw e;
  }

  const mapsQuery = order.address
    ? encodeURIComponent(`${order.address.line1}, ${order.address.city} ${order.address.postcode}`)
    : "";

  return (
    <div>
      <Link
        href="/driver"
        className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-forest"
      >
        ← Runs
      </Link>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-clay">Reference</div>
          <h1 className="mt-2 font-display text-[28px] leading-[1] text-ink">{order.reference}</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.address ? (
        <div className="mt-6 rounded-lg border hairline bg-paper p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Deliver to</div>
              <div className="mt-2 text-[14px] leading-relaxed text-ink">
                {order.address.line1}{order.address.line2 ? <><br />{order.address.line2}</> : null}<br />
                {order.address.city}, <span className="number font-semibold">{order.address.postcode}</span>
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${mapsQuery}`}
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-forest px-4 text-[13px] font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              <MapPin className="h-4 w-4" /> Map
            </a>
          </div>
        </div>
      ) : null}

      {order.customer ? (
        <div className="mt-3 rounded-lg border hairline bg-paper p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Customer</div>
              <div className="mt-2 font-display text-[16px] text-ink">{order.customer.name}</div>
              {order.customer.phone ? <div className="text-[13px] text-ink-soft">{order.customer.phone}</div> : null}
            </div>
            {order.customer.phone ? (
              <a
                href={`tel:${order.customer.phone}`}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border hairline bg-cream px-4 text-[13px] font-medium text-ink transition-colors hover:border-ink/30"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {order.delivery_window_start && order.delivery_window_end ? (
        <div className="mt-3 rounded-lg border hairline bg-paper p-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Delivery window</div>
          <div className="mt-2 text-[14px] text-ink">
            <DateTime iso={order.delivery_window_start} mode="time" /> – <DateTime iso={order.delivery_window_end} mode="time" />
          </div>
        </div>
      ) : null}

      <div className="mt-3 rounded-lg border hairline bg-paper p-5">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">Items</h2>
        <ul className="mt-3 space-y-1.5 text-[13px]">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span className="text-ink"><span className="number">{i.quantity}</span> × {i.name}</span>
              <Money pence={i.line_total_pence} className="text-ink-soft" />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-baseline justify-between border-t hairline pt-3 text-[13px]">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Total</span>
          <Money pence={order.total_pence} className="font-display text-[18px] text-forest" />
        </div>
      </div>

      {order.customer_notes ? (
        <div className="mt-3 rounded-lg border border-clay/30 bg-[#FBEFE8] p-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-clay">Customer notes</div>
          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink">{order.customer_notes}</p>
        </div>
      ) : null}

      <div className="mt-7">
        <DeliveryActions orderId={order.id} status={order.status} />
      </div>
    </div>
  );
}
