import type { FC } from "react";
import React, { useState } from "react";
import { FaRegCircleUser } from "react-icons/fa6";

import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Checkbox from "@/shared/Checkbox/Checkbox";
import FormItem from "@/shared/FormItem";
import Input from "@/shared/Input/Input";

interface Props {
  isActive: boolean;
  onOpenActive: () => void;
  onCloseActive: () => void;
  currentName: string;
  currentPhone: string;
  currentEmail: string;
  onSaveContactInfo: (info: {
    name: string;
    phone: string;
    email: string;
  }) => void;
}

const ContactInfo: FC<Props> = ({
  isActive,
  onCloseActive,
  onOpenActive,
  currentName,
  currentPhone,
  currentEmail,
  onSaveContactInfo,
}) => {
  const [formData, setFormData] = useState({
    name: currentName,
    phone: currentPhone,
    email: currentEmail,
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveContactInfo(formData);
    onCloseActive();
  };

  return (
    <div className="z-0 overflow-hidden rounded-xl border border-neutral-300">
      <div className="flex flex-col items-start p-6 sm:flex-row ">
        <span className="hidden sm:block">
          <FaRegCircleUser className="text-3xl text-primary" />
        </span>
        <div className="flex w-full items-center justify-between">
          <div className="sm:ml-8">
            <div className="uppercase tracking-tight">CONTACT INFORMATION</div>
            <div className="mt-1 text-sm font-semibold">
              <span className="">{currentName || "Enter your name"}</span>
              <span className="ml-3 tracking-tighter">
                {currentPhone || "Enter your phone"}
              </span>
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
        className={`space-y-4 border-t border-neutral-300 px-6 py-7 sm:space-y-6 ${
          isActive ? "block" : "hidden"
        }`}
      >
        <h3 className="text-lg font-semibold">Contact infomation</h3>
        <div className="max-w-lg">
          <FormItem label="Your name">
            <Input
              rounded="rounded-lg"
              sizeClass="h-12 px-4 py-3"
              className="border-neutral-300 bg-transparent placeholder:text-neutral-500 focus:border-primary"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              type="text"
            />
          </FormItem>
        </div>
        <div className="max-w-lg">
          <FormItem label="Your phone number">
            <Input
              rounded="rounded-lg"
              sizeClass="h-12 px-4 py-3"
              className="border-neutral-300 bg-transparent placeholder:text-neutral-500 focus:border-primary"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              type="tel"
            />
          </FormItem>
        </div>
        <div className="max-w-lg">
          <FormItem label="Email address">
            <Input
              rounded="rounded-lg"
              sizeClass="h-12 px-4 py-3"
              className="border-neutral-300 bg-transparent placeholder:text-neutral-500 focus:border-primary"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              type="email"
            />
          </FormItem>
        </div>
        <div>
          <Checkbox
            className="!text-sm"
            name="uudai"
            label="Email me news and offers"
            defaultChecked
          />
        </div>

        {/* ============ */}
        <div className="flex flex-col pt-6 sm:flex-row">
          <ButtonPrimary className="shadow-none sm:!px-7" onClick={handleSave}>
            Save and go to Shipping
          </ButtonPrimary>
          <ButtonSecondary
            className="mt-3 sm:ml-3 sm:mt-0"
            onClick={() => onCloseActive()}
          >
            Cancel
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
