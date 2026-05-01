"use client";

import { Minus, ShieldCheck, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { CheckoutButton } from "@/components/commerce/checkout-button";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";

export function CartPageContent() {
  const { items, subtotal, removeItem } = useCommerce();
  const t = useTranslations("Commerce");
  const navigation = useTranslations("Navigation");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-16 space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{t("cartDrawerEyebrow")}</p>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
              {t("cartPageTitle")}
            </h1>
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <ShoppingBag className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
              <h2 className="mt-8 text-2xl font-semibold text-slate-950 dark:text-white">{t("emptyTitle")}</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">{t("emptyDescription")}</p>
            </motion.div>
          ) : (
            <div className="grid gap-16 lg:grid-cols-[1fr_380px]">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/5">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Service</span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Price</span>
                </div>

                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.tierId}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                      className="group"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 py-7 transition-colors hover:border-slate-200 dark:border-white/5 dark:hover:border-white/10">
                        <div className="flex items-center gap-5">
                          <button
                            type="button"
                            onClick={() => removeItem(item.tierId)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 opacity-0 transition-all hover:border-rose-200 hover:text-rose-500 group-hover:opacity-100 dark:border-white/10 dark:text-slate-500"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <div>
                            <h3 className="text-lg font-medium text-slate-950 dark:text-white">
                              {getServiceTitle(navigation, item.serviceId)}
                            </h3>
                            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                              {getLocalizedTierName(t, item.tierId, item.tierId)}
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-medium tabular-nums text-slate-950 dark:text-white">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_2px_20px_rgba(0,0,0,0.03)] dark:border-white/5 dark:bg-slate-900/50">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Subtotal</span>
                      <span className="text-sm font-medium text-slate-950 dark:text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-5 dark:border-white/5">
                      <span className="text-lg font-semibold text-slate-950 dark:text-white">Total</span>
                      <span className="text-3xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-white">${subtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <CheckoutButton disabled={items.length === 0} className="w-full rounded-2xl py-4 text-base font-medium" />
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Secure SSL encrypted checkout</span>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white/50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
                  <p className="text-xs leading-6 text-slate-400 dark:text-slate-500">
                    All services are billed once per selected tier. You can modify or remove items before completing checkout.
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
