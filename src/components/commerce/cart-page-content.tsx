"use client";

import { useMemo } from "react";
import { ArrowRight, Clock, Lock, Package, ShieldCheck, ShoppingBag, Star, Trash2, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { CheckoutButton } from "@/components/commerce/checkout-button";
import { HostingConfigurationSummary } from "@/components/commerce/hosting-configuration-summary";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";
import { reviews } from "@/lib/reviews";
import { Card, CardContent } from "@/components/ui/card";

function ReviewCard({ review }: { review: typeof reviews[number] }) {
  return (
    <Card className="border-slate-100 bg-white/70 backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-slate-100 dark:ring-white/10">
            <img src={review.avatar} alt={review.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-950 dark:text-white">{review.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{review.company}</p>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(review.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CartPageContent() {
  const { items, subtotal, removeItem } = useCommerce();
  const t = useTranslations("Commerce");
  const navigation = useTranslations("Navigation");

  const featuredReviews = useMemo(() => reviews.slice(0, 3), []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(56,189,248,0.04),transparent_40%)] dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/services" className="hover:text-slate-950 dark:hover:text-white transition">
              Services
            </Link>
            <span>/</span>
            <span className="text-slate-950 dark:text-white">Cart</span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Your Cart
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {items.length === 0 ? "Your cart is empty" : `${items.length} item${items.length === 1 ? "" : "s"} ready for checkout`}
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-12 text-center dark:border-white/10 dark:bg-slate-900/30">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <ShoppingBag className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-slate-950 dark:text-white">Your cart is empty</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Explore our services and add items to your cart</p>
                <Link
                  href="/services"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Browse Services
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.tierId}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg dark:border-white/10 dark:bg-slate-900/50 dark:hover:bg-slate-900/70"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 dark:from-indigo-500/20 dark:to-cyan-500/20">
                        <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-950 dark:text-white">{getServiceTitle(navigation, item.serviceId)}</h3>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{getLocalizedTierName(t, item.tierId, item.tierId)}</p>
                        {item.hostingSummary?.length ? <HostingConfigurationSummary lines={item.hostingSummary} tone="subtle" className="mt-3" /> : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.tierId)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:text-slate-500 dark:hover:bg-rose-500/10"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Instant delivery
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Secure
                      </span>
                    </div>
                    <span className="text-xl font-semibold text-slate-950 dark:text-white">${item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}

            {items.length > 0 && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 dark:border-white/10 dark:from-slate-900/50 dark:to-slate-900/30">
                <h3 className="text-sm font-medium text-slate-950 dark:text-white">Trusted by customers worldwide</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50">
              <h2 className="text-lg font-medium text-slate-950 dark:text-white">Order Summary</h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium text-slate-950 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Processing</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                </div>
                <div className="border-t border-slate-100 pt-3 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-950 dark:text-white">Total</span>
                    <span className="text-2xl font-semibold text-slate-950 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">Including all taxes</p>
                </div>
              </div>

              <CheckoutButton
                disabled={items.length === 0}
                className="mt-6 h-12 w-full rounded-xl bg-slate-950 text-base font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              />

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  SSL Secure
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" />
                  Instant Delivery
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 to-cyan-50/50 p-4 dark:border-white/10 dark:from-indigo-950/20 dark:to-cyan-950/20">
              <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                We accept all major payment methods including Visa, Mastercard, PayPal, Apple Pay, and Google Pay
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
