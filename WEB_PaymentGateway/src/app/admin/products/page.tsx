"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  createdAt?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products", { credentials: "include" });
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) load();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Products</h1>
        <Link
          href="/admin/products/add"
          className="px-3 py-2 rounded bg-blue-600 text-white"
        >
          Add Product
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Slug</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.slug}</td>
                <td className="p-2">{p.price}</td>
                <td className="p-2 space-x-2">
                  <Link
                    href={`/admin/products/${p._id}`}
                    className="text-blue-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(p._id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={4}>
                  No products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
