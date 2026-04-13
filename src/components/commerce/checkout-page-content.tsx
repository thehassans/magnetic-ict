"use client";

import { useMemo, useState, useTransition } from "react";
import { Apple, BadgeCheck, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";

const paymentMethods = [
  { id: "STRIPE", titleKey: "paymentStripe", Icon: CreditCard },
  { id: "PAYPAL", titleKey: "paymentPaypal", Icon: BadgeCheck },
  { id: "APPLE_PAY", titleKey: "paymentApplePay", Icon: Apple },
  { id: "GOOGLE_PAY", titleKey: "paymentGooglePay", Icon: BadgeCheck }
] as const;

export function CheckoutPageContent() {
  const { status } = useSession();
  const { items, subtotal, clearCart } = useCommerce();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Commerce");
  const navigation = useTranslations("Navigation");
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]["id"]>("STRIPE");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

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
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[36px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("checkoutEyebrow")}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{t("checkoutTitle")}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">{t("checkoutEmptyDescription")}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[36px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("checkoutEyebrow")}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{t("checkoutTitle")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">{t("checkoutDescription")}</p>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-white/90 p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">
            <div className="flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <span>{status === "authenticated" ? t("checkoutAuthenticated") : t("checkoutAuthRequired")}</span>
            </div>
            <div className="mt-6 grid gap-4">
              {paymentMethods.map(({ id, titleKey, Icon }) => {
                const active = paymentMethod === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={`rounded-[28px] border px-5 py-5 text-left transition ${
                      active
                        ? "border-cyan-200 bg-cyan-50 dark:border-cyan-400/30 dark:bg-cyan-400/10"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-white/5 dark:text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-950 dark:text-white">{t(titleKey)}</div>
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(`${titleKey}Description`)}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {status !== "authenticated" ? (
              <button
                type="button"
                onClick={() => router.push(`/customer/sign-in?callback=${encodeURIComponent("/checkout")}`)}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-700"
              >
                <Lock className="h-4 w-4" />
                {t("authenticateToContinue")}
              </button>
            ) : null}

            {status === "authenticated" && error ? (
              <p className="mt-5 text-sm text-rose-600 dark:text-rose-300">{error}</p>
            ) : null}
            {status === "authenticated" && !error && success ? (
              <p className="mt-5 text-sm text-emerald-600 dark:text-emerald-300">{success}</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[36px] border border-slate-200 bg-white/90 p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">
          <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("orderSummary")}</div>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.tierId} className="rounded-[28px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{getServiceTitle(navigation, item.serviceId)}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{getLocalizedTierName(t, item.tierId, item.tierId)}</div>
                  </div>
                  <div className="text-xl font-semibold text-slate-950 dark:text-white">${item.price}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>{t("subtotal")}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>{t("estimatedTaxes")}</span>
              <span>${taxes.toFixed(2)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
              <span className="text-lg font-semibold text-slate-950 dark:text-white">{t("todayTotal")}</span>
              <span className="text-3xl font-semibold text-slate-950 dark:text-white">${total.toFixed(2)}</span>
            </div>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={status !== "authenticated" || isPending}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? t("placingOrder") : t("placeOrder")}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
