"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeroDomainSearchProps = {
  locale: string;
};

const tldSuggestions = [".com", ".net", ".org", ".com.bd"] as const;

export function HeroDomainSearch({ locale }: HeroDomainSearchProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = useMemo(() => query.trim(), [query]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedQuery) {
      return;
    }

    window.location.href = `/${locale}/domains?query=${encodeURIComponent(normalizedQuery)}`;
  }

  function applySuggestion(suffix: string) {
    const nextValue = normalizedQuery.length === 0
      ? `magnetic${suffix}`
      : normalizedQuery.includes(".")
        ? normalizedQuery
        : `${normalizedQuery}${suffix}`;

    setQuery(nextValue);
  }

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
        <Sparkles className="h-3.5 w-3.5" />
        Domain search
      </div>
      <h2 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">Check your domain instantly</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Search domain availability directly from the homepage and continue into the full checkout flow.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="flex h-12 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 text-slate-700 focus-within:border-slate-950 focus-within:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:focus-within:border-cyan-300 dark:focus-within:bg-slate-950/70">
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            placeholder="example.com"
            aria-label="Search domain"
          />
        </label>
        <Button type="submit" className="h-12 rounded-full px-6" disabled={normalizedQuery.length === 0}>
          Search domain
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {tldSuggestions.map((suffix) => (
          <button
            key={suffix}
            type="button"
            onClick={() => applySuggestion(suffix)}
            className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-400/20 dark:hover:text-cyan-200"
          >
            {suffix}
          </button>
        ))}
      </div>
    </div>
  );
}
