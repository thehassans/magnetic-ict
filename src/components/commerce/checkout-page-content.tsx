"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Apple, ArrowLeft, BadgeCheck, CreditCard, Lock, ShieldCheck, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";
import { CreditCardForm } from "@/components/ui/credit-card-form";
import { reviews } from "@/lib/reviews";
import { Card, CardContent } from "@/components/ui/card";

const paymentMethods = [
  { id: "STRIPE", titleKey: "paymentStripe", Icon: CreditCard, brands: ["Visa", "Mastercard", "Amex"] as const },
  { id: "PAYPAL", titleKey: "paymentPaypal", Icon: BadgeCheck, brands: undefined },
  { id: "APPLE_PAY", titleKey: "paymentApplePay", Icon: Apple, brands: undefined },
  { id: "GOOGLE_PAY", titleKey: "paymentGooglePay", Icon: BadgeCheck, brands: undefined }
] as const;

function ReviewMiniCard({ review }: { review: typeof reviews[number] }) {
  return (
    <Card className="border-slate-100 bg-white/80 backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/50">
      <CardContent className="flex items-center gap-3 p-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-slate-100 dark:ring-white/10">
          <img src={review.avatar} alt={review.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{review.name}</p>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
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

type AvailablePaymentMethods = {
  STRIPE: boolean;
  PAYPAL: boolean;
  APPLE_PAY: boolean;
  GOOGLE_PAY: boolean;
};

export function CheckoutPageContent({ availablePaymentMethods }: { availablePaymentMethods: AvailablePaymentMethods }) {
  const { status } = useSession();
  const { items, subtotal, clearCart } = useCommerce();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Commerce");
  const navigation = useTranslations("Navigation");
  const enabledPaymentMethods = useMemo(
    () => paymentMethods.filter((method) => availablePaymentMethods[method.id]),
    [availablePaymentMethods]
  );
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]["id"]>(enabledPaymentMethods[0]?.id ?? "STRIPE");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [cardValid, setCardValid] = useState(false);

  const featuredReviews = useMemo(() => reviews.slice(0, 2), []);

  useEffect(() => {
    if (!enabledPaymentMethods.some((method) => method.id === paymentMethod)) {
      setPaymentMethod(enabledPaymentMethods[0]?.id ?? "STRIPE");
    }
  }, [enabledPaymentMethods, paymentMethod]);

  const taxes = useMemo(() => Number((subtotal * 0.08).toFixed(2)), [subtotal]);
  const total = useMemo(() => Number((subtotal + taxes).toFixed(2)), [subtotal, taxes]);

  function handlePlaceOrder() {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const response = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentMethod,
          locale,
          items
        })
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
        redirectUrl?: string | null;
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? t("orderError"));
        return;
      }

      if (payload.redirectUrl) {
        window.location.href = payload.redirectUrl;
        return;
      }

      clearCart();
      setSuccess(t("orderSuccess"));
      router.push("/dashboard");
    });
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.04),transparent_40%)] dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white/85 p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
            <p className="text-sm uppercase tracking-widest text-cyan-700 dark:text-cyan-300">{t("checkoutEyebrow")}</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{t("checkoutTitle")}</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{t("checkoutEmptyDescription")}</p>
          </section>
        </div>
      </main>
    );
  }

  const showCardForm = paymentMethod === "STRIPE";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.04),transparent_40%)] dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50 sm:p-8">
              <p className="text-xs uppercase tracking-widest text-cyan-700 dark:text-cyan-300">{t("checkoutEyebrow")}</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{t("checkoutTitle")}</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("checkoutDescription")}</p>

              <div className="mt-6 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{status === "authenticated" ? t("checkoutAuthenticated") : t("checkoutAuthRequired")}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50 sm:p-8">
              <h2 className="text-sm font-medium text-slate-950 dark:text-white">Payment Method</h2>

              <div className="mt-4 grid gap-3">
                {enabledPaymentMethods.map(({ id, titleKey, Icon, brands }) => {
                  const active = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-indigo-200 bg-indigo-50/50 dark:border-indigo-400/30 dark:bg-indigo-400/10"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300" : "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-950 dark:text-white">{t(titleKey)}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t(`${titleKey}Description`)}</div>
                      </div>
                      {brands && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          {brands.map((b: string) => (
                            <span key={b} className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">{b}</span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {enabledPaymentMethods.length === 0 && (
                <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">Payment methods are currently unavailable. Please contact support.</p>
              )}

              {showCardForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                  <CreditCardForm
                    showSubmit={false}
                    onChange={(_, validity) => setCardValid(validity.allValid)}
                    maskMiddle={true}
                    ring1="#6366f1"
                    ring2="#06b6d4"
                  />
                </div>
              )}

              {status !== "authenticated" && (
                <button
                  type="button"
                  onClick={() => router.push(`/customer/sign-in?callback=${encodeURIComponent("/checkout")}`)}
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <Lock className="h-4 w-4" />
                  {t("authenticateToContinue")}
                </button>
              )}

              {status === "authenticated" && error && <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{error}</p>}
              {status === "authenticated" && !error && success && <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-300">{success}</p>}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 dark:border-white/10 dark:from-slate-900/50 dark:to-slate-900/30 sm:p-8">
              <h3 className="text-sm font-medium text-slate-950 dark:text-white">Trusted by customers</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {featuredReviews.map((review) => (
                  <ReviewMiniCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50 sm:p-8">
              <h2 className="text-sm font-medium text-slate-950 dark:text-white">{t("orderSummary")}</h2>

              <div className="mt-4 space-y-3">
                {items.map((item) => (
                  <div key={item.tierId} className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]">
                    <div>
                      <div className="font-medium text-slate-950 dark:text-white">{getServiceTitle(navigation, item.serviceId)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{getLocalizedTierName(t, item.tierId, item.tierId)}</div>
                    </div>
                    <div className="font-semibold text-slate-950 dark:text-white">${item.price}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-white/10">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>{t("subtotal")}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>{t("estimatedTaxes")}</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
                  <span className="font-medium text-slate-950 dark:text-white">{t("todayTotal")}</span>
                  <span className="text-2xl font-semibold text-slate-950 dark:text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={status !== "authenticated" || isPending || enabledPaymentMethods.length === 0 || (showCardForm && !cardValid)}
                className="mt-6 h-12 w-full rounded-xl bg-slate-950 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                {isPending ? t("placingOrder") : t("placeOrder")}
              </button>

              <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Encrypted
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  PCI Compliant
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {featuredReviews.map((review) => (
                <div key={review.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/50 p-2 dark:border-white/10 dark:bg-slate-900/30">
                  <img src={review.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                  <div className="hidden text-[10px] leading-tight sm:block">
                    <p className="font-medium text-slate-950 dark:text-white">{review.name.split(" ")[0]}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-2.5 w-2.5 ${i < Math.floor(review.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
