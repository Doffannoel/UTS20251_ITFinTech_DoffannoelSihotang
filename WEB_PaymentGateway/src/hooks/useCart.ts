"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  slug: string;
  name: string;
  price: number; // per item
  image: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item, qty = 1) => {
        const exists = get().items.find((i) => i.slug === item.slug);
        if (exists) {
          set({
            items: get().items.map((i) =>
              i.slug === item.slug ? { ...i, qty: i.qty + qty } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, qty }] });
        }
      },
      setQty: (slug, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.slug !== slug) });
        } else {
          set({
            items: get().items.map((i) =>
              i.slug === slug ? { ...i, qty } : i
            ),
          });
        }
      },
      remove: (slug) =>
        set({ items: get().items.filter((i) => i.slug !== slug) }),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: "hotkicks-cart" }
  )
);
