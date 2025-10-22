"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/admin/products/${id}`, {
        credentials: "include",
      });
      const data = await res.json();
      setForm({ ...data.product, price: String(data.product?.price ?? "") });
    })();
  }, [id]);

  if (!id) return <div className="p-6">Product ID not found</div>;
  if (!form) return <div className="p-6">Loading...</div>;

  async function uploadOne(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url as string;
  }

  async function onUploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadOne(file);
      setForm((f: any) => ({ ...f, image: url }));
    } finally {
      setUploading(false);
    }
  }

  async function onUploadGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      setUploading(true);
      const urls = await Promise.all(files.map(uploadOne));
      setForm((f: any) => ({ ...f, images: [...(f.images || []), ...urls] }));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = Number(String(form.price).replace(/[^\d.]/g, ""));
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      alert("Harga harus berupa angka > 0");
      return;
    }

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, price: priceNum }),
    });
    const data = await res.json();
    if (res.ok) router.push("/admin/products");
    else alert(data.message || "Gagal update");
  }

  async function onDelete() {
    if (!confirm("Hapus produk ini?")) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) router.push("/admin/products");
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Nama Sepatu</label>
          <input
            className="border p-2 w-full"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Harga (Rp)</label>
          <input
            type="number"
            inputMode="decimal"
            className="border p-2 w-full"
            value={form.price ?? ""}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            min={0}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Kategori</label>
          <select
            className="border p-2 w-full"
            value={form.category || "Men's shoes"}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option>Men's shoes</option>
            <option>Women's shoes</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Cover Image (upload)</label>
          <input type="file" accept="image/*" onChange={onUploadCover} />
          {uploading && (
            <div className="text-sm text-gray-500 mt-1">Uploading...</div>
          )}
          {form.image && (
            <img
              src={form.image}
              alt="cover"
              className="mt-2 h-28 rounded border"
            />
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Gallery Images (upload banyak)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onUploadGallery}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {(form.images || []).map((u: string) => (
              <img
                key={u}
                src={u}
                alt="gallery"
                className="h-20 rounded border"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Deskripsi</label>
          <textarea
            className="border p-2 w-full"
            rows={4}
            value={form.overview || ""}
            onChange={(e) => setForm({ ...form, overview: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!form.justIn}
            onChange={(e) => setForm({ ...form, justIn: e.target.checked })}
          />
          Just In
        </label>

        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            disabled={uploading}
          >
            Update
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
