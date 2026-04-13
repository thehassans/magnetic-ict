"use client";

import { useEffect } from "react";
import { useCommerce } from "@/components/commerce/commerce-provider";

export function ClearCartOnMount() {
  const { clearCart } = useCommerce();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
