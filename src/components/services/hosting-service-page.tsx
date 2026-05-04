"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Clock3, Cpu, Globe2, HardDrive, Server, Shield, Sparkles, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { HostingConfigurationSummary } from "@/components/commerce/hosting-configuration-summary";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { HostingConfigurator } from "@/components/services/hosting-configurator";
import { createDefaultHostingSelection, getHostingConfigurationTotal, resolveHostingConfiguration } from "@/lib/hosting-commerce";
import { getHostingPlanForTier } from "@/lib/hosting-plans";
import type { HostingProviderSettings } from "@/lib/hosting-types";
import type { CatalogService } from "@/lib/service-catalog";
import { cn } from "@/lib/utils";

const hostingFeatureCards = [
  {
    icon: Server,
    title: "IONOS-backed infrastructure",
    description: "Provision Magnetic-branded VPS capacity on top of your configured partner cloud workflow."
  },
  {
    icon: Shield,
    title: "Control panel ready",
    description: "Offer panel-enabled delivery flows with Plesk or other enabled control-panel options."
  },
  {
    icon: Clock3,
    title: "Operational visibility",
    description: "Track provisioning progress, customer access readiness, and admin-managed fulfillment in one place."
  },
  {
    icon: Globe2,
    title: "Regional deployment",
    description: "Choose from the enabled infrastructure regions configured in your hosting provider settings."
  },
  {
    icon: Cpu,
    title: "Flexible OS images",
    description: "Launch with the operating system templates already enabled in your infrastructure configuration."
  },
  {
    icon: HardDrive,
    title: "Add-ons & domain flow",
    description: "Bundle add-ons, optional domain registration, and privacy settings into the same purchase journey."
  }
] as const;

type HostingServicePageProps = {
  service: CatalogService;
  hostingProviderConfig: HostingProviderSettings;
};

