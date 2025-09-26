"use client";
import { useSearchParams } from "next/navigation";

export default function Failed() {
  const params = useSearchParams();
  const invoiceId = params?.get("invoice_id") || undefined;

  return (
    <main className="container p-8">
      <h1 className="text-2xl font-semibold mb-2">Payment Failed</h1>
      {invoiceId && (
        <p className="text-sm text-neutral-600">Invoice: {invoiceId}</p>
      )}
      <p className="mt-4">Maaf, pembayaran gagal atau dibatalkan.</p>
    </main>
  );
}
