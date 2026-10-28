"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addProductToCart } from "@/api/cart";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart as addToCartAction } from "@/store/slices/cartSlice";
import type { Product } from "@/types";

interface AddToCartOptions {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export function useAddToCart() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const [isAdding, setIsAdding] = useState(false);

  const addItem = async ({
    product,
    quantity,
    selectedSize,
    selectedColor,
  }: AddToCartOptions) => {
    if (authStatus !== "authenticated") {
      toast.info("Please sign in to add products to your cart.");
      const next = `${window.location.pathname}${window.location.search}`;
      router.push(`/sign-in?next=${encodeURIComponent(next)}`);
      return false;
    }

    setIsAdding(true);
    try {
      const productId = Number(product.id);
      await addProductToCart({
        product_id: productId,
        product_count: quantity,
      });
      dispatch(
        addToCartAction({
          product,
          quantity,
          selectedSize,
          selectedColor,
        })
      );
      return true;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? "Unable to add this item to your cart."
        : error instanceof Error
          ? error.message
          : "Unable to add this item to your cart.";
      toast.error(message);
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return { addItem, isAdding };
}
