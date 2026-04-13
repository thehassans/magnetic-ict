"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";
import { cn } from "@/lib/utils";
import { CheckoutButton } from "@/components/commerce/checkout-button";
import { useCommerce } from "@/components/commerce/commerce-provider";

export function CartDrawer() {
  const { items, subtotal, itemCount, isCartOpen, closeCart, removeItem } = useCommerce();
  const t = useTranslations("Commerce");
  const navigation = useTranslations("Navigation");

  return (
    <AnimatePresence>
      {isCartOpen ? (
        <>
          <motion.button
            type="button"
            aria-label={t("closeCart")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white/95 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_30px_100px_rgba(15,23,42,0.2)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_100px_rgba(15,23,42,0.75)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8 dark:border-white/10">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("cartDrawerEyebrow")}</div>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{t("cartDrawerTitle")}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {itemCount} {itemCount === 1 ? t("cartItemSingular") : t("cartItemPlural")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-white/5 dark:text-cyan-300">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{t("emptyTitle")}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-400">{t("emptyDescription")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.tierId}
                      className="rounded-[30px] border border-slate-200 bg-white p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{getServiceTitle(navigation, item.serviceId)}</div>
                          <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{getLocalizedTierName(t, item.tierId, item.tierId)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.tierId)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-rose-200 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">${item.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-5 sm:px-8 dark:border-white/10">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>{t("subtotal")}</span>
                  <span>{itemCount} {itemCount === 1 ? t("cartItemSingular") : t("cartItemPlural")}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-950 dark:text-white">{t("todayTotal")}</span>
                  <span className="text-3xl font-semibold text-slate-950 dark:text-white">${subtotal}</span>
                </div>
                <CheckoutButton
                  disabled={items.length === 0}
                  className={cn("mt-5 w-full", items.length === 0 && "opacity-50")}
                />
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
