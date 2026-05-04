"use client";

import { useEffect, useMemo, useState, useTransition, type InputHTMLAttributes, type ReactNode } from "react";
import { ArrowLeft, Award, CheckCircle2, Clock, Lock, Mail, MapPin, RefreshCcw, ShieldCheck, Star, User, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "@/i18n/navigation";
import { HostingConfigurationSummary } from "@/components/commerce/hosting-configuration-summary";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { ApplePayMark, GooglePayMark, MastercardMark, PayPalMark, VisaMark } from "@/components/ui/payment-brand-icons";
import { getLocalizedTierName, getServiceTitle } from "@/lib/service-i18n";
import { CreditCardForm } from "@/components/ui/credit-card-form";
import { reviews } from "@/lib/reviews";
import { cn } from "@/lib/utils";

const paymentMethods = [
  { id: "STRIPE", titleKey: "paymentStripe" },
  { id: "PAYPAL", titleKey: "paymentPaypal" },
  { id: "APPLE_PAY", titleKey: "paymentApplePay" },
  { id: "GOOGLE_PAY", titleKey: "paymentGooglePay" }
] as const;

const trustBadges = [
  { icon: ShieldCheck, label: "256-bit SSL", desc: "Encrypted" },
  { icon: RefreshCcw, label: "45 days", desc: "Money back" },
  { icon: Zap, label: "99.9%", desc: "Uptime" },
  { icon: Clock, label: "24/7", desc: "Support" }
] as const;

type AvailablePaymentMethods = {
  STRIPE: boolean;
  PAYPAL: boolean;
  APPLE_PAY: boolean;
  GOOGLE_PAY: boolean;
};

export function CheckoutPageContent({ availablePaymentMethods }: { availablePaymentMethods: AvailablePaymentMethods }) {
  const { status, data: session } = useSession();
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    const name = session?.user?.name ?? "";
    setFirstName((current) => current || name.split(" ")[0] || "");
    setLastName((current) => current || name.split(" ").slice(1).join(" "));
    setEmail((current) => current || session?.user?.email || "");
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReviewIndex((index) => (index + 1) % reviews.length);
    }, 5200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!enabledPaymentMethods.some((method) => method.id === paymentMethod)) {
      setPaymentMethod(null);
    }
  }, [enabledPaymentMethods, paymentMethod]);

  const taxes = useMemo(() => Number((subtotal * 0.08).toFixed(2)), [subtotal]);
  const total = useMemo(() => Number((subtotal + taxes).toFixed(2)), [subtotal, taxes]);
  const contactValid = firstName.trim() !== "" && lastName.trim() !== "" && /.+@.+\..+/.test(email.trim());

  function handlePlaceOrder() {
    setError("");
    setSuccess("");

    if (!paymentMethod) {
      setError("Please choose a payment method to continue.");
      return;
    }
    if (!contactValid) {
      setError("Please complete your contact information.");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the terms to continue.");
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
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <SecureCheckoutHeader />
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-[13px] text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to cart
          </Link>
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 dark:border-white/10 dark:bg-slate-950 sm:p-14">
            <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">{t("checkoutEyebrow")}</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[2.25rem]">{t("checkoutTitle")}</h1>
            <p className="mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-300">{t("checkoutEmptyDescription")}</p>
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
            <VisaMark className="h-8" />
            <MastercardMark className="h-8" />
          </div>
        );
      case "PAYPAL":
        return <PayPalMark className="h-8" />;
      case "APPLE_PAY":
        return <ApplePayMark className="h-8" />;
      case "GOOGLE_PAY":
        return <GooglePayMark className="h-8" />;
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <SecureCheckoutHeader />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[13px] text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to cart
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
          {/* LEFT — forms */}
          <div className="space-y-6">
            <MinimalSection
              eyebrow="01"
              icon={Mail}
              title="Contact information"
              subtitle="We’ll send your receipt and login details here."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <MinimalField label="First name" required>
                  <MinimalInput
                    icon={User}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                </MinimalField>
                <MinimalField label="Last name" required>
                  <MinimalInput
                    icon={User}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </MinimalField>
                <div className="sm:col-span-2">
                  <MinimalField label="Email" required>
                    <MinimalInput
                      icon={Mail}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                      type="email"
                      autoComplete="email"
                    />
                  </MinimalField>
                </div>
              </div>
            </MinimalSection>

            <MinimalSection
              eyebrow="02"
              icon={MapPin}
              title="Billing address"
              subtitle="For invoicing and tax compliance."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <MinimalField label="Street address">
                    <MinimalInput value={address} onChange={(event) => setAddress(event.target.value)} placeholder="123 Main Street" autoComplete="street-address" />
                  </MinimalField>
                </div>
                <MinimalField label="City">
                  <MinimalInput value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" autoComplete="address-level2" />
                </MinimalField>
                <MinimalField label="Country">
                  <MinimalInput value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Country" autoComplete="country-name" />
                </MinimalField>
              </div>
            </MinimalSection>

            <MinimalSection
              eyebrow="03"
              icon={Lock}
              title="Payment method"
              subtitle="All transactions are encrypted end-to-end."
            >
              {enabledPaymentMethods.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Payment methods are currently unavailable. Please contact support.</p>
              ) : (
                <div className="grid gap-3">
                  {enabledPaymentMethods.map(({ id, titleKey }) => {
                    const active = paymentMethod === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={cn(
                          "group relative flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition",
                          active
                            ? "border-slate-950 bg-slate-950/[0.02] dark:border-white dark:bg-white/[0.04]"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border transition",
                            active ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-300 dark:border-white/20"
                          )}
                        >
                          {active ? <CheckCircle2 className="h-3 w-3" strokeWidth={3} /> : null}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-950 dark:text-white">{t(titleKey)}</div>
                          {id === "STRIPE" ? (
                            <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">Visa · Mastercard · Amex</div>
                          ) : null}
                        </div>
                        <div className="shrink-0 opacity-80">{renderPaymentBadge(id)}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {showCardForm && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]">
                  <CreditCardForm
                    showSubmit={false}
                    onChange={(_, validity) => setCardValid(validity.allValid)}
                    maskMiddle={true}
                    ring1="#0f172a"
                    ring2="#334155"
                    layout="stacked"
                  />
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <Lock className="h-3 w-3" />
                    Your card details are secured with 256-bit encryption.
                  </div>
                </div>
              )}
            </MinimalSection>
          </div>

          {/* RIGHT — sticky summary, guarantee, reviews */}
          <div>
            <div className="space-y-5 lg:sticky lg:top-8 lg:h-fit">
              <section className="rounded-3xl border border-slate-200 bg-white p-7 dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <h2 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{t("orderSummary")}</h2>
                </div>

                <div className="mt-5 space-y-4">
                  {items.map((item) => (
                    <div key={item.tierId} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-white/10">
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-medium text-slate-950 dark:text-white">{getServiceTitle(navigation, item.serviceId)}</div>
                        <div className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{getLocalizedTierName(t, item.tierId, item.tierId)}</div>
                        {item.hostingSummary?.length ? <HostingConfigurationSummary lines={item.hostingSummary} tone="subtle" className="mt-3" /> : null}
                      </div>
                      <div className="shrink-0 text-[15px] font-semibold tabular-nums text-slate-950 dark:text-white">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-[13px] dark:border-white/10">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>{t("subtotal")}</span>
                    <span className="tabular-nums">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>{t("estimatedTaxes")}</span>
                    <span className="tabular-nums">${taxes.toFixed(2)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
                    <span className="text-[13px] font-medium text-slate-950 dark:text-white">{t("todayTotal")}</span>
                    <span className="text-2xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-white">${total.toFixed(2)}</span>
                  </div>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 text-[12px] leading-5 text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 dark:border-white/20 dark:bg-transparent dark:text-white"
                  />
                  <span>
                    I agree to the <Link href="/legal/terms" className="underline underline-offset-4 hover:text-slate-950 dark:hover:text-white">Terms</Link> and <Link href="/legal/privacy" className="underline underline-offset-4 hover:text-slate-950 dark:hover:text-white">Privacy Policy</Link>.
                  </span>
                </label>

                {status !== "authenticated" ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/customer/sign-in?callback=${encodeURIComponent("/checkout")}`)}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-[13px] font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    <Lock className="h-4 w-4" />
                    {t("authenticateToContinue")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isPending || enabledPaymentMethods.length === 0 || !paymentMethod || (showCardForm && !cardValid) || !contactValid || !termsAccepted}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-[13px] font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    <Lock className="h-4 w-4" />
                    {isPending ? t("placingOrder") : `${t("placeOrder")} · $${total.toFixed(2)}`}
                  </button>
                )}

                {error ? <p className="mt-3 text-[12px] text-rose-600 dark:text-rose-300">{error}</p> : null}
                {!error && success ? <p className="mt-3 text-[12px] text-emerald-600 dark:text-emerald-300">{success}</p> : null}

                <div className="mt-4 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Encrypted
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> PCI compliant
                  </span>
                </div>
              </section>

              <section className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-200">
                  <RefreshCcw className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[13px] font-medium text-slate-950 dark:text-white">45-day money back</div>
                  <div className="text-[12px] text-slate-500 dark:text-slate-400">Full refund, no questions asked.</div>
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    Customer reviews
                  </span>
                  <span className="tabular-nums">{reviewIndex + 1} / {reviews.length}</span>
                </div>

                <div className="relative mt-5 min-h-[136px]">
                  {reviews.map((review, index) => {
                    const active = index === reviewIndex;
                    return (
                      <div
                        key={review.id}
                        className={cn(
                          "absolute inset-0 transition-all duration-700 ease-out",
                          active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
                        )}
                        aria-hidden={!active}
                      >
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={cn(
                                "h-3.5 w-3.5",
                                starIndex < Math.floor(review.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-3 text-[13px] leading-6 text-slate-700 dark:text-slate-300">
                          “{review.comment}”
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-white/10">
                            <img src={review.avatar} alt={review.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="text-[12px]">
                            <div className="font-medium text-slate-950 dark:text-white">{review.name}</div>
                            <div className="text-slate-500 dark:text-slate-400">{review.service} · {review.company}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SecureCheckoutHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-800 dark:border-white/10 dark:text-slate-200">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[13px] font-semibold tracking-tight text-slate-950 dark:text-white">Secure checkout</div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">256-bit SSL encrypted</div>
          </div>
        </div>
        <div className="hidden items-center gap-7 md:flex">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <badge.icon className="h-3.5 w-3.5" />
              <div className="text-[11px] leading-tight">
                <div className="font-medium text-slate-950 dark:text-white">{badge.label}</div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{badge.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

type MinimalSectionProps = {
  eyebrow: string;
  icon: typeof Mail;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function MinimalSection({ eyebrow, icon: Icon, title, subtitle, children }: MinimalSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 dark:border-white/10 dark:bg-slate-950 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">{eyebrow}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
          </div>
          {subtitle ? <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MinimalField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {label}
        {required ? <span className="ml-1 text-slate-400">*</span> : null}
      </span>
      {children}
    </label>
  );
}

type MinimalInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: typeof Mail;
};

function MinimalInput({ icon: Icon, className, ...props }: MinimalInputProps) {
  return (
    <div className="relative">
      {Icon ? <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" /> : null}
      <input
        {...props}
        className={cn(
          "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-950 placeholder:text-slate-400 transition focus:border-slate-950 focus:outline-none focus:ring-0 dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white",
          Icon ? "pl-10" : "",
          className
        )}
      />
    </div>
  );
}
