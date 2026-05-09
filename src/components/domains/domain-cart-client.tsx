"use client";

import { type InputHTMLAttributes, type ReactNode, useEffect, useMemo, useState, useTransition } from "react";
import { ArrowLeft, Clock, Globe, Lock, Mail, MapPin, Phone, RefreshCcw, ShieldCheck, Trash2, User, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DOMAIN_CART_STORAGE_KEY, type DomainCartItem, readDomainCart, writeDomainCart } from "@/lib/domain-cart";
import type { DomainRegistrantContact } from "@/lib/domain-types";
import { cn } from "@/lib/utils";

const trustBadges = [
  { icon: ShieldCheck, label: "256-bit SSL", desc: "Encrypted" },
  { icon: RefreshCcw, label: "45 days", desc: "Money back" },
  { icon: Zap, label: "99.9%", desc: "Uptime" },
  { icon: Clock, label: "24/7", desc: "Support" }
] as const;

function splitName(value: string | null | undefined) {
  const parts = (value ?? "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function DomainCartClient() {
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isHydrated, setIsHydrated] = useState(false);
  const [domainCart, setDomainCart] = useState<DomainCartItem[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isBuying, startBuy] = useTransition();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const initialNameParts = splitName(session?.user?.name);
  const [registrantContact, setRegistrantContact] = useState<DomainRegistrantContact>({
    firstName: initialNameParts.firstName,
    lastName: initialNameParts.lastName,
    organization: "",
    email: session?.user?.email ?? "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US"
  });

  const cartSubtotal = useMemo(
    () => Number(domainCart.reduce((total, item) => total + item.price * item.years, 0).toFixed(2)),
    [domainCart]
  );

  useEffect(() => {
    const storage = window.localStorage;
    const cart = readDomainCart(storage);
    if (storage.getItem(DOMAIN_CART_STORAGE_KEY) !== JSON.stringify(cart)) writeDomainCart(storage, cart);
    setDomainCart(cart);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const next = splitName(session?.user?.name);
    setRegistrantContact((c) => ({
      ...c,
      firstName: c.firstName || next.firstName,
      lastName: c.lastName || next.lastName,
      email: c.email || session?.user?.email || ""
    }));
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (!isHydrated) return;
    writeDomainCart(window.localStorage, domainCart);
  }, [domainCart, isHydrated]);

  function removeItem(domain: string) {
    setDomainCart((c) => c.filter((item) => item.domain !== domain));
    setError("");
  }

  const contactValid =
    registrantContact.firstName.trim() !== "" &&
    registrantContact.lastName.trim() !== "" &&
    /.+@.+\..+/.test(registrantContact.email.trim()) &&
    registrantContact.phone.trim().length >= 6 &&
    registrantContact.addressLine1.trim().length >= 3 &&
    registrantContact.city.trim().length >= 2 &&
    registrantContact.country.trim().length === 2;

  function handleCheckout() {
    setError("");
    setSuccess("");
    if (!contactValid) { setError("Please complete all required registrant fields."); return; }
    if (!termsAccepted) { setError("Please accept the terms to continue."); return; }
    if (status !== "authenticated") {
      router.push(`/customer/sign-in?callback=${encodeURIComponent("/domains/cart")}`);
      return;
    }
    startBuy(async () => {
      const response = await fetch("/api/domains/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: domainCart.map((item) => ({ domain: item.domain, years: item.years, privacyProtection: item.privacyProtection })),
          registrantContact,
          locale
        })
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; redirectUrl?: string; ok?: boolean };
      if (!response.ok || !payload.ok || !payload.redirectUrl) {
        setError(payload.error ?? "Unable to start domain checkout right now.");
        return;
      }
      setSuccess("Redirecting to secure payment...");
      window.location.href = payload.redirectUrl;
    });
  }

  if (isHydrated && domainCart.length === 0 && !success) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <DomainCheckoutHeader />
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <button type="button" onClick={() => router.push("/domains")} className="inline-flex items-center gap-2 text-[13px] text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to domain search
          </button>
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 dark:border-white/10 dark:bg-slate-950 sm:p-14">
            <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">Domain checkout</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[2.25rem]">Your domain cart is empty</h1>
            <p className="mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-300">Search for a domain and add it to your cart to continue.</p>
            <button type="button" onClick={() => router.push("/domains")} className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-6 text-[13px] font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
              <Globe className="h-4 w-4" />
              Search domains
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <DomainCheckoutHeader />

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <button type="button" onClick={() => router.push("/domains")} className="inline-flex items-center gap-2 text-[13px] text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to domain search
        </button>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
          {/* LEFT — registrant contact */}
          <div className="space-y-6">
            <DomainSection eyebrow="01" icon={User} title="Registrant contact" subtitle="Required for ICANN domain registration.">
              <div className="grid gap-4 sm:grid-cols-2">
                <DomainField label="First name" required>
                  <DomainInput icon={User} value={registrantContact.firstName} onChange={(e) => setRegistrantContact((c) => ({ ...c, firstName: e.target.value }))} placeholder="First name" autoComplete="given-name" />
                </DomainField>
                <DomainField label="Last name" required>
                  <DomainInput icon={User} value={registrantContact.lastName} onChange={(e) => setRegistrantContact((c) => ({ ...c, lastName: e.target.value }))} placeholder="Last name" autoComplete="family-name" />
                </DomainField>
                <div className="sm:col-span-2">
                  <DomainField label="Email" required>
                    <DomainInput icon={Mail} value={registrantContact.email} onChange={(e) => setRegistrantContact((c) => ({ ...c, email: e.target.value }))} placeholder="you@company.com" type="email" autoComplete="email" />
                  </DomainField>
                </div>
                <DomainField label="Phone" required>
                  <DomainInput icon={Phone} value={registrantContact.phone} onChange={(e) => setRegistrantContact((c) => ({ ...c, phone: e.target.value }))} placeholder="+1 555 000 0000" type="tel" autoComplete="tel" />
                </DomainField>
                <DomainField label="Organization">
                  <DomainInput value={registrantContact.organization} onChange={(e) => setRegistrantContact((c) => ({ ...c, organization: e.target.value }))} placeholder="Company name" autoComplete="organization" />
                </DomainField>
              </div>
            </DomainSection>

            <DomainSection eyebrow="02" icon={MapPin} title="Registrant address" subtitle="For ICANN WHOIS records.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <DomainField label="Address line 1" required>
                    <DomainInput value={registrantContact.addressLine1} onChange={(e) => setRegistrantContact((c) => ({ ...c, addressLine1: e.target.value }))} placeholder="123 Main Street" autoComplete="address-line1" />
                  </DomainField>
                </div>
                <div className="sm:col-span-2">
                  <DomainField label="Address line 2">
                    <DomainInput value={registrantContact.addressLine2} onChange={(e) => setRegistrantContact((c) => ({ ...c, addressLine2: e.target.value }))} placeholder="Suite / floor (optional)" autoComplete="address-line2" />
                  </DomainField>
                </div>
                <DomainField label="City" required>
                  <DomainInput value={registrantContact.city} onChange={(e) => setRegistrantContact((c) => ({ ...c, city: e.target.value }))} placeholder="City" autoComplete="address-level2" />
                </DomainField>
                <DomainField label="State / region">
                  <DomainInput value={registrantContact.state} onChange={(e) => setRegistrantContact((c) => ({ ...c, state: e.target.value }))} placeholder="State / region" autoComplete="address-level1" />
                </DomainField>
                <DomainField label="Postal code">
                  <DomainInput value={registrantContact.postalCode} onChange={(e) => setRegistrantContact((c) => ({ ...c, postalCode: e.target.value }))} placeholder="Postal code" autoComplete="postal-code" />
                </DomainField>
                <DomainField label="Country code" required>
                  <DomainInput value={registrantContact.country} onChange={(e) => setRegistrantContact((c) => ({ ...c, country: e.target.value.toUpperCase() }))} placeholder="US" maxLength={2} className="uppercase" autoComplete="country" />
                </DomainField>
              </div>
            </DomainSection>
          </div>

          {/* RIGHT — order summary */}
          <div>
            <div className="space-y-5 lg:sticky lg:top-8 lg:h-fit">
              <section className="rounded-3xl border border-slate-200 bg-white p-7 dark:border-white/10 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <h2 className="text-[13px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Domain order</h2>
                </div>

                <div className="mt-5 space-y-4">
                  {!isHydrated ? (
                    <p className="text-[13px] text-slate-400 dark:text-slate-500">Loading...</p>
                  ) : domainCart.map((item) => (
                    <div key={item.domain} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-white/10">
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-medium text-slate-950 dark:text-white">{item.domain}</div>
                        <div className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
                          {item.years} yr · Privacy {item.privacyProtection ? "on" : "off"}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="text-right">
                          <div className="text-[15px] font-semibold tabular-nums text-slate-950 dark:text-white">${(item.price * item.years).toFixed(2)}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">${item.price.toFixed(2)}/yr</div>
                        </div>
                        <button type="button" onClick={() => removeItem(item.domain)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 dark:border-white/10 dark:hover:border-rose-400/30 dark:hover:text-rose-300" aria-label={`Remove ${item.domain}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-950 dark:text-white">Total today</span>
                    <span className="text-2xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-white">${cartSubtotal.toFixed(2)}</span>
                  </div>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 text-[12px] leading-5 text-slate-600 dark:text-slate-400">
                  <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 dark:border-white/20 dark:bg-transparent" />
                  <span>I agree to the domain registration terms and ICANN policies.</span>
                </label>

                {status !== "authenticated" ? (
                  <button type="button" onClick={() => router.push(`/customer/sign-in?callback=${encodeURIComponent("/domains/cart")}`)} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-[13px] font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                    <Lock className="h-4 w-4" />
                    Sign in to continue
                  </button>
                ) : (
                  <button type="button" onClick={handleCheckout} disabled={!isHydrated || domainCart.length === 0 || isBuying} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-[13px] font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                    <Lock className="h-4 w-4" />
                    {isBuying ? "Starting checkout..." : `Checkout · $${cartSubtotal.toFixed(2)}`}
                  </button>
                )}

                {error ? <p className="mt-3 text-[12px] text-rose-600 dark:text-rose-300">{error}</p> : null}
                {!error && success ? <p className="mt-3 text-[12px] text-emerald-600 dark:text-emerald-300">{success}</p> : null}

                <div className="mt-4 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted</span>
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> PCI compliant</span>
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function DomainCheckoutHeader() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-800 dark:border-white/10 dark:text-slate-200">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[13px] font-semibold tracking-tight text-slate-950 dark:text-white">Secure domain checkout</div>
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

function DomainSection({ eyebrow, icon: Icon, title, subtitle, children }: { eyebrow: string; icon: typeof Mail; title: string; subtitle?: string; children: ReactNode }) {
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

function DomainField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {label}{required ? <span className="ml-1 text-slate-400">*</span> : null}
      </span>
      {children}
    </label>
  );
}

type DomainInputProps = InputHTMLAttributes<HTMLInputElement> & { icon?: typeof Mail };

function DomainInput({ icon: Icon, className, ...props }: DomainInputProps) {
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
