"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DOMAIN_CART_STORAGE_KEY, type DomainCartItem, readDomainCart, writeDomainCart } from "@/lib/domain-cart";
import type { DomainRegistrantContact } from "@/lib/domain-types";

function splitName(value: string | null | undefined) {
  const parts = (value ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ")
  };
}

export function DomainCartClient() {
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isHydrated, setIsHydrated] = useState(false);
  const [domainCart, setDomainCart] = useState<DomainCartItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isBuying, startBuy] = useTransition();
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
    () => Number(domainCart.reduce((total, item) => total + (item.price * item.years), 0).toFixed(2)),
    [domainCart]
  );

  useEffect(() => {
    const storage = window.localStorage;
    const cart = readDomainCart(storage);

    if (storage.getItem(DOMAIN_CART_STORAGE_KEY) !== JSON.stringify(cart)) {
      writeDomainCart(storage, cart);
    }

    setDomainCart(cart);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const nextNameParts = splitName(session?.user?.name);

    setRegistrantContact((current) => ({
      ...current,
      firstName: current.firstName || nextNameParts.firstName,
      lastName: current.lastName || nextNameParts.lastName,
      email: current.email || session?.user?.email || ""
    }));
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writeDomainCart(window.localStorage, domainCart);
  }, [domainCart, isHydrated]);

  function removeDomainCartItem(domain: string) {
    setDomainCart((current) => current.filter((item) => item.domain !== domain));
    setMessage(`${domain} removed from your domain cart.`);
    setError("");
  }

  function clearCart() {
    setDomainCart([]);
    setMessage("Domain cart cleared.");
    setError("");
  }

  function handleCheckout() {
    setError("");
    setMessage("");

    if (domainCart.length === 0) {
      return;
    }

    if (status !== "authenticated") {
      router.push(`/customer/sign-in?callback=${encodeURIComponent("/domains/cart")}`);
      return;
    }

    startBuy(async () => {
      const response = await fetch("/api/domains/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: domainCart.map((item) => ({
            domain: item.domain,
            years: item.years,
            privacyProtection: item.privacyProtection
          })),
          registrantContact,
          locale
        })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; redirectUrl?: string; ok?: boolean };

      if (!response.ok || !payload.ok || !payload.redirectUrl) {
        setError(payload.error ?? "Unable to start domain checkout right now.");
        return;
      }

      setMessage("Redirecting to secure domain checkout...");
      window.location.href = payload.redirectUrl;
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_18px_70px_rgba(2,6,23,0.55)] sm:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Domain cart</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Review and checkout domains</h1>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">Manage selected domains, confirm registrant details, and continue to payment.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="text-sm text-slate-500 dark:text-slate-400">Cart total</div>
            <div className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">${cartSubtotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => router.push("/domains")} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]">
            Continue searching
          </button>
          <button type="button" onClick={clearCart} disabled={domainCart.length === 0} className="inline-flex h-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50">
            Clear cart
          </button>
        </div>

        {message ? <p className="mt-5 text-sm text-emerald-600 dark:text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-5 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      </section>

      <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_18px_70px_rgba(2,6,23,0.45)] sm:p-10">
        <div className="space-y-4">
          {domainCart.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              {isHydrated ? "Your domain cart is empty." : "Loading domain cart..."}
            </div>
          ) : (
            domainCart.map((item) => (
              <div key={item.domain} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-950 dark:text-white">{item.domain}</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.years} year registration · Privacy protection {item.privacyProtection ? "included" : "disabled"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-950 dark:text-white">${(item.price * item.years).toFixed(2)}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">${item.price.toFixed(2)} / year</div>
                    </div>
                    <button type="button" onClick={() => removeDomainCartItem(item.domain)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-rose-400/30 dark:hover:text-rose-200" aria-label={`Remove ${item.domain} from cart`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Registrant contact</div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input value={registrantContact.firstName} onChange={(event) => setRegistrantContact((current) => ({ ...current, firstName: event.target.value }))} placeholder="First name" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white" />
            <input value={registrantContact.lastName} onChange={(event) => setRegistrantContact((current) => ({ ...current, lastName: event.target.value }))} placeholder="Last name" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white" />
            <input value={registrantContact.organization} onChange={(event) => setRegistrantContact((current) => ({ ...current, organization: event.target.value }))} placeholder="Organization" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white" />
            <input value={registrantContact.email} onChange={(event) => setRegistrantContact((current) => ({ ...current, email: event.target.value }))} placeholder="Email" type="email" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white" />
            <input value={registrantContact.phone} onChange={(event) => setRegistrantContact((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white" />
            <input value={registrantContact.country} onChange={(event) => setRegistrantContact((current) => ({ ...current, country: event.target.value.toUpperCase() }))} placeholder="Country code" maxLength={2} className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm uppercase text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white" />
            <input value={registrantContact.addressLine1} onChange={(event) => setRegistrantContact((current) => ({ ...current, addressLine1: event.target.value }))} placeholder="Address line 1" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white md:col-span-2" />
            <input value={registrantContact.addressLine2} onChange={(event) => setRegistrantContact((current) => ({ ...current, addressLine2: event.target.value }))} placeholder="Address line 2" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white md:col-span-2" />
            <input value={registrantContact.city} onChange={(event) => setRegistrantContact((current) => ({ ...current, city: event.target.value }))} placeholder="City" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white" />
            <input value={registrantContact.state} onChange={(event) => setRegistrantContact((current) => ({ ...current, state: event.target.value }))} placeholder="State / region" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white" />
            <input value={registrantContact.postalCode} onChange={(event) => setRegistrantContact((current) => ({ ...current, postalCode: event.target.value }))} placeholder="Postal code" className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/40 dark:text-white" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {isHydrated ? `${domainCart.length} domain${domainCart.length === 1 ? "" : "s"} selected for checkout.` : "Loading domain cart..."}
          </div>
          <button type="button" onClick={handleCheckout} disabled={!isHydrated || domainCart.length === 0 || isBuying} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">
            <ShoppingCart className="h-4 w-4" />
            {status === "authenticated" ? (isBuying ? "Starting checkout..." : "Checkout domains") : "Sign in to checkout"}
          </button>
        </div>
      </section>
    </main>
  );
}
