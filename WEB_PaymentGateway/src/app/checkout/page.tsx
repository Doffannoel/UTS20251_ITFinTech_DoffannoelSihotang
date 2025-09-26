"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { MdStar } from "react-icons/md";

import LikeButton from "@/components/LikeButton";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";

import ContactInfo from "./ContactInfo";
import PaymentMethod from "./PaymentMethod";
import ShippingAddress from "./ShippingAddress";

import { useCart } from "@/store/useCart";
import { formatNumberID } from "@/lib/format";

const CheckoutPage = () => {
  const [tabActive, setTabActive] = useState<
    "ContactInfo" | "ShippingAddress" | "PaymentMethod"
  >("ShippingAddress");

  const [email, setEmail] = useState("");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apt: "",
    city: "",
    country: "",
    state: "",
    postalCode: "",
    addressType: "home",
  });
  const { items, updateQty, remove, subtotal } = useCart();

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id);
    setTimeout(() => {
      element?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const total = useMemo(() => subtotal(), [items]);

  const handleSaveContactInfo = (newContactInfo: typeof contactInfo) => {
    setContactInfo(newContactInfo);
  };

  const handleSaveShippingAddress = (newShippingAddress: typeof shippingAddress) => {
    setShippingAddress(newShippingAddress);
  };

  const handleConfirm = async () => {
    if (!email) {
      alert("Masukkan email dulu");
      return;
    }
    if (items.length === 0) {
      alert("Keranjang kosong");
      return;
    }

    const res = await fetch("/api/xendit/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        items: items.map((i) => ({
          slug: i.slug,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image,
        })),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.message || "Gagal membuat invoice");
      return;
    }

    window.location.href = data.invoiceUrl;
  };

  const renderProduct = (i: (typeof items)[number]) => {
    return (
      <div key={i.slug} className="flex py-5 last:pb-0">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl md:h-40 md:w-40">
          <Image
            fill
            src={i.image || "/images/placeholder.png"}
            alt={i.name}
            className="h-full w-full object-contain object-center"
          />
        </div>

        <div className="ml-4 flex flex-1 flex-col justify-between">
          <div>
            <div className="flex justify-between ">
              <div>
                <h3 className="font-medium md:text-2xl ">{i.name}</h3>
                <span className="my-1 text-sm text-neutral-500">
                  Rp {formatNumberID(i.price)}
                </span>
                <div className="flex items-center gap-1">
                  <MdStar className="text-yellow-400" />
                  <span className="text-sm">4.8</span>
                </div>
              </div>
              <span className="font-medium md:text-xl">
                Rp {formatNumberID(i.price * i.qty)}
              </span>
            </div>
          </div>
          <div className="flex w-full items-end justify-between text-sm">
            <div className="flex items-center gap-3">
              <LikeButton
                product={{
                  slug: i.slug,
                  name: i.name,
                  price: i.price,
                  image: i.image || "",
                }}
              />
              <AiOutlineDelete
                className="text-2xl cursor-pointer"
                onClick={() => remove(i.slug)}
              />
            </div>
            <div>
              <input
                className="w-16 border rounded-lg px-2 py-1 text-right"
                type="number"
                min={1}
                value={i.qty}
                onChange={(e) =>
                  updateQty(
                    i.slug,
                    Math.max(1, parseInt(e.target.value || "1", 10))
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLeft = () => {
    return (
      <div className="space-y-8">
        <div id="ContactInfo" className="scroll-mt-24">
          <ContactInfo
            isActive={tabActive === "ContactInfo"}
            onOpenActive={() => {
              setTabActive("ContactInfo");
              handleScrollToEl("ContactInfo");
            }}
            onCloseActive={() => {
              setTabActive("ShippingAddress");
              handleScrollToEl("ShippingAddress");
            }}
            currentName={contactInfo.name}
            currentPhone={contactInfo.phone}
            currentEmail={contactInfo.email}
            onSaveContactInfo={handleSaveContactInfo}
          />
        </div>

        <div id="ShippingAddress" className="scroll-mt-24">
          <ShippingAddress
            isActive={tabActive === "ShippingAddress"}
            onOpenActive={() => {
              setTabActive("ShippingAddress");
              handleScrollToEl("ShippingAddress");
            }}
            onCloseActive={() => {
              setTabActive("PaymentMethod");
              handleScrollToEl("PaymentMethod");
            }}
            currentShippingAddress={shippingAddress}
            onSaveShippingAddress={handleSaveShippingAddress}
          />
        </div>

        <div id="PaymentMethod" className="scroll-mt-24">
          <PaymentMethod
            isActive={tabActive === "PaymentMethod"}
            onOpenActive={() => {
              setTabActive("PaymentMethod");
              handleScrollToEl("PaymentMethod");
            }}
            onCloseActive={() => setTabActive("PaymentMethod")}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="nc-CheckoutPage">
      <main className="container py-16 lg:pb-28 lg:pt-20 ">
        <div className="mb-16">
          <h2 className="block text-2xl font-semibold sm:text-3xl lg:text-4xl ">
            Checkout
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1">{renderLeft()}</div>

          <div className="my-10 shrink-0 border-t border-neutral-300 lg:mx-10 lg:my-0 lg:border-l lg:border-t-0 xl:lg:mx-14 2xl:mx-16 " />

          <div className="w-full lg:w-[36%] ">
            <h3 className="text-lg font-semibold">Order summary</h3>
            <div className="mt-8 divide-y divide-neutral-300">
              {items.length === 0 && <p>Keranjang kosong.</p>}
              {items.map((i) => renderProduct(i))}
            </div>

            <div className="mt-6">
              <label className="block text-sm mb-1">Email untuk invoice</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rounded="rounded-lg"
                sizeClass="h-12 px-4 py-3"
                className="border-neutral-300 bg-transparent placeholder:text-neutral-500 focus:border-primary w-full"
                placeholder="your@email.com"
              />
            </div>

            <div className="mt-10 border-t border-neutral-300 pt-6 text-sm">
              <div className="flex justify-between pb-4">
                <span>Subtotal</span>
                <span className="font-semibold" suppressHydrationWarning>
                  Rp {formatNumberID(subtotal())}
                </span>
              </div>
              <div className="flex justify-between py-4">
                <span>Estimated Delivery & Handling</span>
                <span className="font-semibold">Free</span>
              </div>
              <div className="flex justify-between pt-4 text-base font-semibold">
                <span>Total</span>
                <span suppressHydrationWarning>Rp {formatNumberID(total)}</span>
              </div>
            </div>
            <ButtonPrimary className="mt-8 w-full" onClick={handleConfirm}>
              Confirm order
            </ButtonPrimary>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
