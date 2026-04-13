"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CatalogService } from "@/lib/service-catalog";
import { getLocalizedTierName } from "@/lib/service-i18n";
import { cn } from "@/lib/utils";
import { useCommerce } from "@/components/commerce/commerce-provider";

export function ServiceTierSelector({ service }: { service: CatalogService }) {
  const t = useTranslations("Commerce");
  const { addItem } = useCommerce();

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {service.tiers.map((tier, index) => {
        const localizedTierName = getLocalizedTierName(t, tier.id, tier.name);

        return (
          <motion.article
            key={tier.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className={cn(
              "rounded-[32px] border border-slate-200 bg-white/90 p-6 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50",
              tier.name === "Professional" && "border-cyan-200 shadow-glow dark:border-cyan-400/30"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{localizedTierName}</div>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">${tier.price}</h3>
              </div>
              {tier.name === "Professional" ? (
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                  {t("mostPopular")}
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() =>
                addItem({
                  serviceId: service.id,
                  tierId: tier.id,
                  price: tier.price
                })
              }
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("addToCart")}
            </button>
          </motion.article>
        );
      })}
    </div>
  );
}
