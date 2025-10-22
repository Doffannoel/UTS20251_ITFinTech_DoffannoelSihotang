"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    price: "", // string biar tidak tampil "0"
    image: "", // URL cover (hasil upload lokal)
    images: [] as string[], // URL gallery
    category: "Men's shoes",
    overview: "",
    justIn: false,
  });
  const [uploading, setUploading] = useState(false);

  async function uploadOne(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url as string; // ex: /uploads/xxx.png
  }

  async function onUploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadOne(file);
      setForm((f) => ({ ...f, image: url }));
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
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
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
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...form, price: priceNum }),
    });
    const data = await res.json();
    if (res.ok) router.push("/admin/products");
    else alert(data.message || "Gagal menyimpan");
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Nama Sepatu</label>
          <input
            className="border p-2 w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Contoh: SB Low Brown"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Harga (Rp)</label>
          <input
            type="number"
            inputMode="decimal"
            className="border p-2 w-full"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="cth: 1750000"
            min={0}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Kategori</label>
          <select
            className="border p-2 w-full"
            value={form.category}
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
            {form.images.map((u) => (
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
            value={form.overview}
            onChange={(e) => setForm({ ...form, overview: e.target.value })}
            placeholder="Deskripsi sepatu"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.justIn}
            onChange={(e) => setForm({ ...form, justIn: e.target.checked })}
          />
          Just In
        </label>

        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          disabled={uploading}
        >
          Save
        </button>
      </form>
    </div>
  );
}