export function HostingServicePage({ service, hostingProviderConfig }: HostingServicePageProps) {
  const { addItem, openCart } = useCommerce();
  const router = useRouter();
  const [hostingSelection, setHostingSelection] = useState(createDefaultHostingSelection(hostingProviderConfig));

  const resolvedHostingConfiguration = useMemo(
    () => resolveHostingConfiguration(hostingSelection, hostingProviderConfig),
    [hostingSelection, hostingProviderConfig]
  );

  const enabledOperatingSystems = hostingProviderConfig.operatingSystems.filter((item) => item.enabled);
  const enabledControlPanels = hostingProviderConfig.controlPanels.filter((item) => item.enabled);
  const enabledLocations = hostingProviderConfig.locations.filter((item) => item.enabled);
  const enabledAddons = hostingProviderConfig.addons.filter((item) => item.enabled);

  const plans = service.tiers.map((tier) => {
    const tierPlan = getHostingPlanForTier(tier.id);
    const totalPrice = getHostingConfigurationTotal(tier.price, resolvedHostingConfiguration);

    return {
      ...tier,
      totalPrice,
      cpu: tierPlan ? `${tierPlan.cores} vCPU` : tier.features[0] ?? "Included",
      ram: tierPlan ? `${Math.round(tierPlan.ramMb / 1024)} GB RAM` : tier.features[1] ?? "Included",
      storage: tierPlan ? `${tierPlan.storageGb} GB SSD` : tier.features[2] ?? "Included",
      popular: tier.name === "Professional"
    };
  });

  function handleAddToCart(tierId: string, price: number) {
    addItem({
      serviceId: service.id,
      tierId,
      price,
      hostingConfiguration: resolvedHostingConfiguration.selection,
      hostingSummary: resolvedHostingConfiguration.summaryLines
    });
    router.push("/cart");
  }

  return (
    <main className="bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_42%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-20 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_42%),linear-gradient(180deg,#020617_0%,#020617_100%)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.26em] text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5" />
              {service.eyebrow}
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
              Lightning-fast <span className="text-slate-500 dark:text-slate-300">web hosting</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              {service.description}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-8">
              {[
                { value: `${enabledLocations.length || 1}`, label: "Regions" },
                { value: `${enabledOperatingSystems.length || 1}+`, label: "OS images" },
                { value: `${enabledControlPanels.length || 1}`, label: "Panels" },
                { value: `${enabledAddons.length || 0}+`, label: "Add-ons" }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{stat.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HostingConfigurator
            settings={hostingProviderConfig}
            basePrice={service.tiers[0]?.price ?? 0}
            value={hostingSelection}
            onChange={(selection) => setHostingSelection(selection)}
          />
        </div>
      </section>

      <section id="hosting-plans" className="pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950">
            <div className="grid grid-cols-4 border-b border-slate-200 dark:border-white/10">
              <div className="bg-slate-50 p-6 dark:bg-white/[0.03]">
                <Server className="mb-3 h-6 w-6 text-slate-500 dark:text-slate-300" />
                <div className="text-lg font-semibold text-slate-950 dark:text-white">Compare plans</div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Exact reference-style hosting table with Magnetic provisioning options.</p>
              </div>
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative p-6 text-center",
                    plan.popular ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-white dark:bg-slate-950"
                  )}
                >
                  {plan.popular ? (
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-950 dark:bg-slate-950 dark:text-white">
                      Popular
                    </div>
                  ) : null}
                  <h3 className={cn("text-lg font-semibold", plan.popular ? "text-white dark:text-slate-950" : "text-slate-950 dark:text-white")}>{plan.name}</h3>
                  <div className="mt-3 flex items-baseline justify-center gap-1">
                    <span className={cn("text-3xl font-semibold tracking-tight", plan.popular ? "text-white dark:text-slate-950" : "text-slate-950 dark:text-white")}>${plan.totalPrice.toFixed(2)}</span>
                    <span className={cn("text-sm", plan.popular ? "text-white/70 dark:text-slate-700" : "text-slate-500 dark:text-slate-400")}>/mo</span>
                  </div>
                  <p className={cn("mt-3 text-sm leading-6", plan.popular ? "text-white/75 dark:text-slate-700" : "text-slate-500 dark:text-slate-400")}>{plan.summary}</p>
                </div>
              ))}
            </div>

            {[
              { key: "cpu", label: "Compute", getValue: (plan: (typeof plans)[number]) => plan.cpu },
              { key: "ram", label: "Memory", getValue: (plan: (typeof plans)[number]) => plan.ram },
              { key: "storage", label: "Storage", getValue: (plan: (typeof plans)[number]) => plan.storage },
              { key: "os", label: "Operating systems", getValue: () => `${enabledOperatingSystems.length || 1} options` },
              { key: "panel", label: "Server panel", getValue: () => enabledControlPanels[0]?.name ?? "None" },
              { key: "region", label: "Deployment region", getValue: () => enabledLocations[0]?.name ?? "Configured" }
            ].map((row, rowIndex) => (
              <div
                key={row.key}
                className={cn(
                  "grid grid-cols-4 border-b border-slate-100 dark:border-white/10",
                  rowIndex % 2 === 0 ? "bg-slate-50/70 dark:bg-white/[0.02]" : "bg-white dark:bg-slate-950"
                )}
              >
                <div className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">{row.label}</div>
                {plans.map((plan) => (
                  <div
                    key={`${plan.id}-${row.key}`}
                    className={cn(
                      "flex items-center justify-center p-4 text-center text-sm",
                      plan.popular ? "bg-slate-950/[0.03] dark:bg-white/[0.04]" : "",
                      "text-slate-950 dark:text-white"
                    )}
                  >
                    {row.getValue(plan)}
                  </div>
                ))}
              </div>
            ))}

            {[
              { key: "domain", label: "Domain registration", enabled: true },
              { key: "privacy", label: "Privacy protection", enabled: true },
              { key: "addons", label: "Optional add-ons", enabled: enabledAddons.length > 0 },
              { key: "tracking", label: "Provision tracking", enabled: true }
            ].map((row, rowIndex) => (
              <div
                key={row.key}
                className={cn(
                  "grid grid-cols-4 border-b border-slate-100 dark:border-white/10",
                  rowIndex % 2 === 0 ? "bg-slate-50/70 dark:bg-white/[0.02]" : "bg-white dark:bg-slate-950"
                )}
              >
                <div className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">{row.label}</div>
                {plans.map((plan) => (
                  <div key={`${plan.id}-${row.key}`} className={cn("flex items-center justify-center p-4", plan.popular ? "bg-slate-950/[0.03] dark:bg-white/[0.04]" : "")}>
                    {row.enabled ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-slate-300 dark:text-slate-600" />}
                  </div>
                ))}
              </div>
            ))}

            <div className="grid grid-cols-4 bg-slate-50 dark:bg-white/[0.03]">
              <div className="p-6" />
              {plans.map((plan) => (
                <div key={`${plan.id}-action`} className={cn("p-6", plan.popular ? "bg-slate-950/[0.03] dark:bg-white/[0.04]" : "")}>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(plan.id, plan.totalPrice)}
                    className={cn(
                      "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition",
                      plan.popular
                        ? "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                        : "border border-slate-200 bg-white text-slate-950 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:hover:bg-white/[0.04]"
                    )}
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-emerald-500" /> Secure provisioning</span>
            <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Admin-visible delivery</span>
            <span className="inline-flex items-center gap-2"><Server className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" /> Panel-ready setup</span>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Everything you need to launch</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Exact hosting-page structure inspired by your reference repo, adapted to Magnetic&apos;s real VPS provisioning flow.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hostingFeatureCards.map((feature) => (
              <article key={feature.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-12 shadow-[0_24px_80px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950 sm:px-10">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Need help choosing the right plan?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Review your current configuration, compare the tiers, and move directly into the Magnetic cart when you&apos;re ready.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => document.getElementById("hosting-plans")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Compare plans
              </button>
              <button
                type="button"
                onClick={() => openCart()}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:hover:bg-white/[0.04]"
              >
                Open cart
              </button>
            </div>
            <div className="mt-8">
              <HostingConfigurationSummary lines={resolvedHostingConfiguration.summaryLines} tone="subtle" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
