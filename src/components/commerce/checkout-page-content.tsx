"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { HostingConfigurationSummary } from "@/components/commerce/hosting-configuration-summary";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { ApplePayMark, GooglePayMark, MastercardMark, PayPalMark, VisaMark } from "@/components/ui/payment-brand-icons";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";
import { CreditCardForm } from "@/components/ui/credit-card-form";

const paymentMethods = [
  { id: "STRIPE", titleKey: "paymentStripe" },
  { id: "PAYPAL", titleKey: "paymentPaypal" },
  { id: "APPLE_PAY", titleKey: "paymentApplePay" },
  { id: "GOOGLE_PAY", titleKey: "paymentGooglePay" }
] as const;

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
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]["id"] | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [cardValid, setCardValid] = useState(false);

  useEffect(() => {
    if (!enabledPaymentMethods.some((method) => method.id === paymentMethod)) {
      setPaymentMethod(null);
    }
  }, [enabledPaymentMethods, paymentMethod]);

  const taxes = useMemo(() => Number((subtotal * 0.08).toFixed(2)), [subtotal]);
  const total = useMemo(() => Number((subtotal + taxes).toFixed(2)), [subtotal, taxes]);

  function handlePlaceOrder() {
    setError("");
    setSuccess("");

    if (!paymentMethod) {
      setError("Please choose a payment method to continue.");
      return;
    }

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

  function renderPaymentBadge(methodId: (typeof paymentMethods)[number]["id"]) {
    switch (methodId) {
      case "STRIPE":
        return (
          <div className="flex flex-wrap items-center gap-2">
            <VisaMark className="h-9" />
            <MastercardMark className="h-9" />
          </div>
        );
      case "PAYPAL":
        return <PayPalMark className="h-9" />;
      case "APPLE_PAY":
        return <ApplePayMark className="h-9" />;
      case "GOOGLE_PAY":
        return <GooglePayMark className="h-9" />;
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.04),transparent_40%)] dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>

        <section className="mt-6 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="order-2 space-y-6 lg:order-1 lg:sticky lg:top-8 lg:h-fit">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-7 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 sm:p-9">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">{t("orderSummary")}</h2>

              <div className="mt-5 space-y-3">
                {items.map((item) => (
                  <div key={item.tierId} className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 dark:border-white/5 dark:bg-white/[0.03]">
                    <div>
                      <div className="font-medium text-slate-950 dark:text-white">{getServiceTitle(navigation, item.serviceId)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{getLocalizedTierName(t, item.tierId, item.tierId)}</div>
                      {item.hostingSummary?.length ? <HostingConfigurationSummary lines={item.hostingSummary} tone="subtle" className="mt-3" /> : null}
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
                disabled={status !== "authenticated" || isPending || enabledPaymentMethods.length === 0 || !paymentMethod || (showCardForm && !cardValid)}
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
          </div>

          <div className="order-1 space-y-6 lg:order-2">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.05)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50 sm:p-9">
              <p className="text-xs uppercase tracking-widest text-cyan-700 dark:text-cyan-300">{t("checkoutEyebrow")}</p>
              <h1 className="mt-3 max-w-2xl text-[2rem] font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[2.35rem]">{t("checkoutTitle")}</h1>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/92 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.04)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50 sm:p-9">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">Payment method</h2>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {enabledPaymentMethods.map(({ id, titleKey }) => {
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
                      <div className="flex-1">
                        <div className="font-medium text-slate-950 dark:text-white">{t(titleKey)}</div>
                        {id === "STRIPE" ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-white/10 dark:bg-white/[0.04]">Debit card</span>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-white/10 dark:bg-white/[0.04]">Credit card</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="shrink-0">{renderPaymentBadge(id)}</div>
                    </button>
                  );
                })}
              </div>

              {enabledPaymentMethods.length === 0 && (
                <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">Payment methods are currently unavailable. Please contact support.</p>
              )}

              {showCardForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02] sm:p-5">
                  <CreditCardForm
                    showSubmit={false}
                    onChange={(_, validity) => setCardValid(validity.allValid)}
                    maskMiddle={true}
                    ring1="#6366f1"
                    ring2="#06b6d4"
                    layout="stacked"
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
          </div>
        </section>
      </div>
    </main>
  );
}
