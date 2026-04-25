"use client";

import { useMemo, useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { Minus, Plus } from "lucide-react";
import { Money } from "@/components/ui/money";
import type { Product, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/cn";

type BaseItem = Omit<CartItem, "quantity" | "variant_id" | "variant_label" | "unit_price_pence">;

export function ProductBuyBox({ product, base }: { product: Product; base: BaseItem }) {
  const variants: ProductVariant[] = useMemo(
    () => (product.variants ?? []).filter((v) => v.is_active).slice().sort((a, b) => a.sort_order - b.sort_order || a.price_pence - b.price_pence),
    [product.variants],
  );

  const [selectedId, setSelectedId] = useState<string | null>(variants[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  const selected = selectedId ? variants.find((v) => v.id === selectedId) ?? null : null;
  const unitPrice = selected ? selected.price_pence : product.price_pence;
  const lineTotal = unitPrice * qty;

  function onAdd() {
    const cartItem: Omit<CartItem, "quantity"> = {
      ...base,
      unit_price_pence: unitPrice,
      variant_id: selected?.id ?? null,
      variant_label: selected?.label ?? null,
    };
    add(cartItem, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-5">
      {variants.length > 0 ? (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
            Pick an option
          </div>
          <div className="mt-3 grid gap-2.5">
            {variants.map((v) => {
              const isActive = v.id === selectedId;
              const outOfStock = typeof v.stock_count === "number" && v.stock_count <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => setSelectedId(v.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50",
                    isActive
                      ? "border-brand bg-paper shadow-[0_4px_14px_-8px_rgba(0,79,176,0.35)]"
                      : "hairline bg-paper hover:border-ink/25",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                        isActive ? "border-brand bg-brand" : "border-ink/25 bg-paper",
                      )}
                    >
                      {isActive ? <span className="h-2 w-2 rounded-full bg-paper" /> : null}
                    </span>
                    <div>
                      <div className="text-[15px] font-bold text-ink">{v.label}</div>
                      <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                        {v.qty_multiplier > 1 ? `${v.qty_multiplier} units` : "Single unit"}
                        {outOfStock ? " · Out of stock" : null}
                      </div>
                    </div>
                  </div>
                  <Money pence={v.price_pence} className="text-[18px] font-extrabold text-ink" />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="flex h-12 items-center rounded-full border hairline bg-paper">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-12 w-12 items-center justify-center text-ink-soft transition-colors hover:text-brand"
            aria-label="Decrease"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-[15px] font-bold tabular-nums">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-12 w-12 items-center justify-center text-ink-soft transition-colors hover:text-brand"
            aria-label="Increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-navy px-7 text-[14px] font-semibold text-paper transition-colors hover:bg-brand"
        >
          {added ? (
            <span>Added to bag ✓</span>
          ) : (
            <>
              <span>Add {qty} to bag</span>
              <span className="opacity-70">·</span>
              <span className="font-extrabold">£{(lineTotal / 100).toFixed(2)}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
