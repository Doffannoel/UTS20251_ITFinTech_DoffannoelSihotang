"use client";
import { createContext, useContext, useState } from "react";
import type { ProductType } from "@/data/types";

type CartItem = ProductType & { quantity: number };

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: ProductType) => void;
  removeFromCart: (slug: string) => void;
  increaseQty: (slug: string) => void;
  decreaseQty: (slug: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: ProductType) => {
    setCart((prev) => {
      const exist = prev.find((p) => p.slug === product.slug);
      if (exist) {
        return prev.map((p) =>
          p.slug === product.slug ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (slug: string) =>
    setCart((prev) => prev.filter((p) => p.slug !== slug));

  const increaseQty = (slug: string) =>
    setCart((prev) =>
      prev.map((p) =>
        p.slug === slug ? { ...p, quantity: p.quantity + 1 } : p
      )
    );

  const decreaseQty = (slug: string) =>
    setCart((prev) =>
      prev.map((p) =>
        p.slug === slug && p.quantity > 1
          ? { ...p, quantity: p.quantity - 1 }
          : p
      )
    );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, increaseQty, decreaseQty }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
