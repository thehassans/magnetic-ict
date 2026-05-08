"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Clock3, Cpu, Globe2, HardDrive, Lock, Server, Shield, ShieldCheck, Sparkles, Zap, Database, Network } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { HostingConfigurationSummary } from "@/components/commerce/hosting-configuration-summary";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { HostingConfigurator } from "@/components/services/hosting-configurator";
import { createDefaultHostingSelection, getHostingConfigurationTotal, resolveHostingConfiguration } from "@/lib/hosting-commerce";
import { getHostingPlanForTier } from "@/lib/hosting-plans";
import type { HostingProviderSettings } from "@/lib/hosting-types";
import type { CatalogService } from "@/lib/service-catalog";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/home/scroll-reveal";

const featureCards = [
  { icon: Server, title: "Managed cloud infra", desc: "Provision Magnetic-branded VPS capacity with a clean operator-first workflow.", accent: "from-indigo-500 to-violet-500" },
  { icon: Shield, title: "Control panel ready", desc: "Panel-enabled delivery flows with cPanel, Plesk, or DirectAdmin from day one.", accent: "from-cyan-500 to-sky-500" },
  { icon: Clock3, title: "Operational visibility", desc: "Track provisioning, customer access readiness, and admin fulfillment in one place.", accent: "from-emerald-500 to-teal-500" },
  { icon: Globe2, title: "Regional deployment", desc: "Choose from enabled infrastructure regions configured in your hosting provider settings.", accent: "from-amber-500 to-orange-500" },
  { icon: Cpu, title: "Flexible OS images", desc: "Launch with Ubuntu, Debian, AlmaLinux, Rocky Linux, or Windows Server templates.", accent: "from-violet-500 to-fuchsia-500" },
  { icon: HardDrive, title: "Add-ons & provisioning", desc: "Bundle managed backups, monitoring, and DDoS protection into one premium checkout.", accent: "from-rose-500 to-pink-500" },
] as const;

const trustBadges = [
  { icon: ShieldCheck, label: "DDoS protection", sub: "Always-on" },
  { icon: Zap, label: "< 60s deploy", sub: "Instant provisioning" },
  { icon: Lock, label: "99.9% SLA", sub: "Guaranteed uptime" },
  { icon: Globe2, label: "4 regions", sub: "Global infrastructure" },
] as const;

type Props = { service: CatalogService; hostingProviderConfig: HostingProviderSettings };

