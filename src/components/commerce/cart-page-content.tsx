"use client";

import { ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { CheckoutButton } from "@/components/commerce/checkout-button";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";

export function CartPageContent() {
  const { items, subtotal, removeItem } = useCommerce();
  const t = useTranslations("Commerce");
  const navigation = useTranslations("Navigation");

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[36px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("cartDrawerEyebrow")}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {t("cartPageTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            {t("cartPageDescription")}
          </p>

          <div className="mt-8 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-slate-950/45">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-white/5 dark:text-cyan-300">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{t("emptyTitle")}</div>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{t("emptyDescription")}</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.tierId} className="rounded-[30px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950/45">
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
              ))
            )}
          </div>
        </div>

        <div className="space-y-5 rounded-[36px] border border-slate-200 bg-white/85 p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45">
          <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
            <span>{t("authSecureLabel")}</span>
          </div>
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>{t("subtotal")}</span>
              <span>{items.length} {items.length === 1 ? t("cartItemSingular") : t("cartItemPlural")}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-950 dark:text-white">{t("todayTotal")}</span>
              <span className="text-3xl font-semibold text-slate-950 dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <CheckoutButton disabled={items.length === 0} className="mt-6 w-full" />
          </div>
        </div>
      </section>
    </main>
  );
}
