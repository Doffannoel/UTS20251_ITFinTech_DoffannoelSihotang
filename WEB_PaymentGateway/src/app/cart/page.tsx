"use client";

import Image from "next/image";
import Link from "next/link";
import { MdStar } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { TbBrandPaypal } from "react-icons/tb";

import LikeButton from "@/components/LikeButton";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import { useCart } from "@/store/useCart";

// type cart dari zustand
type CartItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

const CartPage = () => {
  const { items, updateQty, remove, subtotal } = useCart();

  // helper render item (mirip FE template)
  const renderCartItem = (i: CartItem) => {
    return (
      <div key={i.slug} className="flex py-5 last:pb-0">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl md:h-40 md:w-40">
          <Image
            fill
            src={i.image || "/images/placeholder.png"}
            alt={i.name}
            className="h-full w-full object-contain object-center"
          />
          <Link className="absolute inset-0" href={`/products/${i.slug}`} />
        </div>

        <div className="ml-4 flex flex-1 flex-col justify-between">
          <div>
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium md:text-2xl ">
                  <Link href={`/products/${i.slug}`}>{i.name}</Link>
                </h3>
                <span className="my-1 text-sm text-neutral-500">{i.slug}</span>
                <div className="flex items-center gap-1">
                  <MdStar className="text-yellow-400" />
                  <span className="text-sm">4.8</span>
                </div>
              </div>
              <span className="font-medium md:text-xl">
                Rp {(i.price * i.qty).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
          <div className="flex w-full items-end justify-between text-sm">
            <div className="flex items-center gap-3">
              <LikeButton />
              <AiOutlineDelete
                className="text-2xl cursor-pointer text-red-500"
                onClick={() => remove(i.slug)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 border rounded"
                onClick={() => updateQty(i.slug, Math.max(1, i.qty - 1))}
              >
                −
              </button>
              <span>{i.qty}</span>
              <button
                className="px-2 border rounded"
                onClick={() => updateQty(i.slug, i.qty + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:pb-28 lg:pt-20 ">
        <div className="mb-14">
          <h2 className="block text-2xl font-medium sm:text-3xl lg:text-4xl">
            Your Cart
          </h2>
        </div>

        <hr className="my-10 border-neutral-300 xl:my-12" />

        <div className="flex flex-col lg:flex-row">
          {/* List item */}
          <div className="w-full divide-y divide-neutral-300 lg:w-[60%] xl:w-[55%]">
            {items.length === 0 && <p>Keranjang kosong.</p>}
            {items.map((i) => renderCartItem(i))}
          </div>

          <div className="my-10 shrink-0 border-t border-neutral-300 lg:mx-10 lg:my-0 lg:border-l lg:border-t-0 xl:mx-16 2xl:mx-20" />

          {/* Summary */}
          <div className="flex-1">
            <div className="sticky top-28">
              <h3 className="text-2xl font-semibold">Summary</h3>
              <div className="mt-7 divide-y divide-neutral-300 text-sm">
                <div className="flex justify-between pb-4">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    Rp {subtotal().toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between py-4">
                  <span>Estimated Delivery & Handling</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between pt-4 text-base font-semibold">
                  <span>Total</span>
                  <span>Rp {subtotal().toLocaleString("id-ID")}</span>
                </div>
              </div>
              <ButtonPrimary href="/checkout" className="mt-8 w-full">
                Checkout Now
              </ButtonPrimary>
              <ButtonSecondary
                className="mt-3 inline-flex w-full items-center gap-1 border-2 border-primary text-primary"
                href="/checkout"
              >
                <TbBrandPaypal className="text-2xl" />
                PayPal
              </ButtonSecondary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
