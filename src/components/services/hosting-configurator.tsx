"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Check, Globe2, Package, Server, ShieldCheck, Sparkles } from "lucide-react";
import { createDefaultHostingSelection, getHostingConfigurationTotal, resolveHostingConfiguration } from "@/lib/hosting-commerce";
import type { HostingConfigurationSelection, HostingProviderSettings } from "@/lib/hosting-types";
import { cn } from "@/lib/utils";

type HostingConfiguratorProps = {
  settings: HostingProviderSettings;
  basePrice: number;
  value?: HostingConfigurationSelection;
  onChange: (selection: HostingConfigurationSelection, summaryLines: string[], totalPrice: number) => void;
  defaultOpen?: boolean;
  compact?: boolean;
  tone?: "light" | "inverse";
};

export function HostingConfigurator({ settings, basePrice, value, onChange, defaultOpen = false, compact = false, tone = "light" }: HostingConfiguratorProps) {
  const resolved = resolveHostingConfiguration(value ?? createDefaultHostingSelection(settings), settings);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const activeCount = useMemo(() => {
    return [resolved.operatingSystem, resolved.controlPanel, resolved.location, ...resolved.addons].filter(Boolean).length;
  }, [resolved.addons, resolved.controlPanel, resolved.location, resolved.operatingSystem]);

  const totalPrice = getHostingConfigurationTotal(basePrice, resolved);

  const selectedHighlights = [
    resolved.operatingSystem ? { icon: Server, label: "OS", value: resolved.operatingSystem.name } : null,
    resolved.controlPanel ? { icon: Sparkles, label: "Panel", value: resolved.controlPanel.name } : null,
    resolved.location ? { icon: Globe2, label: "Region", value: resolved.location.name } : null,
    { icon: Package, label: "Extras", value: resolved.addons.length ? `${resolved.addons.length} add-on${resolved.addons.length === 1 ? "" : "s"}` : "No extras" }
  ].filter((item): item is { icon: typeof Server; label: string; value: string } => Boolean(item));

  const isInverse = tone === "inverse";

  function updateSelection(next: Partial<HostingConfigurationSelection>) {
    const nextSelection: HostingConfigurationSelection = {
      ...resolved.selection,
      ...next,
      domainMode: "none",
      domainName: "",
      domainYears: 1,
      domainPrivacyProtection: true,
      domainUnitPrice: 0
    };
    const nextResolved = resolveHostingConfiguration(nextSelection, settings);
    onChange(nextResolved.selection, nextResolved.summaryLines, getHostingConfigurationTotal(basePrice, nextResolved));
  }

  const operatingSystems = settings.operatingSystems.filter((operatingSystem) => operatingSystem.enabled);
  const controlPanels = settings.controlPanels.filter((panel) => panel.enabled);
  const locations = settings.locations.filter((location) => location.enabled);
  const addons = settings.addons.filter((addon) => addon.enabled);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border backdrop-blur-2xl transition duration-300",
        isInverse
          ? "border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.48),rgba(2,6,23,0.78))] shadow-[0_28px_90px_rgba(2,6,23,0.45)]"
          : "border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_24px_70px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.55),rgba(2,6,23,0.78))] dark:shadow-[0_28px_90px_rgba(2,6,23,0.42)]",
        compact ? "p-3.5 sm:p-4" : "p-5 sm:p-6"
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0", isInverse ? "bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_28%)]" : "bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_28%)]")} />
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "group relative w-full overflow-hidden rounded-[1.6rem] border px-4 py-4 text-left transition duration-300 sm:px-[1.125rem]",
          isInverse
            ? "border-white/10 bg-white/[0.05] shadow-[0_18px_50px_rgba(2,6,23,0.28)] hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]"
            : "border-white/90 bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/15 dark:hover:bg-white/[0.06]",
          isOpen && (isInverse
            ? "border-cyan-300/25 bg-white/[0.08] shadow-[0_22px_60px_rgba(8,47,73,0.32)]"
            : "border-slate-300 bg-slate-50 shadow-[0_22px_55px_rgba(15,23,42,0.08)] dark:border-white/20 dark:bg-white/[0.06]")
        )}
        aria-expanded={isOpen}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]", isInverse ? "bg-white/[0.08] text-white/80" : "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300")}> 
                <Sparkles className="h-3.5 w-3.5" />
                Configure server
              </div>
              <div className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]", isInverse ? "border-white/10 text-white/65" : "border-slate-200 text-slate-400 dark:border-white/10 dark:text-slate-400")}>
                {activeCount} active
              </div>
            </div>
            <div className={cn("mt-3 text-sm leading-6", isInverse ? "text-white/72" : "text-slate-600 dark:text-slate-300")}>
              Curate your stack with the right OS image, panel access, deployment region, and optional delivery extras.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className={cn(
                      "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                      isInverse
                        ? "border-white/10 bg-white/[0.06] text-white/80"
                        : "border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    <span className="truncate opacity-80">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <div
              className={cn(
                "min-w-[7.75rem] rounded-[1.2rem] border px-3.5 py-3 text-right",
                isInverse
                  ? "border-white/10 bg-white/[0.08] text-white"
                  : "border-slate-200 bg-slate-50/90 text-slate-950 dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
              )}
            >
              <div className={cn("text-[10px] uppercase tracking-[0.24em]", isInverse ? "text-white/55" : "text-slate-400 dark:text-slate-500")}>Total monthly</div>
              <div className="mt-1 text-[1.05rem] font-semibold tracking-tight">${totalPrice.toFixed(2)}</div>
            </div>
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border transition duration-300",
                isInverse
                  ? "border-white/10 bg-white/[0.08] text-white"
                  : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
              )}
            >
              <ChevronDown className={cn("h-4 w-4 transition duration-300", isOpen && "rotate-180")} />
            </div>
          </div>
        </div>
      </button>

      <div className={cn("overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", isOpen ? "mt-5 max-h-[2400px] opacity-100" : "max-h-0 opacity-0")}>
        <div className={cn("transform-gpu transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", isOpen ? "translate-y-0 scale-100" : "-translate-y-2 scale-[0.985]")}>
          <div className={cn("space-y-4 rounded-[1.7rem] border p-3 sm:p-4", isInverse ? "border-white/10 bg-black/10" : "border-slate-200/80 bg-white/75 dark:border-white/10 dark:bg-slate-950/35")}>
            <section className={cn("rounded-[1.45rem] border p-4 sm:p-5", isInverse ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.03]")}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">Operating system</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Start with the image your stack is built for.</div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Choose one</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {operatingSystems.map((operatingSystem) => {
                  const active = resolved.selection.operatingSystemId === operatingSystem.id;
                  return (
                    <button
                      key={operatingSystem.id}
                      type="button"
                      onClick={() => updateSelection({ operatingSystemId: operatingSystem.id })}
                      className={cn(
                        "rounded-[1.35rem] border px-4 py-4 text-left transition duration-300",
                        active
                          ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950"
                          : "border-slate-200 bg-white/90 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{operatingSystem.name}</div>
                          <div className={cn("mt-1 text-[11px] uppercase tracking-[0.2em]", active ? "text-white/60 dark:text-slate-950/65" : "text-slate-400 dark:text-slate-500")}>{operatingSystem.imageAlias}</div>
                        </div>
                        {active ? <Check className="h-4 w-4" /> : null}
                      </div>
                      <div className={cn("mt-3 text-xs leading-6", active ? "text-white/78 dark:text-slate-950/75" : "text-slate-500 dark:text-slate-400")}>{operatingSystem.description}</div>
                      {operatingSystem.recommended ? (
                        <div className={cn("mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]", active ? "border-white/15 text-white/70 dark:border-slate-950/10 dark:text-slate-950/70" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300")}>
                          Recommended
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={cn("rounded-[1.45rem] border p-4 sm:p-5", isInverse ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.03]")}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">Server panel</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose the management layer your team needs.</div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Control access</div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {controlPanels.map((panel) => {
                  const active = resolved.selection.controlPanelId === panel.id;
                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => updateSelection({ controlPanelId: panel.id })}
                      className={cn(
                        "rounded-[1.35rem] border px-4 py-4 text-left transition duration-300",
                        active
                          ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950"
                          : "border-slate-200 bg-white/90 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{panel.name}</div>
                          <div className={cn("mt-1 text-[11px] uppercase tracking-[0.2em]", active ? "text-white/60 dark:text-slate-950/65" : "text-slate-400 dark:text-slate-500")}>{panel.monthlyPrice > 0 ? `+$${panel.monthlyPrice}/mo` : "Included"}</div>
                        </div>
                        {active ? <Check className="h-4 w-4" /> : null}
                      </div>
                      <div className={cn("mt-3 text-xs leading-6", active ? "text-white/78 dark:text-slate-950/75" : "text-slate-500 dark:text-slate-400")}>{panel.description}</div>
                      {panel.recommended ? (
                        <div className={cn("mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]", active ? "border-white/15 text-white/70 dark:border-slate-950/10 dark:text-slate-950/70" : "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300")}>
                          Recommended
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={cn("rounded-[1.45rem] border p-4 sm:p-5", isInverse ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.03]")}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">Region</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Place your infrastructure where latency and operations fit best.</div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Deployment</div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {locations.map((location) => {
                  const active = resolved.selection.locationId === location.id;
                  return (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => updateSelection({ locationId: location.id })}
                      className={cn(
                        "rounded-[1.35rem] border px-4 py-4 text-left transition duration-300",
                        active
                          ? "border-cyan-200 bg-cyan-50 shadow-[0_18px_40px_rgba(8,145,178,0.12)] dark:border-cyan-400/30 dark:bg-cyan-400/10"
                          : "border-slate-200 bg-white/90 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-950 dark:text-white">{location.name}</div>
                          <div className={cn("mt-1 text-[11px] uppercase tracking-[0.2em]", active ? "text-cyan-700 dark:text-cyan-300" : "text-slate-400 dark:text-slate-500")}>{location.value}</div>
                        </div>
                        {active ? <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-300" /> : null}
                      </div>
                      <div className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">{location.description}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={cn("rounded-[1.45rem] border p-4 sm:p-5", isInverse ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.03]")}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">Extras</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Layer in the premium options you want bundled from day one.</div>
                </div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Optional</div>
              </div>
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
                        "rounded-[1.35rem] border px-4 py-4 text-left transition duration-300",
                        active
                          ? "border-violet-200 bg-violet-50 shadow-[0_18px_40px_rgba(139,92,246,0.12)] dark:border-violet-400/30 dark:bg-violet-400/10"
                          : "border-slate-200 bg-white/90 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-950 dark:text-white">{addon.name}</div>
                          <div className={cn("mt-1 text-[11px] uppercase tracking-[0.2em]", active ? "text-violet-700 dark:text-violet-300" : "text-slate-400 dark:text-slate-500")}>+${addon.monthlyPrice}/mo</div>
                        </div>
                        {active ? <Check className="h-4 w-4 text-violet-600 dark:text-violet-300" /> : null}
                      </div>
                      <div className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">{addon.description}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className={cn("flex items-center justify-between rounded-[1.35rem] border px-4 py-3 text-xs", isInverse ? "border-white/10 bg-white/[0.04] text-white/70" : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400")}>
              <div className="inline-flex items-center gap-2.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                Changes update instantly in your plan total
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className={cn("text-[11px] uppercase tracking-[0.18em] transition", isInverse ? "text-white/55 hover:text-white" : "text-slate-400 hover:text-slate-700 dark:hover:text-white")}>
                Collapse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
