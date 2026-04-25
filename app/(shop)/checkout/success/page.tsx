"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Order } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { Eyebrow } from "@/components/shop/eyebrow";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-6 py-28 text-center font-medium text-ink-muted">
          Finalising your order…
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}

function SuccessInner() {
  const sessionId = useSearchParams().get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [polling, setPolling] = useState(true);
  const clearCart = useCart((s) => s.clear);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let attempts = 0;
    async function poll(): Promise<void> {
      if (cancelled) return;
      attempts++;
      const res = await apiClient<{ data: Order | { status: "pending" } }>(
        `/api/v1/checkout/confirm/${sessionId}`,
      ).catch(() => null);
      if (cancelled) return;
      if (res && "id" in res.data) {
        setOrder(res.data);
        setPolling(false);
        clearCart();
        return;
      }
      if (attempts < 10) setTimeout(poll, 1500);
      else setPolling(false);
    }
    poll();
    return () => { cancelled = true; };
  }, [sessionId, clearCart]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="rounded-3xl bg-yellow p-10 text-center ring-2 ring-ink md:p-14">
        <Eyebrow className="justify-center">Confirmed</Eyebrow>
        <div className="mt-7 inline-flex h-20 w-20 items-center justify-center rounded-full bg-ink text-yellow">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mt-7 font-display text-[44px] font-bold leading-[1] tracking-tight text-ink sm:text-[60px]">
          Thank you kindly.
        </h1>
        <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink/80">
          Your order is in the oven, so to speak. A confirmation is on its way to your inbox.
        </p>

        {polling && !order ? (
          <p className="mt-6 text-[13px] font-medium text-ink/60">Finalising details…</p>
        ) : null}
      </div>

      {order ? (
        <div className="mt-10 overflow-hidden rounded-2xl bg-paper ring-2 ring-ink">
          <div className="flex items-start justify-between gap-4 border-b-2 border-ink/10 p-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Reference</div>
              <div className="mt-1 font-display text-[22px] font-bold text-ink">{order.reference}</div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <ul>
            {order.items.map((i, idx) => (
              <li
                key={i.id}
                className={
                  "flex items-start justify-between gap-4 p-5 " +
                  (idx > 0 ? "border-t-2 border-ink/10" : "")
                }
              >
                <div className="text-[14px]">
                  <span className="font-display font-bold text-ink">{i.quantity} ×</span>{" "}
                  <span className="font-medium text-ink-soft">{i.name}</span>
                  {i.variant_label ? (
                    <span className="ml-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                      · {i.variant_label}
                    </span>
                  ) : null}
                </div>
                <Money pence={i.line_total_pence} className="font-display text-[15px] font-bold text-ink" />
              </li>
            ))}
          </ul>

          <div className="flex items-baseline justify-between bg-yellow p-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Total</span>
            <Money pence={order.total_pence} className="font-display text-[32px] font-bold text-ink" />
          </div>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/account/orders"
          className="inline-flex h-12 items-center rounded-full border-2 border-ink bg-paper px-6 text-[14px] font-bold text-ink transition-colors hover:bg-yellow"
        >
          View my orders
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[14px] font-bold text-yellow transition-transform hover:-translate-y-0.5"
        >
          Order again
        </Link>
      </div>
    </div>
  );
}
