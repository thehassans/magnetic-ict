"use client";

import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import type { HostingConfigurationSelection } from "@/lib/hosting-types";

type CartItem = {
  serviceId: string;
  tierId: string;
  price: number;
  hostingConfiguration?: HostingConfigurationSelection;
  hostingSummary?: string[];
};

type AddCartItemInput = CartItem;

type CommerceContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  isAuthModalOpen: boolean;
  authRedirectPath: string;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (tierId: string) => void;
  clearCart: () => void;
  openAuthModal: (redirectPath?: string) => void;
  closeAuthModal: () => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);
const storageKey = "magneticict-cart";

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectPath, setAuthRedirectPath] = useState("/checkout");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setItems(JSON.parse(stored) as CartItem[]);
      }
    } catch {
      setItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [isHydrated, items]);

  const value = useMemo<CommerceContextValue>(() => {
    const itemCount = items.length;
    const subtotal = items.reduce((total, item) => total + item.price, 0);

    return {
      items,
      itemCount,
      subtotal,
      isCartOpen,
      isAuthModalOpen,
      authRedirectPath,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      addItem: (item) => {
        setItems((current) => {
          const withoutCurrentService = current.filter(
            (existing) => existing.serviceId !== item.serviceId
          );
          return [...withoutCurrentService, item];
        });
      },
      removeItem: (tierId) => {
        setItems((current) => current.filter((item) => item.tierId !== tierId));
      },
      clearCart: () => setItems([]),
      openAuthModal: (redirectPath = "/checkout") => {
        setAuthRedirectPath(redirectPath);
        setIsAuthModalOpen(true);
      },
      closeAuthModal: () => setIsAuthModalOpen(false)
    };
  }, [authRedirectPath, isAuthModalOpen, isCartOpen, items]);

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);

  if (!context) {
    throw new Error("useCommerce must be used within CommerceProvider.");
  }

  return context;
}

export type { CartItem };
