"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { Money } from "@/components/ui/money";
import { Input, Label } from "@/components/ui/input";
import { apiClient, ApiRequestError } from "@/lib/api-client";
import { Trash2, Minus, Plus } from "lucide-react";
import type { PricingResult } from "@/lib/types";
import { Eyebrow } from "@/components/shop/eyebrow";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const postcode = useCart((s) => s.postcode);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const setPostcode = useCart((s) => s.setPostcode);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shopClosed, setShopClosed] = useState<{ message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setPricing(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    apiClient<{ data: PricingResult }>("/api/v1/checkout/preview", {
      method: "POST",
      json: {
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id ?? null,
          quantity: i.quantity,
        })),
        postcode: postcode || null,
      },
      signal: ctrl.signal,
    })
      .then((r) => {
        if (ctrl.signal.aborted) return;
        setPricing(r.data); setError(null); setShopClosed(null);
      })
      .catch((e: unknown) => {
        // React strict-mode runs effects twice in dev; the cleanup aborts the
        // first fetch. Treat any abort as a no-op so it never surfaces.
        if (ctrl.signal.aborted) return;
        if (e instanceof ApiRequestError) {
          if (e.body.code === "shop_closed") {
            setShopClosed({ message: e.body.message || "We are not accepting orders right now." });
            setError(null);
          } else {
            setShopClosed(null);
            setError(e.body.message);
          }
        } else {
          setError("Could not price cart.");
        }
      })
      .finally(() => {
        if (ctrl.signal.aborted) return;
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [items, postcode]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center">
        <Eyebrow className="justify-center">Your bag</Eyebrow>
        <h1 className="mt-5 text-[44px] font-extrabold tracking-tight text-ink sm:text-[56px]">
          Nothing here yet.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
          Your bag is empty. Why not peek at the menu?
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-yellow px-8 text-[14px] font-bold text-navy transition-transform hover:-translate-y-0.5"
        >
          Browse the menu →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14">
      <Eyebrow>Your bag</Eyebrow>
      <h1 className="mt-3 text-[36px] font-extrabold tracking-tight text-ink sm:text-[48px]">
        Let&apos;s go over your order.
      </h1>

      {shopClosed ? (
        <div className="mt-8 rounded-2xl border border-danger/25 bg-danger-soft p-4 text-[13px] leading-relaxed text-ink" role="alert">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-danger text-[12px] font-bold text-paper">!</span>
            <div>
              <strong className="block text-[14px] font-semibold text-ink">Shop is currently closed</strong>
              <span className="mt-1 block text-ink-soft">{shopClosed.message}</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y hairline overflow-hidden rounded-2xl border hairline bg-paper">
          {items.map((i) => (
            <li key={`${i.product_id}::${i.variant_id ?? ""}`} className="flex items-center gap-5 p-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl product-stripe bg-cream">
                <span className="font-mono text-[10px] tracking-[0.1em] text-ink-faint">
                  {i.name.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <Link href={`/products/${i.slug}`} className="text-[16px] font-bold leading-tight text-ink hover:text-brand">
                  {i.name}
                </Link>
                {i.variant_label ? (
                  <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
                    {i.variant_label}
                  </div>
                ) : null}
                <div className="mt-1 text-[13px] text-ink-muted">
                  <Money pence={i.unit_price_pence} /> {i.variant_id ? "each" : "per serving"}
                </div>
              </div>
              <div className="flex h-10 items-center rounded-full border hairline bg-paper">
                <button
                  className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:text-brand"
                  onClick={() => setQuantity(i.product_id, i.quantity - 1, i.variant_id ?? null)}
                  aria-label="Decrease"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-7 text-center text-[14px] font-bold tabular-nums">{i.quantity}</span>
                <button
                  className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:text-brand"
                  onClick={() => setQuantity(i.product_id, i.quantity + 1, i.variant_id ?? null)}
                  aria-label="Increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <Money pence={i.unit_price_pence * i.quantity} className="w-20 text-right text-[15px] font-extrabold text-ink" />
              <button
                onClick={() => remove(i.product_id, i.variant_id ?? null)}
                className="text-ink-muted transition-colors hover:text-danger"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-4">
          <div className="rounded-2xl border hairline bg-paper p-6">
            <h2 className="text-[18px] font-bold text-ink">Order summary</h2>

            <div className="mt-5 space-y-2">
              <Label htmlFor="postcode">Delivery postcode</Label>
              <Input
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                placeholder="NE1 4AB"
              />
              <p className="text-[12px] text-ink-muted">We&apos;ll check this postcode is in our delivery area.</p>
            </div>

            <div className="mt-6 space-y-2.5 text-[14px]">
              <Row label="Subtotal">
                <Money pence={pricing?.subtotal_pence ?? items.reduce((s, i) => s + i.unit_price_pence * i.quantity, 0)} />
              </Row>
              <Row label="Delivery">
                <Money pence={pricing?.delivery_fee_pence ?? 0} />
              </Row>
              {pricing && pricing.vat_pence > 0 ? (
                <Row label="VAT">
                  <Money pence={pricing.vat_pence} />
                </Row>
              ) : null}
            </div>

            <div className="mt-5 flex items-baseline justify-between border-t hairline pt-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">Total</span>
              <Money
                pence={pricing?.total_pence ?? items.reduce((s, i) => s + i.unit_price_pence * i.quantity, 0)}
                className="text-[28px] font-extrabold text-ink"
              />
            </div>

            {error ? (
              <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger">{error}</p>
            ) : null}
            {loading ? <p className="mt-4 text-[12px] text-ink-muted">Pricing…</p> : null}

            {shopClosed ? (
              <button
                type="button"
                disabled
                className="mt-6 inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-surface px-6 text-[13px] font-semibold text-ink-muted"
              >
                Shop closed — try again later
              </button>
            ) : (
              <Link
                href="/checkout"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-yellow px-6 text-[14px] font-bold text-navy transition-transform hover:-translate-y-0.5 aria-disabled:opacity-50"
                aria-disabled={!pricing || !!error}
              >
                Continue to checkout →
              </Link>
            )}
          </div>

          <div className="rounded-2xl border hairline bg-surface p-5 text-[12px] leading-relaxed text-ink-muted">
            <strong className="font-semibold text-ink">A note —</strong> orders require 24 hours&apos; notice. You&apos;ll pick your delivery window at checkout.
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
