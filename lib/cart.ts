"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  product_id: string;
  slug: string;
  name: string;
  unit_price_pence: number;
  image_url: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  postcode: string;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (product_id: string) => void;
  setQuantity: (product_id: string, quantity: number) => void;
  setPostcode: (postcode: string) => void;
  clear: () => void;
  subtotalPence: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      postcode: "",
      add: (item, qty = 1) => {
        const existing = get().items.find((i) => i.product_id === item.product_id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.product_id === item.product_id ? { ...i, quantity: i.quantity + qty } : i,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: qty }] });
        }
      },
      remove: (id) => set({ items: get().items.filter((i) => i.product_id !== id) }),
      setQuantity: (id, q) =>
        set({
          items: q <= 0
            ? get().items.filter((i) => i.product_id !== id)
            : get().items.map((i) => (i.product_id === id ? { ...i, quantity: q } : i)),
        }),
      setPostcode: (postcode) => set({ postcode }),
      clear: () => set({ items: [], postcode: "" }),
      subtotalPence: () => get().items.reduce((s, i) => s + i.unit_price_pence * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    { name: "catering-cart", storage: createJSONStorage(() => localStorage) },
  ),
);
