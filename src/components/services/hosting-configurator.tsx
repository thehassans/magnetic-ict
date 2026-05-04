"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Check, ShieldCheck } from "lucide-react";
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
};

export function HostingConfigurator({ settings, basePrice, value, onChange, defaultOpen = false, compact = false }: HostingConfiguratorProps) {
  const resolved = resolveHostingConfiguration(value ?? createDefaultHostingSelection(settings), settings);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const activeCount = useMemo(() => {
    return [resolved.operatingSystem, resolved.controlPanel, resolved.location, ...resolved.addons].filter(Boolean).length;
  }, [resolved.addons, resolved.controlPanel, resolved.location, resolved.operatingSystem]);

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
    <div className={cn("rounded-[1.9rem] border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55", compact ? "p-4 sm:p-5" : "p-5 sm:p-6")}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]",
          isOpen && "border-slate-300 bg-slate-50 dark:border-white/20 dark:bg-white/[0.05]"
        )}
        aria-expanded={isOpen}
      >
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Configure server</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activeCount} selections active</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-2 text-right dark:border-white/10 dark:bg-slate-950/50">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">Total</div>
            <div className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">${getHostingConfigurationTotal(basePrice, resolved).toFixed(2)}</div>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition duration-200 dark:text-slate-500", isOpen && "rotate-180")} />
        </div>
      </button>

      <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-950 dark:text-white">Operating system</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Choose one</div>
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
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-950 dark:text-white">Server panel</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Control access</div>
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
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-950 dark:text-white">Region</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Deployment</div>
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
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-950 dark:text-white">Extras</div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Optional</div>
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

            <div className="flex items-center justify-between rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                Changes update instantly
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="text-[11px] uppercase tracking-[0.18em] text-slate-400 transition hover:text-slate-700 dark:hover:text-white">
                Collapse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
