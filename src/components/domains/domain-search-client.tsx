"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CheckCircle2, Search, ShieldAlert, ShieldCheck, ShoppingCart } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { type DomainCartItem, readDomainCart, writeDomainCart } from "@/lib/domain-cart";
import type { DomainSearchResult } from "@/lib/domain-types";

type SearchResponse = {
  results: DomainSearchResult[];
  defaultYears: number;
  domainsEnabled: boolean;
  providerLabel: string;
  includePrivacyProtectionByDefault: boolean;
};

export function DomainSearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [years, setYears] = useState(1);
  const [results, setResults] = useState<DomainSearchResult[]>([]);
  const [domainsEnabled, setDomainsEnabled] = useState(true);
  const [providerLabel, setProviderLabel] = useState("");
  const [privacyProtectionDefault, setPrivacyProtectionDefault] = useState(true);
  const [domainCart, setDomainCart] = useState<DomainCartItem[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSearching, startSearch] = useTransition();
  const autoSearchRef = useRef<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  const cartDomains = useMemo(() => new Set(domainCart.map((item) => item.domain)), [domainCart]);
  const queryFromUrl = (searchParams.get("query") ?? "").trim();

  useEffect(() => {
    try {
      setDomainCart(readDomainCart(window.localStorage));
    } catch {
      setDomainCart([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    writeDomainCart(window.localStorage, domainCart);
  }, [domainCart, isHydrated]);

  const performSearch = useCallback((searchValue: string) => {
    setError("");
    setMessage("");

    startSearch(async () => {
      const response = await fetch(`/api/domains/search?query=${encodeURIComponent(searchValue)}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({ results: [] }))) as Partial<SearchResponse> & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to search domains right now.");
        return;
      }

      setResults(payload.results ?? []);
      setYears(payload.defaultYears ?? 1);
      setDomainsEnabled(payload.domainsEnabled !== false);
      setProviderLabel(payload.providerLabel ?? "");
      setPrivacyProtectionDefault(payload.includePrivacyProtectionByDefault !== false);

      if (payload.domainsEnabled === false) {
        setMessage("Domain registrations are currently disabled in admin settings.");
      } else {
        const availableCount = payload.results?.filter((result) => result.status === "available").length ?? 0;
        setMessage(
          payload.results?.length
            ? availableCount > 0
              ? `${availableCount} domain${availableCount === 1 ? " is" : "s are"} available to add to cart.`
              : "No available domains found for this search yet."
            : "No matching domain results yet."
        );
      }
    });
  }, [startSearch]);

  function handleSearch() {
    const searchValue = query.trim();

    if (!searchValue) {
      return;
    }

    void performSearch(searchValue);
  }

  useEffect(() => {
    if (!queryFromUrl || autoSearchRef.current === queryFromUrl) {
      return;
    }

    autoSearchRef.current = queryFromUrl;
    setQuery(queryFromUrl);
    void performSearch(queryFromUrl);
  }, [performSearch, queryFromUrl]);

  function toggleDomainCartItem(result: DomainSearchResult) {
    setError("");
    setMessage("");

    if (!domainsEnabled) {
      setError("Domain registrations are currently disabled in admin settings.");
      return;
    }

    if (result.status !== "available") {
      setError(result.status === "taken" ? `${result.domain} is already taken.` : `${result.domain} is unavailable right now.`);
      return;
    }

    setDomainCart((current) => {
      const exists = current.some((item) => item.domain === result.domain);

      if (exists) {
        setMessage(`${result.domain} removed from your domain cart.`);
        return current.filter((item) => item.domain !== result.domain);
      }

      setMessage(`${result.domain} added to your domain cart.`);
      return [...current, {
        domain: result.domain,
        years,
        price: result.price,
        privacyProtection: privacyProtectionDefault,
        addedAt: new Date().toISOString()
      }];
    });
  }

  function getStatusLabel(result: DomainSearchResult) {
    if (result.status === "available") {
      return "Available for registration";
    }

    if (result.status === "taken") {
      return "Domain taken";
    }

    return "Availability unknown";
  }

  function getStatusTone(result: DomainSearchResult) {
    if (result.status === "available") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200";
    }

    if (result.status === "taken") {
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200";
    }

    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200";
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_18px_70px_rgba(2,6,23,0.55)] sm:p-10">
        <div className="max-w-3xl">
          <div className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Domain search</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Search and buy domains</h1>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">Check domain availability, add available domains to your cart, and complete checkout through the admin-managed payment setup.</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${domainsEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"}`}>
            {domainsEnabled ? "Domains enabled" : "Domains disabled"}
          </div>
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            {providerLabel ? `Automation: ${providerLabel}` : "Automation managed from admin settings"}
          </div>
          <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
            Checkout provider is managed in admin settings
          </div>
          <button type="button" onClick={() => router.push("/domains/cart")} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08]">
            <ShoppingCart className="h-3.5 w-3.5" />
            {isHydrated ? `${domainCart.length} in cart` : "Open cart"}
          </button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_140px_160px]">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Domain or keyword</span>
            <span className="flex h-12 items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-slate-700 focus-within:border-slate-950 focus-within:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:focus-within:border-cyan-300 dark:focus-within:bg-white/[0.08]">
              <Search className="h-4 w-4" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500" placeholder="example.com or example" />
            </span>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Years</span>
            <input type="number" min={1} max={10} value={years} onChange={(event) => setYears(Math.max(1, Number(event.target.value) || 1))} className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:focus:border-cyan-300 dark:focus:bg-white/[0.08]" />
          </label>
          <button type="button" onClick={handleSearch} disabled={isSearching || query.trim().length === 0} className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
            {isSearching ? "Searching..." : "Search domain"}
          </button>
        </div>
        {message ? <p className="mt-5 text-sm text-emerald-600 dark:text-emerald-300">{message}</p> : null}
        {error ? <p className="mt-5 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
      </section>

      <section className="mt-8 space-y-4">
        {results.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">Search for a domain to see availability and add it to your cart page.</div>
        ) : null}
        {results.map((result) => (
          <div key={result.domain} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_18px_70px_rgba(2,6,23,0.45)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{result.domain}</div>
                <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${getStatusTone(result)}`}>
                  {result.status === "taken" ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  {getStatusLabel(result)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-slate-950 dark:text-white">${(result.price * years).toFixed(2)}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{years} year registration</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                <ShieldCheck className="h-4 w-4" />
                {result.source.toUpperCase()} verification
              </div>
              <button type="button" onClick={() => toggleDomainCartItem(result)} disabled={!domainsEnabled || result.status !== "available"} className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${cartDomains.has(result.domain) ? "border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/20" : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"}`}>
                {cartDomains.has(result.domain) ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                {result.status === "available"
                  ? cartDomains.has(result.domain)
                    ? "Remove from cart"
                    : "Add to cart"
                  : result.status === "taken"
                    ? "Domain taken"
                    : "Unavailable"}
              </button>
              <button type="button" onClick={() => router.push("/domains/cart")} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]">
                <ShoppingCart className="h-4 w-4" />
                Open cart
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
