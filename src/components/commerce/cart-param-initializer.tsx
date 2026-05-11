"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { serviceCatalog } from "@/lib/service-catalog";

export function CartParamInitializer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addItem } = useCommerce();

  useEffect(() => {
    const tierId = searchParams.get("tierId");
    if (!tierId) return;

    for (const service of serviceCatalog) {
      const tier = service.tiers.find((t) => t.id === tierId);
      if (tier) {
        addItem({ serviceId: service.id, tierId: tier.id, price: tier.price });
        break;
      }
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("tierId");
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
