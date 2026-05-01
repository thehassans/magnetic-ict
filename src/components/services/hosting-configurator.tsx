"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Search, ShieldCheck, X } from "lucide-react";
import { createDefaultHostingSelection, getHostingConfigurationTotal, resolveHostingConfiguration } from "@/lib/hosting-commerce";
import type { DomainSearchResult } from "@/lib/domain-types";
import type { HostingConfigurationSelection, HostingProviderSettings } from "@/lib/hosting-types";
import { cn } from "@/lib/utils";

type HostingConfiguratorProps = {
  settings: HostingProviderSettings;
  basePrice: number;
  value?: HostingConfigurationSelection;
  onChange: (selection: HostingConfigurationSelection, summaryLines: string[], totalPrice: number) => void;
};

type DomainSearchResponse = {
  results: DomainSearchResult[];
  defaultYears: number;
  domainsEnabled: boolean;
  providerLabel: string;
};

export function HostingConfigurator({ settings, basePrice, value, onChange }: HostingConfiguratorProps) {
  const resolved = resolveHostingConfiguration(value ?? createDefaultHostingSelection(settings), settings);
  const [domainQuery, setDomainQuery] = useState(resolved.selection.domainName);
  const [domainResults, setDomainResults] = useState<DomainSearchResult[]>([]);
  const [domainsEnabled, setDomainsEnabled] = useState(true);
  const [providerLabel, setProviderLabel] = useState("");
  const [domainMessage, setDomainMessage] = useState("");
  const [domainDefaultYears, setDomainDefaultYears] = useState(Math.max(1, resolved.selection.domainYears || 1));
  const [isSearching, startSearch] = useTransition();

  function updateSelection(next: Partial<HostingConfigurationSelection>) {
    const nextSelection: HostingConfigurationSelection = {
      ...resolved.selection,
      ...next
    };
    const nextResolved = resolveHostingConfiguration(nextSelection, settings);
    onChange(nextResolved.selection, nextResolved.summaryLines, getHostingConfigurationTotal(basePrice, nextResolved));
  }

  async function handleDomainSearch() {
    const query = domainQuery.trim();

    if (!query) {
      setDomainResults([]);
      setDomainMessage("");
      return;
    }

    startSearch(async () => {
      const response = await fetch(`/api/domains/search?query=${encodeURIComponent(query)}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => ({ results: [] }))) as Partial<DomainSearchResponse> & { error?: string };

      if (!response.ok) {
        setDomainResults([]);
        setDomainMessage(payload.error ?? "Unable to search domains.");
        return;
      }

      const results = payload.results ?? [];
      setDomainResults(results);
      setDomainsEnabled(payload.domainsEnabled !== false);
      setProviderLabel(payload.providerLabel ?? "");
      setDomainDefaultYears(Math.max(1, payload.defaultYears ?? 1));

      if (payload.domainsEnabled === false) {
        setDomainMessage("Domains disabled");
        return;
      }

      const availableCount = results.filter((result) => result.status === "available").length;
      setDomainMessage(availableCount > 0 ? `${availableCount} available` : "No available domains");
    });
  }

  function attachDomain(result: DomainSearchResult) {
    if (result.status !== "available") {
      return;
    }

    updateSelection({
      domainMode: "register",
      domainName: result.domain,
      domainYears: Math.max(1, domainDefaultYears),
      domainPrivacyProtection: true,
      domainUnitPrice: result.price
    });
    setDomainQuery(result.domain);
  }

  function clearDomain() {
    updateSelection({
      domainMode: "none",
      domainName: "",
      domainYears: 1,
      domainPrivacyProtection: true,
      domainUnitPrice: 0
    });
    setDomainQuery("");
  }

  const operatingSystems = settings.operatingSystems.filter((operatingSystem) => operatingSystem.enabled);
  const controlPanels = settings.controlPanels.filter((panel) => panel.enabled);
  const locations = settings.locations.filter((location) => location.enabled);
  const addons = settings.addons.filter((addon) => addon.enabled);

  return (
    <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 sm:p-6">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h3 className="text-xl font-semibold text-slate-950 dark:text-white">Configure server</h3>
        </div>
        <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="grid gap-1 text-right text-xs text-slate-500 dark:text-slate-400">
            <div>Server +${resolved.extraMonthlyPrice.toFixed(2)}</div>
            {resolved.domain.mode === "register" ? <div>Domain +${resolved.domainRegistrationPrice.toFixed(2)}</div> : null}
            <div className="text-lg font-semibold text-slate-950 dark:text-white">${getHostingConfigurationTotal(basePrice, resolved).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <div className="mb-3 text-sm font-medium text-slate-950 dark:text-white">Operating system</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {operatingSystems.map((operatingSystem) => {
              const active = resolved.selection.operatingSystemId === operatingSystem.id;
              return (
                <button
                  key={operatingSystem.id}
                  type="button"
                  onClick={() => updateSelection({ operatingSystemId: operatingSystem.id })}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition",
                    active
                      ? "border-slate-950 bg-slate-950 text-white dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950"
                      : "border-slate-200 bg-slate-50 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{operatingSystem.name}</div>
                      <div className={cn("mt-1 text-xs", active ? "text-white/70 dark:text-slate-950/70" : "text-slate-500 dark:text-slate-400")}>{operatingSystem.imageAlias}</div>
                    </div>
                    {active ? <Check className="h-4 w-4" /> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 text-sm font-medium text-slate-950 dark:text-white">Server panel</div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {controlPanels.map((panel) => {
              const active = resolved.selection.controlPanelId === panel.id;
              return (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => updateSelection({ controlPanelId: panel.id })}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition",
                    active
                      ? "border-slate-950 bg-slate-950 text-white dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950"
                      : "border-slate-200 bg-slate-50 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{panel.name}</div>
                      <div className={cn("mt-1 text-xs", active ? "text-white/70 dark:text-slate-950/70" : "text-slate-500 dark:text-slate-400")}>+${panel.monthlyPrice}/mo</div>
                    </div>
                    {active ? <Check className="h-4 w-4" /> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 text-sm font-medium text-slate-950 dark:text-white">Region</div>
          <div className="grid gap-3 md:grid-cols-3">
            {locations.map((location) => {
              const active = resolved.selection.locationId === location.id;
              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => updateSelection({ locationId: location.id })}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition",
                    active
                      ? "border-cyan-200 bg-cyan-50 dark:border-cyan-400/30 dark:bg-cyan-400/10"
                      : "border-slate-200 bg-slate-50 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-950 dark:text-white">{location.name}</div>
                    {active ? <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-300" /> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 text-sm font-medium text-slate-950 dark:text-white">Extras</div>
          <div className="grid gap-3 md:grid-cols-3">
            {addons.map((addon) => {
              const active = resolved.selection.addonIds.includes(addon.id);
              return (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() =>
                    updateSelection({
                      addonIds: active
                        ? resolved.selection.addonIds.filter((addonId) => addonId !== addon.id)
                        : [...resolved.selection.addonIds, addon.id]
                    })
                  }
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition",
                    active
                      ? "border-violet-200 bg-violet-50 dark:border-violet-400/30 dark:bg-violet-400/10"
                      : "border-slate-200 bg-slate-50 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950 dark:text-white">{addon.name}</div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">+${addon.monthlyPrice}/mo</div>
                    </div>
                    {active ? <Check className="h-4 w-4 text-violet-600 dark:text-violet-300" /> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 text-sm font-medium text-slate-950 dark:text-white">Domain</div>
          <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex flex-col gap-3 lg:flex-row">
              <label className="flex-1">
                <span className="sr-only">Domain</span>
                <span className="flex h-12 items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 text-slate-700 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200">
                  <Search className="h-4 w-4" />
                  <input
                    value={domainQuery}
                    onChange={(event) => setDomainQuery(event.target.value)}
                    className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                    placeholder="example.com"
                  />
                </span>
              </label>
              <button
                type="button"
                onClick={() => void handleDomainSearch()}
                disabled={isSearching || domainQuery.trim().length === 0}
                className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{providerLabel || "IONOS domain flow"}</span>
              {domainMessage ? <span>{domainMessage}</span> : null}
              {resolved.domain.mode === "register" && resolved.domain.name ? (
                <button
                  type="button"
                  onClick={clearDomain}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 transition hover:border-rose-200 hover:text-rose-600 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              ) : null}
            </div>

            {resolved.domain.mode === "register" && resolved.domain.name ? (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold">{resolved.domain.name}</span>
                <span>${resolved.domain.totalPrice.toFixed(2)}</span>
                <span>{resolved.domain.years} year{resolved.domain.years === 1 ? "" : "s"}</span>
              </div>
            ) : null}

            {resolved.domain.mode === "register" && resolved.domain.name ? (
              <div className="mt-4 grid gap-3 md:grid-cols-[140px_1fr]">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">Years</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={resolved.domain.years}
                    onChange={(event) => updateSelection({ domainYears: Math.max(1, Math.min(10, Number(event.target.value) || 1)) })}
                    className="h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => updateSelection({ domainPrivacyProtection: !resolved.selection.domainPrivacyProtection })}
                  className={cn(
                    "rounded-[18px] border px-4 py-3 text-left text-sm transition",
                    resolved.selection.domainPrivacyProtection
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:bg-slate-950/60"
                  )}
                >
                  <div className="font-semibold">Privacy protection</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em]">{resolved.selection.domainPrivacyProtection ? "Enabled" : "Disabled"}</div>
                </button>
              </div>
            ) : null}

            {domainsEnabled && domainResults.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {domainResults.map((result) => {
                  const active = resolved.domain.name === result.domain;
                  const selectable = result.status === "available";
                  return (
                    <button
                      key={result.domain}
                      type="button"
                      onClick={() => attachDomain(result)}
                      disabled={!selectable}
                      className={cn(
                        "rounded-2xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
                        active
                          ? "border-emerald-300 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/10"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950/40 dark:hover:bg-slate-950/60"
                      )}
                    >
                      <div className="text-sm font-semibold text-slate-950 dark:text-white">{result.domain}</div>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">${result.price.toFixed(2)} / year</div>
                      <div className={cn(
                        "mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]",
                        result.status === "available"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
                          : result.status === "taken"
                            ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200"
                      )}>
                        {result.status}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
