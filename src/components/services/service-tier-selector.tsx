"use client";

import type { HostingProviderSettings } from "@/lib/hosting-types";
import type { CatalogService } from "@/lib/service-catalog";
import { PricingSection } from "@/components/ui/pricing-section";

export function ServiceTierSelector({
  service,
  hostingProviderConfig
}: {
  service: CatalogService;
  hostingProviderConfig?: HostingProviderSettings | null;
}) {
  return <PricingSection service={service} hostingProviderConfig={hostingProviderConfig} />;
}
