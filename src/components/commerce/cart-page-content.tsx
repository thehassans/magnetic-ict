"use client";

import { ArrowLeft, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { CheckoutButton } from "@/components/commerce/checkout-button";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { Link } from "@/i18n/navigation";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";

export function CartPageContent() {
  const { items, subtotal, removeItem } = useCommerce();
  const t = useTranslations("Commerce");
  const navigation = useTranslations("Navigation");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_48%,#f3f7fb_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#07111f_50%,#020617_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="overflow-hidden rounded-[40px] border border-slate-200 bg-white/90 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_30px_120px_rgba(2,6,23,0.55)]">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="border-b border-slate-200 p-8 sm:p-10 lg:border-b-0 lg:border-r dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("cartDrawerEyebrow")}</p>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                    {t("cartPageTitle")}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                    {t("cartPageDescription")}
                  </p>
                </div>
                <Link
                  href="/services"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Continue exploring
                </Link>
              </div>

              <div className="mt-10 space-y-4">
                {items.length === 0 ? (
                  <div className="rounded-[32px] border border-dashed border-slate-200 bg-slate-50/90 p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                    <div className="mt-6 text-2xl font-semibold text-slate-950 dark:text-white">{t("emptyTitle")}</div>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-400">{t("emptyDescription")}</p>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div
                      key={item.tierId}
                      className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.74),rgba(2,6,23,0.82))]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                            Selection {index + 1}
                          </div>
                          <div>
                            <div className="text-2xl font-semibold text-slate-950 dark:text-white">{getServiceTitle(navigation, item.serviceId)}</div>
                            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{getLocalizedTierName(t, item.tierId, item.tierId)}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.tierId)}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-8 flex items-end justify-between gap-4 border-t border-slate-200 pt-5 dark:border-white/10">
                        <span className="text-sm uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Plan total</span>
                        <span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-50/80 p-8 sm:p-10 dark:bg-slate-950/40">
              <div className="sticky top-24 space-y-5">
                <div className="flex items-center gap-3 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                  <span>{t("authSecureLabel")}</span>
                </div>
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>{t("subtotal")}</span>
                    <span>{items.length} {items.length === 1 ? t("cartItemSingular") : t("cartItemPlural")}</span>
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <span className="text-lg font-semibold text-slate-950 dark:text-white">{t("todayTotal")}</span>
                    <span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="mt-6 h-px bg-slate-200 dark:bg-white/10" />
                  <CheckoutButton disabled={items.length === 0} className="mt-6 w-full !rounded-2xl !h-12" />
                  <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
                    Secure checkout continues after authentication and keeps your selected services intact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