export function HostingServicePage({ service, hostingProviderConfig }: Props) {
  const { addItem, openCart } = useCommerce();
  const router = useRouter();
  const [hostingSelection, setHostingSelection] = useState(createDefaultHostingSelection(hostingProviderConfig));

  const enabledOS = hostingProviderConfig.operatingSystems.filter((x) => x.enabled);
  const enabledPanels = hostingProviderConfig.controlPanels.filter((x) => x.enabled);
  const enabledLocations = hostingProviderConfig.locations.filter((x) => x.enabled);
  const enabledAddons = hostingProviderConfig.addons.filter((x) => x.enabled);

  const plans = useMemo(() => service.tiers.map((tier) => {
    const tp = getHostingPlanForTier(tier.id);
    return {
      ...tier,
      cpu: tp ? `${tp.cores} vCPU` : tier.features[0] ?? "Included",
      ram: tp ? `${Math.round(tp.ramMb / 1024)} GB RAM` : tier.features[1] ?? "Included",
      storage: tp ? `${tp.storageGb} GB SSD` : tier.features[2] ?? "Included",
      bandwidth: tier.features[3] ?? "Unmetered",
      popular: tier.name === "Professional",
    };
  }), [service.tiers]);

  const [selectedTierId, setSelectedTierId] = useState(plans.find(p => p.popular)?.id ?? plans[0]?.id);
  const selectedPlan = plans.find(p => p.id === selectedTierId)!;

  const resolved = useMemo(
    () => resolveHostingConfiguration(hostingSelection, hostingProviderConfig),
    [hostingSelection, hostingProviderConfig]
  );

  const finalPrice = getHostingConfigurationTotal(selectedPlan.price, resolved);

  function handleAdd() {
    addItem({ serviceId: service.id, tierId: selectedPlan.id, price: finalPrice, hostingConfiguration: resolved.selection, hostingSummary: resolved.summaryLines });
    router.push("/cart");
  }

  return (
    <main className="bg-white dark:bg-[#06080f]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-slate-200/40 py-24 dark:border-white/[0.06] sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[15%] -top-[30%] h-[90vh] w-[90vh] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(99,102,241,0.2),transparent_60%)]" />
          <div className="absolute -right-[10%] top-[5%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-indigo-700 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" /> {service.eyebrow}
              </div>
              <h1 className="mt-7 text-5xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl lg:leading-[1.05]">
                Lightning-fast{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-300">
                  VPS hosting
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500 dark:text-slate-400">
                {service.description}
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {[
                  { v: `${enabledLocations.length || 1}`, l: "Regions" },
                  { v: `${enabledOS.length || 1}+`, l: "OS images" },
                  { v: `${enabledPanels.length || 1}`, l: "Panels" },
                  { v: `${enabledAddons.length || 0}+`, l: "Add-ons" },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-slate-200/70 bg-white/80 px-6 py-4 text-center shadow-sm backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03]">
                    <div className="text-2xl font-bold text-slate-950 dark:text-white">{s.v}</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">{s.l}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {trustBadges.map((b) => (
                  <div key={b.label} className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03]">
                    <b.icon className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{b.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{b.sub}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <button onClick={() => document.getElementById("build-server")?.scrollIntoView({ behavior: "smooth" })}
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:shadow-indigo-500/30">
                  Deploy server <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── BUILD SERVER ── */}
      <section id="build-server" className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
                <Cpu className="h-3.5 w-3.5" /> Provisioning Flow
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Build your server.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
                Select your base capacity tier, then personalize the software stack and infrastructure add-ons.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-12 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] items-start">
            
            {/* Left Col - Steps */}
            <div className="space-y-12">
              
              {/* Step 1 */}
              <ScrollReveal delay={0.05}>
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 dark:bg-indigo-500 dark:shadow-indigo-500/20">1</div>
                    <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Choose base capacity</h3>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    {plans.map((plan) => {
                      const active = selectedTierId === plan.id;
                      return (
                        <button key={plan.id} onClick={() => setSelectedTierId(plan.id)}
                          className={cn("relative overflow-hidden rounded-3xl border p-6 text-left transition-all duration-300",
                            active 
                              ? "border-indigo-400/50 bg-gradient-to-br from-indigo-50 to-white shadow-[0_8px_32px_rgba(99,102,241,0.12)] ring-1 ring-indigo-400/20 dark:border-indigo-400/40 dark:from-indigo-400/10 dark:to-transparent dark:shadow-[0_8px_32px_rgba(99,102,241,0.15)] dark:ring-indigo-400/10"
                              : "border-slate-200/60 bg-white shadow-sm hover:border-slate-300 hover:shadow-md dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.15] dark:hover:bg-white/[0.05]"
                          )}>
                          {plan.popular && (
                            <div className="absolute right-0 top-0 rounded-bl-2xl rounded-tr-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-md">
                              Popular
                            </div>
                          )}
                          <div className="flex items-start justify-between">
                            <div>
                              <div className={cn("text-lg font-bold", active ? "text-indigo-950 dark:text-white" : "text-slate-900 dark:text-white")}>{plan.name}</div>
                              <div className="mt-1 flex items-baseline gap-1">
                                <span className={cn("text-2xl font-bold", active ? "text-indigo-600 dark:text-indigo-300" : "text-slate-900 dark:text-white")}>${plan.price.toFixed(2)}</span>
                                <span className={cn("text-xs font-medium", active ? "text-indigo-600/70 dark:text-indigo-300/70" : "text-slate-500 dark:text-slate-400")}>/mo</span>
                              </div>
                            </div>
                            <div className={cn("flex h-6 w-6 items-center justify-center rounded-full border transition-all", active ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-400 dark:text-slate-950" : "border-slate-300 text-transparent dark:border-white/20")}>
                              <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            </div>
                          </div>

                          <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-3">
                              <Cpu className={cn("h-4 w-4", active ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400")} />
                              <span className={cn("text-sm font-medium", active ? "text-slate-900 dark:text-slate-200" : "text-slate-600 dark:text-slate-300")}>{plan.cpu}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Database className={cn("h-4 w-4", active ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400")} />
                              <span className={cn("text-sm font-medium", active ? "text-slate-900 dark:text-slate-200" : "text-slate-600 dark:text-slate-300")}>{plan.ram}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <HardDrive className={cn("h-4 w-4", active ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400")} />
                              <span className={cn("text-sm font-medium", active ? "text-slate-900 dark:text-slate-200" : "text-slate-600 dark:text-slate-300")}>{plan.storage}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Network className={cn("h-4 w-4", active ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400")} />
                              <span className={cn("text-sm font-medium", active ? "text-slate-900 dark:text-slate-200" : "text-slate-600 dark:text-slate-300")}>{plan.bandwidth}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>

              {/* Step 2 */}
              <ScrollReveal delay={0.1}>
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 dark:bg-indigo-500 dark:shadow-indigo-500/20">2</div>
                    <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Configure stack</h3>
                  </div>
                  
                  <HostingConfigurator
                    settings={hostingProviderConfig}
                    basePrice={selectedPlan.price}
                    value={hostingSelection}
                    onChange={(sel) => setHostingSelection(sel)}
                    defaultOpen
                    tone="light"
                  />
                </div>
              </ScrollReveal>
            </div>

            {/* Right Col - Summary Sticky */}
            <ScrollReveal delay={0.15}>
              <div className="sticky top-8 space-y-6">
                <div className="rounded-[2rem] border border-slate-200/70 bg-white/60 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.6),rgba(2,6,23,0.8))] dark:shadow-[0_24px_80px_rgba(2,6,23,0.6)] sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Order Summary</div>
                      <div className="text-base font-bold text-slate-950 dark:text-white">Magnetic VPS • {selectedPlan.name}</div>
                    </div>
                  </div>

                  <div className="space-y-4 border-b border-slate-200/60 pb-6 dark:border-white/[0.08]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Base capacity ({selectedPlan.name})</span>
                      <span className="font-semibold text-slate-900 dark:text-white">${selectedPlan.price.toFixed(2)}</span>
                    </div>
                    
                    {resolved.summaryLines.map((line, i) => (
                      <div key={i} className="flex items-start gap-2 text-[13px] text-slate-500 dark:text-slate-400">
                        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6">
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total monthly</span>
                      <span className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white">${finalPrice.toFixed(2)}</span>
                    </div>
                    
                    <button onClick={handleAdd}
                      className="group mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base font-bold text-white shadow-[0_8px_30px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_12px_40px_rgba(99,102,241,0.4)] hover:brightness-110">
                      Deploy server <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Secure</span>
                      <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> 45-day refund</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-t border-slate-200/40 bg-gradient-to-b from-slate-50/80 to-white py-24 dark:border-white/[0.06] dark:from-white/[0.02] dark:to-transparent sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">Infrastructure features</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Everything you need to launch</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
              Magnetic VPS is built for operators who demand infrastructure that just works — from provisioning to panel to production.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.05}>
                <article className="group h-full rounded-3xl border border-slate-200/60 bg-white p-7 shadow-sm transition-all hover:border-transparent hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.05] dark:hover:shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.accent} text-white shadow-lg`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">{f.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{f.desc}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
