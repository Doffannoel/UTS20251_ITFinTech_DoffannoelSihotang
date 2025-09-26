"use client";

import { CartProvider } from "@/lib/cartcontext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
