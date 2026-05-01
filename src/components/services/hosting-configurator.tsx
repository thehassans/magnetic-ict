"use client";

import { createDefaultHostingSelection, getHostingConfigurationTotal, resolveHostingConfiguration } from "@/lib/hosting-commerce";
import type { HostingConfigurationSelection, HostingProviderSettings } from "@/lib/hosting-types";
import { cn } from "@/lib/utils";

type HostingConfiguratorProps = {
  settings: HostingProviderSettings;
  basePrice: number;
  value?: HostingConfigurationSelection;
  onChange: (selection: HostingConfigurationSelection, summaryLines: string[], totalPrice: number) => void;
};

export function HostingConfigurator({ settings, basePrice, value, onChange }: HostingConfiguratorProps) {
  const resolved = resolveHostingConfiguration(value ?? createDefaultHostingSelection(settings), settings);

  function updateSelection(next: Partial<HostingConfigurationSelection>) {
    const nextSelection: HostingConfigurationSelection = {
      ...resolved.selection,
      ...next
    };
    const nextResolved = resolveHostingConfiguration(nextSelection, settings);
    onChange(nextResolved.selection, nextResolved.summaryLines, getHostingConfigurationTotal(basePrice, nextResolved));
  }

  const controlPanels = settings.controlPanels.filter((panel) => panel.enabled);
  const locations = settings.locations.filter((location) => location.enabled);
  const addons = settings.addons.filter((addon) => addon.enabled);

  return (
    <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">Hosting configuration</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Premium VPS setup</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
            Select your preferred control panel, region, and managed extras. Pricing is controlled from the admin panel and applied automatically.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right dark:border-white/10 dark:bg-white/[0.04]">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Configuration uplift</div>
          <div className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">+${resolved.extraMonthlyPrice.toFixed(2)}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Final price updates per selected tier below.</div>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <section>
          <div className="mb-3 text-sm font-medium text-slate-950 dark:text-white">Control panel</div>
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {controlPanels.map((panel) => {
                const active = resolved.selection.controlPanelId === panel.id;
                return (
                  <button
                    key={panel.id}
                    type="button"
                    onClick={() => updateSelection({ controlPanelId: panel.id })}
                    className={cn(
                      "min-w-[230px] rounded-2xl border p-4 text-left transition",
                      active
                        ? "border-slate-950 bg-slate-950 text-white dark:border-cyan-400 dark:bg-cyan-400 dark:text-slate-950"
                        : "border-slate-200 bg-slate-50 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">{panel.name}</div>
                      <div className={cn("text-xs", active ? "text-white/70 dark:text-slate-950/70" : "text-slate-500 dark:text-slate-400")}>+${panel.monthlyPrice}/mo</div>
                    </div>
                    <p className={cn("mt-2 text-xs leading-6", active ? "text-white/80 dark:text-slate-950/80" : "text-slate-500 dark:text-slate-400")}>{panel.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 text-sm font-medium text-slate-950 dark:text-white">Deployment region</div>
          <div className="grid gap-3 md:grid-cols-3">
            {locations.map((location) => {
              const active = resolved.selection.locationId === location.id;
              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => updateSelection({ locationId: location.id })}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-cyan-200 bg-cyan-50 dark:border-cyan-400/30 dark:bg-cyan-400/10"
                      : "border-slate-200 bg-slate-50 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  )}
                >
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">{location.name}</div>
                  <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{location.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 text-sm font-medium text-slate-950 dark:text-white">Managed extras</div>
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
                    "rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-violet-200 bg-violet-50 dark:border-violet-400/30 dark:bg-violet-400/10"
                      : "border-slate-200 bg-slate-50 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-950 dark:text-white">{addon.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">+${addon.monthlyPrice}/mo</div>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{addon.description}</p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
