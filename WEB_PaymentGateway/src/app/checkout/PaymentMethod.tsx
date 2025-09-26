"use client";

import type { FC } from "react";
import React from "react";
import { MdOutlineCreditScore } from "react-icons/md";
import { FaRegCreditCard, FaWallet } from "react-icons/fa6";

import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";

interface Props {
  isActive: boolean;
  onCloseActive: () => void;
  onOpenActive: () => void;
}

const PaymentMethod: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
}) => {
  return (
    <div className="rounded-xl border border-neutral-300 ">
      <div className="flex flex-col items-start p-6 sm:flex-row">
        <span className="hidden sm:block">
          <MdOutlineCreditScore className="text-3xl text-primary" />
        </span>
        <div className="flex w-full items-center justify-between">
          <div className="sm:ml-8">
            <h3 className="uppercase tracking-tight">PAYMENT METHOD</h3>
            <div className="mt-1 text-sm font-semibold">
              <span>Pembayaran via Xendit</span>
            </div>
          </div>
          <ButtonSecondary
            sizeClass="py-2 px-4"
            className="border-2 border-primary text-primary"
            onClick={onOpenActive}
          >
            Edit
          </ButtonSecondary>
        </div>
      </div>

      <div
        className={`space-y-6 border-t border-neutral-300 px-6 py-7 ${
          isActive ? "block" : "hidden"
        }`}
      >
        {/* Xendit Info Section */}
        <div className="flex items-start space-x-4 sm:space-x-6">
          <div
            className={`rounded-xl border-2 p-2.5 border-primary flex items-center justify-center`}
          >
            <FaRegCreditCard className="text-2xl" />
            <FaWallet className="text-2xl ml-2" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Bayar melalui Xendit</p>
            <p className="mt-2 text-sm text-neutral-600">
              Setelah menekan{" "}
              <span className="font-semibold">Confirm Order</span>, Anda akan
              diarahkan ke halaman pembayaran Xendit untuk memilih metode:
              Virtual Account, e-Wallet, QRIS, atau kartu.
            </p>
          </div>
        </div>

        <div className="flex pt-6">
          <ButtonPrimary
            className="w-full max-w-[240px]"
            onClick={onCloseActive}
          >
            Confirm order
          </ButtonPrimary>
          <ButtonSecondary className="ml-3" onClick={onCloseActive}>
            Cancel
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
