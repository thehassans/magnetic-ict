"use client";

import type { CatalogService } from "@/lib/service-catalog";
import Pricing_04 from "@/components/ui/ruixen-pricing-04";

export function ServiceTierSelector({ service }: { service: CatalogService }) {
  return <Pricing_04 service={service} />;
}
