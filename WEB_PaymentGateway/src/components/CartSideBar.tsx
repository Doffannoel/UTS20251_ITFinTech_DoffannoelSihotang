"use client";

import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FaBagShopping } from "react-icons/fa6";
import { MdClose, MdStar } from "react-icons/md";

import ButtonCircle3 from "@/shared/Button/ButtonCircle3";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import InputNumber from "@/shared/InputNumber/InputNumber";
import LikeButton from "./LikeButton";

import { formatIDR } from "@/lib/format";

import { useCart, CartItem } from "@/store/useCart";

const CartSideBar: React.FC = () => {
  const [isVisable, setIsVisable] = useState(false);
  const { items, remove, updateQty, subtotal } = useCart();

  const handleOpenMenu = () => setIsVisable(true);
  const handleCloseMenu = () => setIsVisable(false);

  const total = subtotal();

  const renderProduct = (item: CartItem) => {
    return (
      <div key={item.slug} className="flex py-5 last:pb-0">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
          <Image
            fill
            src={item.image || "/fallback.png"}
            alt={item.name}
            className="h-full w-full object-contain object-center"
          />
          <Link
            onClick={handleCloseMenu}
            className="absolute inset-0"
            href={`/products/${item.slug}`}
          />
        </div>

        <div className="ml-4 flex flex-1 flex-col justify-between">
          <div>
            <div className="flex justify-between ">
              <div>
                <h3 className="font-medium ">
                  <Link
                    onClick={handleCloseMenu}
                    href={`/products/${item.slug}`}
                  >
                    {item.name}
                  </Link>
                </h3>
              </div>
              <span className=" font-medium">{formatIDR(item.price)}</span>
            </div>
          </div>
          <div className="flex w-full items-end justify-between text-sm">
            <div className="flex items-center gap-3">
              <LikeButton
                product={{
                  slug: item.slug,
                  name: item.name,
                  price: item.price,
                  image: item.image || "",
                }}
              />
              <AiOutlineDelete
                onClick={() => remove(item.slug)}
                className="text-2xl cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 border rounded"
                onClick={() => updateQty(item.slug, item.qty - 1)}
              >
                -
              </button>
              <span>{item.qty}</span>
              <button
                className="px-2 border rounded"
                onClick={() => updateQty(item.slug, item.qty + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <Transition appear show={isVisable} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={handleCloseMenu}
        >
          <div className="z-max fixed inset-y-0 right-0 w-full max-w-md outline-none focus:outline-none md:max-w-md">
            <Transition.Child
              as={Fragment}
              enter="transition duration-100 transform"
              enterFrom="opacity-0 translate-x-full"
              enterTo="opacity-100 translate-x-0"
              leave="transition duration-150 transform"
              leaveFrom="opacity-100 translate-x-0"
              leaveTo="opacity-0 translate-x-full"
            >
              <div className="relative z-20">
                <div className="overflow-hidden shadow-lg ring-1 ring-black/5">
                  <div className="relative h-screen bg-white">
                    <div className="hiddenScrollbar h-screen overflow-y-auto p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Shopping cart</h3>
                        <ButtonCircle3 onClick={handleCloseMenu}>
                          <MdClose className="text-2xl" />
                        </ButtonCircle3>
                      </div>
                      <div className="divide-y divide-neutral-300">
                        {items.length > 0 ? (
                          items.map((item) => renderProduct(item))
                        ) : (
                          <p className="py-10 text-center text-neutral-500">
                            Cart is empty
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-neutral-50 p-5">
                      <p className="flex justify-between">
                        <span>
                          <span className="font-medium">Subtotal</span>
                          <span className="block text-sm text-neutral-500">
                            Shipping and taxes calculated at checkout.
                          </span>
                        </span>
                        <span className="text-xl font-medium">
                          {formatIDR(total)}
                        </span>
                      </p>
                      <div className="mt-5 flex items-center gap-5">
                        <ButtonPrimary
                          href="/checkout"
                          onClick={handleCloseMenu}
                          className="w-full flex-1"
                        >
                          Checkout
                        </ButtonPrimary>
                        <ButtonSecondary
                          onClick={handleCloseMenu}
                          href="/cart"
                          className="w-full flex-1 border-2 border-primary text-primary"
                        >
                          View cart
                        </ButtonSecondary>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter=" duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave=" duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-neutral-900/60" />
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenMenu}
        className="mx-5 flex items-center gap-1 rounded-full bg-neutral-100 p-2 text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        <FaBagShopping className="text-2xl" />
        <span className="hidden text-sm lg:block">{items.length} items</span>
      </button>

      {renderContent()}
    </>
  );
};

export default CartSideBar;
