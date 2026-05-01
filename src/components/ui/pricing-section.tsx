"use client";

import { useMemo, useState } from "react";
import { CircleCheck, ShoppingBag } from "lucide-react";
import { HostingConfigurationSummary } from "@/components/commerce/hosting-configuration-summary";
import { HostingConfigurator } from "@/components/services/hosting-configurator";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createDefaultHostingSelection, getHostingConfigurationTotal, resolveHostingConfiguration } from "@/lib/hosting-commerce";
import type { HostingProviderSettings } from "@/lib/hosting-types";
import { getLocalizedTierName } from "@/lib/service-i18n";
import type { CatalogService } from "@/lib/service-catalog";
import { cn } from "@/lib/utils";

type PricingSectionProps = {
  service: CatalogService;
  hostingProviderConfig?: HostingProviderSettings | null;
};

export function PricingSection({ service, hostingProviderConfig }: PricingSectionProps) {
  const t = useTranslations("Commerce");
  const { addItem } = useCommerce();
  const router = useRouter();
  const [hostingSelection, setHostingSelection] = useState(
    hostingProviderConfig ? createDefaultHostingSelection(hostingProviderConfig) : undefined
  );

  const featuredTierId = useMemo(() => {
    return service.tiers.find((tier) => tier.name === "Professional")?.id ?? service.tiers[1]?.id ?? service.tiers[0]?.id;
  }, [service.tiers]);
  const isHostingService = service.id === "magneticVpsHosting" && Boolean(hostingProviderConfig);
  const resolvedHostingConfiguration = useMemo(
    () => (hostingProviderConfig ? resolveHostingConfiguration(hostingSelection, hostingProviderConfig) : null),
    [hostingProviderConfig, hostingSelection]
  );

  return (
    <section className="space-y-6 rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_28px_90px_rgba(2,6,23,0.45)] sm:p-8">
      {isHostingService && hostingProviderConfig && resolvedHostingConfiguration ? (
        <HostingConfigurator
          settings={hostingProviderConfig}
          basePrice={service.tiers[0]?.price ?? 0}
          value={hostingSelection}
          onChange={(selection) => setHostingSelection(selection)}
        />
      ) : null}
      <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-3">
        {service.tiers.map((tier) => {
          const localizedTierName = getLocalizedTierName(t, tier.id, tier.name);
          const featured = tier.id === featuredTierId;
          const displayPrice = resolvedHostingConfiguration && isHostingService
            ? getHostingConfigurationTotal(tier.price, resolvedHostingConfiguration)
            : tier.price;
          const visibleFeatures = tier.features.slice(0, 3);

          return (
            <article
              key={tier.id}
              className={cn(
                "flex min-h-full flex-col rounded-[1.75rem] border border-slate-200/90 bg-slate-50/70 p-6 text-left transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:shadow-[0_20px_60px_rgba(2,6,23,0.45)]",
                featured && "border-cyan-300 bg-white shadow-[0_24px_70px_rgba(34,211,238,0.14)] ring-1 ring-cyan-300/40 dark:border-cyan-400/30 dark:bg-slate-950/80 dark:ring-cyan-400/20"
              )}
              aria-label={`${localizedTierName} plan`}
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2">
                  <Badge variant={featured ? "default" : "secondary"}>{localizedTierName}</Badge>
                  {featured ? (
                    <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:text-cyan-200">
                      {t("mostPopular")}
                    </span>
                  ) : null}
                </div>
                <h3 className="mb-2 mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
                  ${displayPrice}
                  <span className="ml-1 text-base font-medium text-slate-500 dark:text-slate-400">/ plan</span>
                </h3>
                {resolvedHostingConfiguration && isHostingService ? (
                  <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                    Base ${tier.price} + configuration ${resolvedHostingConfiguration.extraMonthlyPrice.toFixed(2)}
                  </p>
                ) : null}
              </div>

              <div className="my-5 border-t border-slate-200 dark:border-white/10" />

              {resolvedHostingConfiguration && isHostingService ? (
                <HostingConfigurationSummary lines={resolvedHostingConfiguration.summaryLines} tone="subtle" className="mb-4" />
              ) : null}

              <ul className="space-y-3">
                {visibleFeatures.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                    <CircleCheck className="mr-2 h-4 w-4 text-cyan-600 dark:text-cyan-300" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Button
                  size="sm"
                  className={cn(
                    "h-11 w-full rounded-xl",
                    featured ? "bg-slate-950 text-white hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400" : ""
                  )}
                  variant={featured ? "default" : "secondary"}
                  onClick={() => {
                    addItem({
                      serviceId: service.id,
                      tierId: tier.id,
                      price: displayPrice,
                      ...(resolvedHostingConfiguration && isHostingService
                        ? {
                            hostingConfiguration: resolvedHostingConfiguration.selection,
                            hostingSummary: resolvedHostingConfiguration.summaryLines
                          }
                        : {})
                    });
                    router.push("/cart");
                  }}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {t("addToCart")}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
