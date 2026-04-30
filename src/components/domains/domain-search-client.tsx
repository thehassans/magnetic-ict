"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import type { DomainSearchResult } from "@/lib/domain-types";

type SearchResponse = {
  results: DomainSearchResult[];
  defaultYears: number;
  domainsEnabled: boolean;
};

const paymentMethods = ["STRIPE", "PAYPAL"] as const;

export function DomainSearchClient() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [query, setQuery] = useState("");
  const [years, setYears] = useState(1);
  const [results, setResults] = useState<DomainSearchResult[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]>("STRIPE");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSearching, startSearch] = useTransition();
  const [isBuying, startBuy] = useTransition();
  const autoSearchRef = useRef<string>("");

  const availableResults = useMemo(() => results.filter((result) => result.available !== false), [results]);
  const queryFromUrl = (searchParams.get("query") ?? "").trim();

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
      if (payload.domainsEnabled === false) {
        setMessage("Domains are currently disabled in platform settings.");
      } else {
        setMessage(payload.results?.length ? "Search completed." : "No matching domain results yet.");
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

  function handleBuy(domain: string, price: number) {
    setError("");
    setMessage("");

    if (status !== "authenticated") {
      router.push(`/customer/sign-in?callback=${encodeURIComponent("/domains")}`);
      return;
    }

    startBuy(async () => {
      const response = await fetch("/api/domains/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          domain,
          years,
          paymentMethod,
          price,
          privacyProtection: true,
          locale
        })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; redirectUrl?: string; ok?: boolean };

      if (!response.ok || !payload.ok || !payload.redirectUrl) {
        setError(payload.error ?? "Unable to start domain checkout right now.");
        return;
      }

      window.location.href = payload.redirectUrl;
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-10">
        <div className="max-w-3xl">
          <div className="text-sm uppercase tracking-[0.28em] text-slate-500">Domain search</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Search and buy domains</h1>
          <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">Check domain availability, choose your registration term, and complete purchase directly on Magnetic. Paid domains can be processed manually or sent to the configured registrar automation from admin settings.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_140px_160px]">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-700">Domain or keyword</span>
            <span className="flex h-12 items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-slate-700 focus-within:border-slate-950 focus-within:bg-white">
              <Search className="h-4 w-4" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-sm text-slate-950 outline-none" placeholder="example.com or example" />
            </span>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-700">Years</span>
            <input type="number" min={1} max={10} value={years} onChange={(event) => setYears(Math.max(1, Number(event.target.value) || 1))} className="h-12 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
          </label>
          <button type="button" onClick={handleSearch} disabled={isSearching || query.trim().length === 0} className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
            {isSearching ? "Searching..." : "Search domain"}
          </button>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {paymentMethods.map((method) => (
            <button key={method} type="button" onClick={() => setPaymentMethod(method)} className={`inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${paymentMethod === method ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"}`}>
              {method}
            </button>
          ))}
        </div>
        {message ? <p className="mt-5 text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="mt-5 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="mt-8 space-y-4">
        {availableResults.length === 0 && results.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Search for a domain to see availability and checkout options.</div>
        ) : null}
        {results.map((result) => (
          <div key={result.domain} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-950">{result.domain}</div>
                <div className="mt-2 text-sm text-slate-500">{result.status === "available" ? "Available" : result.status === "taken" ? "Already registered" : "Availability unknown"}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-slate-950">${(result.price * years).toFixed(2)}</div>
                <div className="mt-1 text-sm text-slate-500">{years} year registration</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                {result.source.toUpperCase()} availability check
              </div>
              <button type="button" onClick={() => handleBuy(result.domain, result.price)} disabled={isBuying || result.available === false} className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
                {status === "authenticated" ? "Buy domain" : "Sign in to buy"}
              </button>
            </div>
          </div>
        ))}
      </section>
      {session?.user?.email ? <div className="hidden">{session.user.email}</div> : null}
    </main>
  );
}
