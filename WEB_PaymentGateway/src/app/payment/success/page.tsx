"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/store/useCart";

export default function Success() {
  const params = useSearchParams();
  const invoiceId = params?.get("invoice_id") || undefined;
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <main className="container p-8">
      <h1 className="text-2xl font-semibold mb-2">Payment Success 🎉</h1>
      {invoiceId && (
        <p className="text-sm text-neutral-600">Invoice: {invoiceId}</p>
      )}
      <p className="mt-4">Terima kasih! Pembayaran kamu sudah diterima.</p>
    </main>
  );
}
