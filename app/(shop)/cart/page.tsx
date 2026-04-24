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
      .then((r) => { setPricing(r.data); setError(null); })
      .catch((e: unknown) => {
        if (e instanceof ApiRequestError) setError(e.body.message);
        else if ((e as Error).name !== "AbortError") setError("Could not price cart.");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [items, postcode]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center">
        <Eyebrow className="justify-center">Your bag</Eyebrow>
        <h1 className="mt-8 font-display text-[56px] leading-[1] text-ink md:text-[72px]">
          <span className="italic font-light text-forest">Nothing</span> here yet.
        </h1>
        <p className="mt-6 text-[15px] leading-relaxed text-ink-muted">
          Your bag is empty. Why not peek at the menu?
        </p>
        <Link
          href="/menu"
          className="mt-10 inline-flex h-13 items-center rounded-full bg-forest px-8 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          Browse the menu →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14">
      <Eyebrow>Your bag</Eyebrow>
      <h1 className="mt-5 font-display text-[48px] leading-[1] text-ink md:text-[64px]">
        Let's <span className="italic font-light text-forest">go over</span> your order
      </h1>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y hairline overflow-hidden rounded-lg border hairline bg-paper">
          {items.map((i, idx) => (
            <li key={`${i.product_id}::${i.variant_id ?? ""}`} className="flex items-center gap-5 p-5">
              <div
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md paper-grain"
                style={{ backgroundColor: idx % 2 === 0 ? "#E6DCC6" : "#DCE6DB" }}
              >
                <span className="font-display text-[42px] italic font-light leading-none text-ink/80">
                  {i.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <Link href={`/products/${i.slug}`} className="font-display text-[19px] leading-tight text-ink hover:text-forest">
                  {i.name}
                </Link>
                {i.variant_label ? (
                  <div className="mt-0.5 text-[12px] font-medium uppercase tracking-[0.12em] text-clay">
                    {i.variant_label}
                  </div>
                ) : null}
                <div className="mt-1 text-[13px] text-ink-muted">
                  <Money pence={i.unit_price_pence} /> {i.variant_id ? "each" : "per serving"}
                </div>
              </div>
              <div className="flex h-10 items-center rounded-full border hairline bg-cream">
                <button
                  className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:text-forest"
                  onClick={() => setQuantity(i.product_id, i.quantity - 1, i.variant_id ?? null)}
                  aria-label="Decrease"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-7 text-center text-[14px] font-medium tabular-nums">{i.quantity}</span>
                <button
                  className="flex h-10 w-10 items-center justify-center text-ink-soft transition-colors hover:text-forest"
                  onClick={() => setQuantity(i.product_id, i.quantity + 1, i.variant_id ?? null)}
                  aria-label="Increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <Money pence={i.unit_price_pence * i.quantity} className="w-20 text-right text-[15px] font-medium text-forest" />
              <button
                onClick={() => remove(i.product_id, i.variant_id ?? null)}
                className="text-ink-muted transition-colors hover:text-clay"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-6">
          <div className="rounded-lg border hairline bg-paper p-6">
            <h2 className="font-display text-[22px] leading-tight text-ink">Order summary</h2>

            <div className="mt-5 space-y-2">
              <Label htmlFor="postcode">Delivery postcode</Label>
              <Input
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                placeholder="NE1 4AB"
              />
              <p className="text-[12px] text-ink-muted">We'll check this postcode is in our delivery area.</p>
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
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Total</span>
              <Money pence={pricing?.total_pence ?? items.reduce((s, i) => s + i.unit_price_pence * i.quantity, 0)} className="font-display text-[28px] text-forest" />
            </div>

            {error ? <p className="mt-4 rounded-md bg-[#F3D4CC] px-3 py-2 text-[13px] text-[#8B2A1D]">{error}</p> : null}
            {loading ? <p className="mt-4 text-[12px] text-ink-muted">Pricing…</p> : null}

            <Link
              href="/checkout"
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-forest px-6 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep aria-disabled:opacity-50"
              aria-disabled={!pricing || !!error}
            >
              Continue to checkout →
            </Link>
          </div>

          <div className="rounded-lg border hairline bg-cream-deep/50 p-5 text-[12px] leading-relaxed text-ink-muted">
            <span className="font-display text-[14px] italic text-clay">A note —</span> orders require 24 hours' notice. You'll pick your delivery window at checkout.
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
