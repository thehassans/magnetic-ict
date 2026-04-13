"use client";

import { AuthInterceptModal } from "@/components/commerce/auth-intercept-modal";
import { CartDrawer } from "@/components/commerce/cart-drawer";

export function CommerceOverlays() {
  return (
    <>
      <CartDrawer />
      <AuthInterceptModal />
    </>
  );
}
