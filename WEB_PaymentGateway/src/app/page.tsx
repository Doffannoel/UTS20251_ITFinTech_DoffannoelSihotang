"use client";

import React, { useState, useEffect } from "react";
import { LuFilter } from "react-icons/lu";
import { MdOutlineFilterList, MdSearch } from "react-icons/md";

import ProductCard from "@/components/ProductCard";
import SidebarFilters from "@/components/SideBarFilter";
import type { ProductType } from "@/data/types";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Input from "@/shared/Input/Input";

import SectionBrands from "./home/SectionBrands";
import { useCart } from "@/store/useCart";
import { useRouter } from "next/navigation";

type Product = {
  justIn: boolean;
  _id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
};

type ProductCardData = {
  id?: string;
  slug: string;
  shoeName: string;
  shoeCategory: string;
  coverImage: string;
  currentPrice: number;
  previousPrice?: number; // <-- dulu 'prevPrice', ubah ke 'previousPrice'
  rating?: number;
  pieces_sold?: number; // <-- dulu 'totalSold', ubah ke 'pieces_sold'
  colors?: string[];
  sizes?: (string | number)[];
  justIn?: boolean; // <-- dulu 'isNew', ubah ke 'justIn'
};

function toProductCardData(p: Product): ProductType {
  return {
    slug: p.slug,
    shoeName: p.name,
    shoeCategory: "Sneakers", // default
    coverImage: p.image || "/images/placeholder.png",
    currentPrice: p.price,
    previousPrice: Math.round(p.price * 1.15),
    rating: 4.8,
    pieces_sold: 100, // dummy value, nanti bisa update dari DB
    justIn: p.justIn ?? false,
  };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.products || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="">
      <div className="container relative flex flex-col lg:flex-row" id="body">
        <div className="pr-4 pt-10 lg:basis-1/3 xl:basis-1/4">
          <SidebarFilters />
        </div>
        <div className="mb-10 shrink-0 border-t lg:mx-4 lg:mb-0 lg:border-t-0" />
        <div className="relative flex-1">
          <div className="top-20 z-10 mb-3 items-center gap-5 space-y-5 bg-white py-10 lg:sticky lg:flex lg:space-y-0">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-neutral-300 px-4">
              <MdSearch className="text-2xl text-neutral-500" />
              <Input
                type="text" // diperbaiki dari "password"
                rounded="rounded-full"
                placeholder="Search..."
                sizeClass="h-12 px-0 py-3"
                className="border-transparent bg-transparent placeholder:text-neutral-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-5">
              <ButtonSecondary className="flex items-center gap-1 bg-gray">
                <LuFilter />
                Filters
              </ButtonSecondary>
              <ButtonSecondary className="flex items-center gap-2 bg-gray">
                Most popular
                <MdOutlineFilterList />
              </ButtonSecondary>
            </div>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid flex-1 gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => {
                const cardData = toProductCardData(p);
                return <ProductCard key={p._id} product={cardData} />;
              })}
            </div>
          )}
        </div>
      </div>

      <div className="my-24">
        <SectionBrands />
      </div>
    </div>
  );
}
