"use client";

import { useMemo } from "react";
import { ArrowRight, Clock3, Lock, Package, ShieldCheck, ShoppingBag, Star, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CheckoutButton } from "@/components/commerce/checkout-button";
import { HostingConfigurationSummary } from "@/components/commerce/hosting-configuration-summary";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { HostingConfigurator } from "@/components/services/hosting-configurator";
import { createDefaultHostingSelection } from "@/lib/hosting-commerce";
import type { HostingProviderSettings } from "@/lib/hosting-types";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";
import { serviceCatalog } from "@/lib/service-catalog";
import { reviews } from "@/lib/reviews";
import { cn } from "@/lib/utils";

const hostingService = serviceCatalog.find((service) => service.id === "magneticVpsHosting");
const hostingTierPriceMap = new Map(hostingService?.tiers.map((tier) => [tier.id, tier.price] as const) ?? []);

function CartReviewCard({ review }: { review: typeof reviews[number] }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-white/10">
          <img src={review.avatar} alt={review.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-slate-950 dark:text-white">{review.name}</div>
          <div className="truncate text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{review.service}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={cn("h-3.5 w-3.5", index < Math.floor(review.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700")} />
        ))}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">“{review.comment}”</p>
    </article>
  );
}

export function CartPageContent({ hostingProviderConfig }: { hostingProviderConfig: HostingProviderSettings }) {
  const { items, subtotal, removeItem, clearCart, updateItem } = useCommerce();
  const t = useTranslations("Commerce");
  const navigation = useTranslations("Navigation");

  const featuredReviews = useMemo(() => reviews.slice(0, 3), []);
  const itemCountLabel = `${items.length} ${items.length === 1 ? "item" : "items"}`;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950 sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Magnetic cart</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Your cart is empty</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Start with Magnetic VPS Hosting to experience the premium hosting, cart, and checkout flow from your reference repo.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/hosting"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Browse hosting plans
              </Link>
              <Link
                href="/services"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:hover:bg-white/[0.04]"
              >
                Browse all services
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-950 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">Magnetic cart</div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Shopping cart</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Review your selected services, compare configuration details, and continue into the premium checkout flow.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> SSL secure</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" /> Instant access</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Protected delivery</span>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="text-[12px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{itemCountLabel}</div>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400 transition hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-300"
              >
                Clear cart
              </button>
            </div>

            {items.map((item) => (
              <article key={item.tierId} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{getServiceTitle(navigation, item.serviceId)}</h3>
                      <p className="mt-1 text-[12px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{getLocalizedTierName(t, item.tierId, item.tierId)}</p>
                      {item.serviceId === "magneticVpsHosting" ? (
                        <div className="mt-4 space-y-3">
                          <HostingConfigurator
                            settings={hostingProviderConfig}
                            basePrice={hostingTierPriceMap.get(item.tierId) ?? item.price}
                            value={item.hostingConfiguration ?? createDefaultHostingSelection(hostingProviderConfig)}
                            onChange={(selection, summaryLines, totalPrice) => {
                              updateItem(item.serviceId, item.tierId, {
                                hostingConfiguration: selection,
                                hostingSummary: summaryLines,
                                price: totalPrice
                              });
                            }}
                            compact
                            defaultOpen={false}
                          />
                          {item.hostingSummary?.length ? <HostingConfigurationSummary lines={item.hostingSummary} tone="subtle" /> : null}
                        </div>
                      ) : item.hostingSummary?.length ? (
                        <HostingConfigurationSummary lines={item.hostingSummary} tone="subtle" className="mt-4" />
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.tierId)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-500 dark:hover:bg-rose-500/10"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Fast provisioning</span>
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure service</span>
                  </div>
                  <div className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">${item.price.toFixed(2)}</div>
                </div>
              </article>
            ))}

            <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-6 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Customer reviews</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Reference-style voices from customers using hosting, checkout, and provisioning.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredReviews.map((review) => (
                  <CartReviewCard key={review.id} review={review} />
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-8 lg:h-fit">
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Order summary</h2>
              </div>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div key={`${item.serviceId}-${item.tierId}`} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-white/10">
                    <div>
                      <div className="text-sm font-medium text-slate-950 dark:text-white">{getServiceTitle(navigation, item.serviceId)}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{getLocalizedTierName(t, item.tierId, item.tierId)}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-950 dark:text-white">${item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm dark:border-white/10">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Processing</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
                  <span className="font-medium text-slate-950 dark:text-white">Total</span>
                  <span className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <CheckoutButton
                disabled={items.length === 0}
                className="mt-6 h-12 w-full rounded-xl bg-slate-950 text-base font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              />

              <div className="mt-5 grid grid-cols-1 gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <Lock className="h-3.5 w-3.5" /> Secure checkout with encrypted payment flow
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Premium service delivery with admin visibility
                </div>
              </div>

              <Link
                href="/hosting"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-950 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:hover:bg-white/[0.04]"
              >
                Add hosting plan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
