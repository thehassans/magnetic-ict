"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Globe2, Package, Server, ShieldCheck, Sparkles, Zap, Plus, Minus } from "lucide-react";
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

  const operatingSystems = settings.operatingSystems.filter((os) => os.enabled);
  const controlPanels = settings.controlPanels.filter((p) => p.enabled);
  const locations = settings.locations.filter((l) => l.enabled);
  const addons = settings.addons.filter((a) => a.enabled);

  /* ── styling tokens ── */
  const card = isInverse
    ? "border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] shadow-[0_32px_80px_rgba(2,6,23,0.5)]"
    : "border-slate-200/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] dark:shadow-[0_32px_80px_rgba(2,6,23,0.5)]";

  const sectionBg = isInverse
    ? "border-white/[0.06] bg-white/[0.04]"
    : "border-slate-200/60 bg-slate-50/60 dark:border-white/[0.06] dark:bg-white/[0.03]";

  const activeCard = isInverse
    ? "border-cyan-400/60 bg-gradient-to-br from-cyan-400/10 to-indigo-400/10 shadow-[0_8px_32px_rgba(34,211,238,0.15)]"
    : "border-indigo-300 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-[0_8px_32px_rgba(99,102,241,0.12)] dark:border-cyan-400/60 dark:from-cyan-400/10 dark:to-indigo-400/10 dark:shadow-[0_8px_32px_rgba(34,211,238,0.15)]";

  const idleCard = isInverse
    ? "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.16] hover:bg-white/[0.07]"
    : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:border-white/[0.16] dark:hover:bg-white/[0.07]";

  const addonActive = isInverse
    ? "border-violet-400/50 bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 shadow-[0_8px_32px_rgba(139,92,246,0.15)]"
    : "border-violet-300 bg-gradient-to-br from-violet-50 to-fuchsia-50 shadow-[0_8px_32px_rgba(139,92,246,0.1)] dark:border-violet-400/50 dark:from-violet-400/10 dark:to-fuchsia-400/10";

  const locationActive = isInverse
    ? "border-emerald-400/50 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 shadow-[0_8px_32px_rgba(16,185,129,0.12)]"
    : "border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-[0_8px_32px_rgba(16,185,129,0.1)] dark:border-emerald-400/50 dark:from-emerald-400/10 dark:to-teal-400/10";

  const textPrimary = isInverse ? "text-white" : "text-slate-950 dark:text-white";
  const textSecondary = isInverse ? "text-white/65" : "text-slate-500 dark:text-slate-400";
  const textMuted = isInverse ? "text-white/40" : "text-slate-400 dark:text-slate-500";
  const pillBg = isInverse ? "bg-white/[0.08] border-white/[0.12] text-white/80" : "bg-slate-100 border-slate-200/60 text-slate-600 dark:bg-white/[0.08] dark:border-white/[0.12] dark:text-slate-300";
  const activePillText = isInverse ? "text-cyan-300" : "text-indigo-600 dark:text-cyan-300";

  return (
    <div className={cn("relative overflow-hidden rounded-[2.25rem] border backdrop-blur-2xl", card, compact ? "p-4 sm:p-5" : "p-5 sm:p-7")}>
      {/* ambient glow */}
      <div className={cn("pointer-events-none absolute inset-0 rounded-[2.25rem]", isInverse
        ? "bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent_40%)]"
        : "bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.07),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.06),transparent_40%)]"
      )} />

      {/* ── HEADER BUTTON ── */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "group relative w-full overflow-hidden rounded-[1.75rem] border px-5 py-5 text-left transition-all duration-300",
          isOpen
            ? (isInverse
              ? "border-cyan-400/30 bg-white/[0.08] shadow-[0_20px_60px_rgba(8,47,73,0.3)]"
              : "border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 shadow-[0_16px_48px_rgba(99,102,241,0.1)] dark:border-cyan-400/30 dark:bg-white/[0.07] dark:shadow-[0_20px_60px_rgba(8,47,73,0.3)]")
            : (isInverse
              ? "border-white/[0.1] bg-white/[0.05] hover:border-white/[0.18] hover:bg-white/[0.09]"
              : "border-slate-200/80 bg-white/95 hover:border-indigo-200 hover:shadow-lg dark:border-white/[0.1] dark:bg-white/[0.05] dark:hover:border-white/[0.18] dark:hover:bg-white/[0.09]"),
          "shadow-[0_8px_32px_rgba(15,23,42,0.06)]"
        )}
        aria-expanded={isOpen}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            {/* eyebrow row */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em]", pillBg)}>
                <Sparkles className="h-3.5 w-3.5" />
                Configure Server
              </div>
              <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]",
                activeCount > 0
                  ? (isInverse ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300")
                  : (isInverse ? "border-white/[0.08] text-white/50" : "border-slate-200 text-slate-400 dark:border-white/[0.08] dark:text-white/50")
              )}>
                <span className={cn("h-1.5 w-1.5 rounded-full", activeCount > 0 ? (isInverse ? "bg-cyan-400" : "bg-indigo-500 dark:bg-cyan-400") : "bg-slate-300 dark:bg-white/20")} />
                {activeCount} active
              </div>
            </div>

            {/* headline */}
            <div className={cn("mt-3.5 text-[15px] font-medium leading-6", textSecondary)}>
              Curate your stack with the right OS image, panel access, deployment region, and optional delivery extras.
            </div>

            {/* highlight pills */}
            <div className="mt-3.5 flex flex-wrap gap-2">
              {selectedHighlights.map((item) => (
                <div key={item.label} className={cn(
                  "inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs",
                  pillBg
                )}>
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className={cn("font-semibold", activePillText)}>{item.label}</span>
                  <span className={cn("truncate", textSecondary)}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price + toggle */}
          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <div className={cn("min-w-[8.5rem] rounded-2xl border px-4 py-3.5 text-right",
              isInverse
                ? "border-white/[0.1] bg-white/[0.07]"
                : "border-slate-200/80 bg-gradient-to-br from-slate-50 to-white shadow-sm dark:border-white/[0.1] dark:bg-white/[0.07]"
            )}>
              <div className={cn("text-[10px] font-semibold uppercase tracking-[0.28em]", textMuted)}>Total monthly</div>
              <div className={cn("mt-1.5 text-xl font-bold tracking-tight", textPrimary)}>${totalPrice.toFixed(2)}</div>
            </div>
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300",
              isOpen
                ? (isInverse ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300" : "border-indigo-200 bg-indigo-100 text-indigo-600 dark:border-cyan-400/40 dark:bg-cyan-400/15 dark:text-cyan-300")
                : (isInverse ? "border-white/[0.12] bg-white/[0.07] text-white/70" : "border-slate-200 bg-white text-slate-500 dark:border-white/[0.12] dark:bg-white/[0.07] dark:text-white/70")
            )}>
              <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", isOpen && "rotate-180")} />
            </div>
          </div>
        </div>
      </button>

      {/* ── EXPANDED CONTENT ── */}
      <div className={cn("overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", isOpen ? "mt-5 max-h-[3000px] opacity-100" : "max-h-0 opacity-0")}>
        <div className={cn("transform-gpu transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", isOpen ? "translate-y-0 scale-100" : "-translate-y-3 scale-[0.97]")}>
          <div className={cn("space-y-4 rounded-[1.9rem] border p-4 sm:p-5", sectionBg)}>

            {/* ── OS ── */}
            <ConfigSection title="Operating system" subtitle="Start with the image your stack is built for." badge="Choose one" icon={Server} isInverse={isInverse}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {operatingSystems.map((os) => {
                  const active = resolved.selection.operatingSystemId === os.id;
                  return (
                    <button key={os.id} type="button" onClick={() => updateSelection({ operatingSystemId: os.id })}
                      className={cn("group rounded-[1.5rem] border p-5 text-left transition-all duration-200", active ? activeCard : idleCard)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className={cn("text-sm font-bold", textPrimary)}>{os.name}</div>
                          <div className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]", active ? activePillText : textMuted)}>{os.imageAlias}</div>
                        </div>
                        {active && (
                          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", isInverse ? "bg-cyan-400 text-slate-950" : "bg-indigo-600 text-white dark:bg-cyan-400 dark:text-slate-950")}>
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className={cn("mt-3 text-xs leading-6", active ? textSecondary : textMuted)}>{os.description}</div>
                      {os.recommended && (
                        <div className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em]",
                          active
                            ? (isInverse ? "border-cyan-400/30 text-cyan-300" : "border-indigo-300/50 text-indigo-500 dark:border-cyan-400/30 dark:text-cyan-300")
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                        )}>
                          <Zap className="h-3 w-3" /> Recommended
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ConfigSection>

            {/* ── PANEL ── */}
            <ConfigSection title="Server panel" subtitle="Choose the management layer your team needs." badge="Control access" icon={Sparkles} isInverse={isInverse}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {controlPanels.map((panel) => {
                  const active = resolved.selection.controlPanelId === panel.id;
                  return (
                    <button key={panel.id} type="button" onClick={() => updateSelection({ controlPanelId: panel.id })}
                      className={cn("group rounded-[1.5rem] border p-5 text-left transition-all duration-200", active ? activeCard : idleCard)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className={cn("text-sm font-bold", textPrimary)}>{panel.name}</div>
                          <div className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]", active ? activePillText : textMuted)}>
                            {panel.monthlyPrice > 0 ? `+$${panel.monthlyPrice}/mo` : "Included"}
                          </div>
                        </div>
                        {active && (
                          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", isInverse ? "bg-cyan-400 text-slate-950" : "bg-indigo-600 text-white dark:bg-cyan-400 dark:text-slate-950")}>
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className={cn("mt-3 text-xs leading-6", active ? textSecondary : textMuted)}>{panel.description}</div>
                      {panel.recommended && (
                        <div className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em]",
                          active
                            ? (isInverse ? "border-cyan-400/30 text-cyan-300" : "border-indigo-300/50 text-indigo-500 dark:border-cyan-400/30 dark:text-cyan-300")
                            : "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300"
                        )}>
                          <Zap className="h-3 w-3" /> Recommended
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ConfigSection>

            {/* ── REGION ── */}
            <ConfigSection title="Region" subtitle="Place your infrastructure where latency and operations fit best." badge="Deployment" icon={Globe2} isInverse={isInverse}>
              <div className="grid gap-3 md:grid-cols-3">
                {locations.map((location) => {
                  const active = resolved.selection.locationId === location.id;
                  return (
                    <button key={location.id} type="button" onClick={() => updateSelection({ locationId: location.id })}
                      className={cn("group rounded-[1.5rem] border p-5 text-left transition-all duration-200", active ? locationActive : idleCard)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className={cn("text-sm font-bold", textPrimary)}>{location.name}</div>
                          <div className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]", active ? "text-emerald-600 dark:text-emerald-300" : textMuted)}>{location.value}</div>
                        </div>
                        {active && (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-950">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className={cn("mt-3 text-xs leading-6", active ? textSecondary : textMuted)}>{location.description}</div>
                    </button>
                  );
                })}
              </div>
            </ConfigSection>

            {/* ── EXTRAS ── */}
            {addons.length > 0 && (
              <ConfigSection title="Extras" subtitle="Layer in premium options bundled from day one." badge="Optional" icon={Package} isInverse={isInverse}>
                <div className="grid gap-3 md:grid-cols-3">
                  {addons.map((addon) => {
                    const active = resolved.selection.addonIds.includes(addon.id);
                    return (
                      <button key={addon.id} type="button"
                        onClick={() => updateSelection({
                          addonIds: active
                            ? resolved.selection.addonIds.filter((id) => id !== addon.id)
                            : [...resolved.selection.addonIds, addon.id]
                        })}
                        className={cn("group rounded-[1.5rem] border p-5 text-left transition-all duration-200", active ? addonActive : idleCard)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className={cn("text-sm font-bold", textPrimary)}>{addon.name}</div>
                            <div className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.2em]", active ? "text-violet-600 dark:text-violet-300" : textMuted)}>+${addon.monthlyPrice}/mo</div>
                          </div>
                          <span className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                            active
                              ? "border-violet-500 bg-violet-500 text-white dark:border-violet-400 dark:bg-violet-400 dark:text-slate-950"
                              : (isInverse ? "border-white/20 bg-transparent" : "border-slate-300 bg-transparent dark:border-white/20")
                          )}>
                            {active ? <Minus className="h-3 w-3" strokeWidth={3} /> : <Plus className="h-3 w-3" strokeWidth={3} />}
                          </span>
                        </div>
                        <div className={cn("mt-3 text-xs leading-6", active ? textSecondary : textMuted)}>{addon.description}</div>
                      </button>
                    );
                  })}
                </div>
              </ConfigSection>
            )}

            {/* footer bar */}
            <div className={cn(
              "flex items-center justify-between rounded-[1.5rem] border px-5 py-4",
              isInverse ? "border-white/[0.08] bg-white/[0.04]" : "border-slate-200/80 bg-white/80 dark:border-white/[0.08] dark:bg-white/[0.04]"
            )}>
              <div className={cn("inline-flex items-center gap-2.5 text-xs font-medium", textSecondary)}>
                <ShieldCheck className={cn("h-4 w-4", isInverse ? "text-cyan-400/70" : "text-indigo-400/70 dark:text-cyan-400/70")} />
                Changes update instantly in your plan total
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.2em] transition",
                isInverse ? "text-white/40 hover:text-white/80" : "text-slate-400 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/80"
              )}>
                Collapse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section shell ── */
function ConfigSection({
  title, subtitle, badge, icon: Icon, isInverse, children
}: {
  title: string; subtitle: string; badge: string; icon: typeof Server; isInverse: boolean; children: React.ReactNode;
}) {
  const textPrimary = isInverse ? "text-white" : "text-slate-950 dark:text-white";
  const textSecondary = isInverse ? "text-white/55" : "text-slate-500 dark:text-slate-400";
  const textMuted = isInverse ? "text-white/35" : "text-slate-400 dark:text-slate-500";
  const iconColor = isInverse ? "text-cyan-400/60" : "text-indigo-400/60 dark:text-cyan-400/60";
  const sectionCard = isInverse ? "border-white/[0.06] bg-black/[0.12]" : "border-slate-200/60 bg-white/70 dark:border-white/[0.06] dark:bg-black/[0.12]";

  return (
    <section className={cn("rounded-[1.6rem] border p-5 sm:p-6", sectionCard)}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon className={cn("h-4 w-4", iconColor)} />
          <div>
            <div className={cn("text-sm font-bold", textPrimary)}>{title}</div>
            <div className={cn("mt-0.5 text-[12px]", textSecondary)}>{subtitle}</div>
          </div>
        </div>
        <div className={cn("shrink-0 text-[10px] font-bold uppercase tracking-[0.28em]", textMuted)}>{badge}</div>
      </div>
      {children}
    </section>
  );
}
