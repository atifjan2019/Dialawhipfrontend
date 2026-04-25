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
        <div className="mx-auto max-w-2xl px-6 py-28 text-center text-ink-muted">
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
      <div className="text-center">
        <Eyebrow className="justify-center">Confirmed</Eyebrow>
        <div className="mt-7 inline-flex h-20 w-20 items-center justify-center rounded-full bg-success text-paper">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mt-7 text-[44px] font-extrabold tracking-tight text-ink sm:text-[56px]">
          Thank you kindly.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          Your order is in the oven, so to speak. A confirmation is on its way to your inbox.
        </p>

        {polling && !order ? (
          <p className="mt-6 text-[13px] text-ink-muted">Finalising details…</p>
        ) : null}
      </div>

      {order ? (
        <div className="mt-12 overflow-hidden rounded-2xl border hairline bg-paper">
          <div className="flex items-start justify-between gap-4 border-b hairline p-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">Reference</div>
              <div className="mt-1 font-mono text-[18px] font-bold text-ink">{order.reference}</div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <ul className="divide-y hairline">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-4 p-5">
                <div className="text-[14px]">
                  <span className="font-bold text-ink">{i.quantity} ×</span>{" "}
                  <span className="text-ink-soft">{i.name}</span>
                  {i.variant_label ? (
                    <span className="ml-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">· {i.variant_label}</span>
                  ) : null}
                </div>
                <Money pence={i.line_total_pence} className="text-[14px] text-ink" />
              </li>
            ))}
          </ul>

          <div className="flex items-baseline justify-between bg-surface p-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">Total</span>
            <Money pence={order.total_pence} className="text-[28px] font-extrabold text-ink" />
          </div>
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/account/orders"
          className="inline-flex h-12 items-center rounded-full border hairline bg-paper px-6 text-[14px] font-semibold text-ink transition-colors hover:border-ink/30"
        >
          View my orders
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-12 items-center rounded-full bg-yellow px-6 text-[14px] font-bold text-navy transition-transform hover:-translate-y-0.5"
        >
          Order again
        </Link>
      </div>
    </div>
  );
}
