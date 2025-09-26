// src/app/products/[productId]/page.tsx
import React, { JSX } from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import SectionMoreProducts from "./SectionMoreProducts";
import SectionNavigation from "./SectionNavigation";
import SectionProductHeader from "./SectionProductHeader";
import SectionProductInfo from "./SectionProductInfo";
import { StaticImageData } from "next/image";

type Props = {
  params: { productId: string };
};

// Definisikan tipe sesuai schema Product kamu
type DBProduct = {
  slug: string;
  name: string;
  price: number;
  previousPrice?: number;
  rating?: number;
  pieces_sold?: number;
  reviews?: number;
  overview?: string;
  shipment_details?: { title: string; description: string; icon?: any }[];
  images?: string[];
  coverImage?: string; // ✅ ini sudah ada di seed.ts
  shots?: string[];
};

const getProductData = async (slug: string) => {
  await connectDB();

  const doc = await Product.findOne({ slug }).lean<DBProduct>();
  if (!doc) return null;
  const cover = doc.coverImage || (doc.images?.[0] ?? "");
  const shots = [
    cover,
    ...((doc.images ?? []).filter(Boolean) as string[]),
  ].filter(Boolean);
  // hapus duplikat sambil mempertahankan urutan
  const uniqueShots = Array.from(new Set(shots));
  return {
    slug: doc.slug ?? "",
    shots: uniqueShots,
    shoeName: doc.name ?? "",
    previousPrice: doc.previousPrice ?? null,
    currentPrice: doc.price ?? 0,
    rating: doc.rating ?? 0,
    pieces_sold: doc.pieces_sold ?? 0,
    reviews: doc.reviews ?? 0,
    overview: doc.overview ?? "",
    shipment_details: doc.shipment_details ?? [],
  };
};

const SingleProductPage = async ({ params }: Props) => {
  const { productId } = await params;
  const selectedProduct = await getProductData(productId);

  if (!selectedProduct) {
    notFound(); // otomatis render 404 page Next.js
  }

  return (
    <div className="container">
      <SectionNavigation />

      <div className="mb-20">
        <SectionProductHeader
          slug={selectedProduct!.slug}
          shots={selectedProduct!.shots}
          shoeName={selectedProduct!.shoeName}
          prevPrice={selectedProduct!.previousPrice ?? 0}
          currentPrice={selectedProduct!.currentPrice}
          rating={selectedProduct!.rating}
          pieces_sold={selectedProduct!.pieces_sold}
          reviews={selectedProduct!.reviews}
        />
      </div>

      <div className="mb-28">
        <SectionProductInfo
          overview={selectedProduct!.overview}
          shipment_details={selectedProduct!.shipment_details.map((detail) => ({
            ...detail,
            icon: detail.icon ? (detail.icon as JSX.Element) : <span />, // Provide a default JSX.Element if icon is missing
          }))}
          ratings={selectedProduct!.rating}
          reviews={selectedProduct!.reviews}
        />
      </div>

      <div className="mb-28">
        <SectionMoreProducts />
      </div>
    </div>
  );
};

export default SingleProductPage;
