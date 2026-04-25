"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/lib/cart";
import { Minus, Plus } from "lucide-react";

export function AddToCart({ item }: { item: Omit<CartItem, "quantity"> }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-13 items-center rounded-full border hairline bg-paper">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-13 w-13 items-center justify-center text-ink-soft transition-colors hover:text-forest"
          aria-label="Decrease"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center text-[15px] font-medium tabular-nums">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="flex h-13 w-13 items-center justify-center text-ink-soft transition-colors hover:text-forest"
          aria-label="Increase"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          add(item, qty);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="inline-flex h-13 flex-1 items-center justify-center rounded-full bg-forest px-7 text-[14px] font-medium text-cream transition-colors hover:bg-forest-deep"
      >
        {added ? "Added to bag ✓" : `Add ${qty} to bag — `}
        {added ? null : <span className="ml-0.5 opacity-80">£{((item.unit_price_pence * qty) / 100).toFixed(2)}</span>}
      </button>
    </div>
  );
}
