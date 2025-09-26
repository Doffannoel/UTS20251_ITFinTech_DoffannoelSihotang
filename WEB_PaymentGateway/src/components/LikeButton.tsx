"use client";

import React from "react";
import { useCart } from "@/store/useCart";

export interface LikeButtonProps {
  className?: string;
  product: {
    slug: string;
    name: string;
    price: number;
    image: string;
  };
}

const LikeButton: React.FC<LikeButtonProps> = ({ className = "", product }) => {
  const { items, add, remove } = useCart();
  const isLiked = items.some((item) => item.slug === product.slug);

  const toggleLike = () => {
    if (isLiked) {
      remove(product.slug);
    } else {
      add(
        {
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
        },
        1
      );
    }
  };

  return (
    <button
      type="button"
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white ${className}`}
      onClick={toggleLike}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
          stroke={isLiked ? "#e94e07" : "currentColor"}
          fill={isLiked ? "#e94e07" : "none"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default LikeButton;
