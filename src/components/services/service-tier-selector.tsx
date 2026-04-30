"use client";

import type { CatalogService } from "@/lib/service-catalog";
import { PricingSection } from "@/components/ui/pricing-section";

export function ServiceTierSelector({ service }: { service: CatalogService }) {
  return <PricingSection service={service} />;
}
