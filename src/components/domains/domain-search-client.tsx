"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Lock,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { type DomainCartItem, readDomainCart, writeDomainCart } from "@/lib/domain-cart";
import type { DomainSearchResult } from "@/lib/domain-types";

type SearchResponse = {
  results: DomainSearchResult[];
  defaultYears: number;
  domainsEnabled: boolean;
  providerLabel: string;
  includePrivacyProtectionByDefault: boolean;
  popularTlds?: string[];
};

const DEFAULT_POPULAR_TLDS = [".com", ".net", ".io", ".co", ".ai", ".app", ".dev"];

const FEATURES = [
  { icon: Shield, title: "WHOIS Privacy", desc: "Keep personal info protected" },
  { icon: Lock, title: "SSL Ready", desc: "Free SSL with every domain" },
  { icon: Zap, title: "Instant DNS", desc: "Propagates in minutes" },
  { icon: Globe, title: "Global CDN", desc: "Fast worldwide delivery" },
];

export function DomainSearchClient() {
  const t = useTranslations("Domains");
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
  const inputRef = useRef<HTMLInputElement>(null);

  const [popularTlds, setPopularTlds] = useState<string[]>(DEFAULT_POPULAR_TLDS);

  const cartDomains = useMemo(() => new Set(domainCart.map((item) => item.domain)), [domainCart]);
  const queryFromUrl = (searchParams.get("query") ?? "").trim();

  useEffect(() => {
    // Initial fetch to get popular TLDs and settings even if query is empty
    if (!queryFromUrl) {
      void performSearch("");
    }
  }, []);

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
    if (!isHydrated) return;
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
      if (payload.popularTlds) {
        setPopularTlds(payload.popularTlds);
      }
      if (payload.domainsEnabled === false) {
        setMessage("Domain registrations are currently disabled.");
      } else {
        const availableCount = payload.results?.filter((r) => r.status === "available").length ?? 0;
        setMessage(
          payload.results?.length
            ? availableCount > 0
              ? `${availableCount} domain${availableCount === 1 ? " is" : "s are"} available to register.`
              : "No available domains found for this search."
            : "No matching domain results."
        );
      }
    });
  }, [startSearch]);

  function handleSearch() {
    const v = query.trim();
    if (v) void performSearch(v);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  useEffect(() => {
    if (!queryFromUrl || autoSearchRef.current === queryFromUrl) return;
    autoSearchRef.current = queryFromUrl;
    setQuery(queryFromUrl);
    void performSearch(queryFromUrl);
  }, [performSearch, queryFromUrl]);

  function toggleDomainCartItem(result: DomainSearchResult) {
    setError("");
    setMessage("");
    if (!domainsEnabled) { setError("Domain registrations are currently disabled."); return; }
    if (result.status !== "available") {
      setError(result.status === "taken" ? `${result.domain} is already taken.` : `${result.domain} is unavailable right now.`);
      return;
    }
    setDomainCart((current) => {
      const exists = current.some((item) => item.domain === result.domain);
      if (exists) { setMessage(`${result.domain} removed from cart.`); return current.filter((item) => item.domain !== result.domain); }
      setMessage(`${result.domain} added to cart.`);
      return [...current, { domain: result.domain, years, price: result.price, privacyProtection: privacyProtectionDefault, addedAt: new Date().toISOString() }];
    });
  }

  function getStatusTone(result: DomainSearchResult) {
    if (result.status === "available") return "from-emerald-500 to-teal-500";
    if (result.status === "taken") return "from-rose-500 to-red-500";
    return "from-amber-500 to-orange-500";
  }

  function getStatusBg(result: DomainSearchResult) {
    if (result.status === "available") return "border-emerald-200/60 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]";
    if (result.status === "taken") return "border-rose-200/60 bg-rose-50/80 dark:border-rose-400/20 dark:bg-rose-400/[0.06]";
    return "border-amber-200/60 bg-amber-50/80 dark:border-amber-400/20 dark:bg-amber-400/[0.06]";
  }

  return (
    <main className="min-h-screen bg-[#fafbfc] dark:bg-[#06080f]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pb-20 pt-28 sm:pt-36">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[20%] -top-[30%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_60%)] blur-3xl" />
          <div className="absolute -right-[15%] top-[5%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.14),transparent_60%)] blur-3xl" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.28em] text-indigo-700 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              {t("heroEyebrow")}
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-6 text-center text-5xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg text-slate-500 dark:text-slate-400">
            {t("heroDescription").replace("{providerLabel}", providerLabel || "our domain registry partners")}
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="group relative flex items-center gap-3 rounded-[28px] border border-slate-200/80 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] transition-all duration-300 focus-within:border-indigo-400/50 focus-within:shadow-[0_24px_80px_rgba(99,102,241,0.18)] dark:border-white/[0.08] dark:bg-slate-950/80 dark:focus-within:border-indigo-400/40">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent py-3 text-base text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                  placeholder={t("searchPlaceholder")}
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="hidden h-12 rounded-[18px] border border-slate-200/80 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 sm:block"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((y) => (
                    <option key={y} value={y}>{y} yr{y > 1 ? "s" : ""}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching || query.trim().length === 0}
                  className="inline-flex h-12 items-center gap-2 rounded-[18px] bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(99,102,241,0.45)] disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
                >
                  {isSearching ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{isSearching ? t("searchingButton") : t("searchButton")}</span>
                </button>
              </div>
            </div>

            {/* Popular TLDs */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {popularTlds.slice(0, 7).map((tld) => (
                <button
                  key={tld}
                  type="button"
                  onClick={() => {
                    const base = query.replace(/\.[^.]+$/, "").trim() || "yourdomain";
                    setQuery(base + tld);
                    void performSearch(base + tld);
                  }}
                  className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-indigo-400/40 dark:hover:text-indigo-400"
                >
                  {tld}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATUS MESSAGES ── */}
      {(message || error) && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {message && (
            <div className="mb-4 flex items-center gap-3 rounded-[18px] border border-emerald-200/60 bg-emerald-50/80 px-5 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06] dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-3 rounded-[18px] border border-rose-200/60 bg-rose-50/80 px-5 py-3 text-sm font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/[0.06] dark:text-rose-300">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── RESULTS ── */}
      <section className="mx-auto max-w-6xl px-4 pb-32 sm:px-6 lg:px-8">
        {results.length === 0 ? (
          /* Empty state */
          <div className="mt-4 space-y-12">
            {/* Features grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="group flex flex-col items-center gap-3 rounded-[28px] border border-slate-200/60 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm transition hover:border-indigo-200/60 hover:shadow-md dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20">
                    <f.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-950 dark:text-white">{f.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Domain status badge info */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2">
                {!domainsEnabled && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/[0.06] dark:text-rose-300">
                    <ShieldAlert className="h-4 w-4" /> Domain registration currently disabled
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Enter a domain name above to check availability and add to cart
              </p>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="mt-4 space-y-4">
            {results.map((result) => {
              const inCart = cartDomains.has(result.domain);
              const isAvailable = result.status === "available";
              const isTaken = result.status === "taken";
              return (
                <div
                  key={result.domain}
                  className={`group relative overflow-hidden rounded-[28px] border p-6 shadow-sm transition-all duration-300 hover:shadow-lg ${getStatusBg(result)} dark:hover:bg-opacity-100`}
                >
                  {/* Gradient accent */}
                  <div className={`pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${getStatusTone(result)}`} />

                  <div className="flex flex-col gap-4 pl-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Domain info */}
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getStatusTone(result)} shadow-sm`}>
                        {isAvailable ? <Globe className="h-5 w-5 text-white" /> : <ShieldAlert className="h-5 w-5 text-white" />}
                      </div>
                      <div>
                        <p className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">{result.domain}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${isAvailable ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300" : isTaken ? "bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-300" : "bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300"}`}>
                            {isAvailable ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                            {isAvailable ? "Available" : isTaken ? "Taken" : "Unknown"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            via {result.source.toUpperCase()} registry
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price + actions */}
                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <div className="text-right">
                        <div className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                          ${(result.price * years).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          for {years} yr{years > 1 ? "s" : ""} &bull; ${result.price.toFixed(2)}/yr
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isAvailable && (
                          <button
                            type="button"
                            onClick={() => toggleDomainCartItem(result)}
                            className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 ${inCart ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 dark:shadow-indigo-900" : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)]"}`}
                          >
                            {inCart ? <CheckCircle2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                            {inCart ? "In Cart" : "Add to Cart"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => router.push("/domains/cart")}
                          className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 text-sm font-semibold text-slate-700 backdrop-blur-sm transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {isHydrated ? `Cart (${domainCart.length})` : "Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Cart CTA */}
            {domainCart.length > 0 && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => router.push("/domains/cart")}
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 text-base font-bold text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(99,102,241,0.45)]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Checkout — {domainCart.length} domain{domainCart.length > 1 ? "s" : ""} in cart
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── TRUST SECTION ── */}
      <section className="border-t border-slate-200/40 bg-white py-16 dark:border-white/[0.06] dark:bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { icon: Star, value: "4.9/5", label: "Customer Rating", sub: "Based on 5,218+ reviews" },
              { icon: ShieldCheck, value: "99.9%", label: "Uptime Guarantee", sub: "DNS always available" },
              { icon: Globe, value: "500+", label: "Extensions", sub: "All major TLDs supported" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20">
                  <s.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-slate-950 dark:text-white">{s.value}</div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s.label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
