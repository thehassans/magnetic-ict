"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { CheckIcon, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { Button } from "@/components/ui/button";
import { getLocalizedTierName } from "@/lib/service-i18n";
import type { CatalogService } from "@/lib/service-catalog";
import { cn } from "@/lib/utils";

export default function Pricing_04({ service }: { service: CatalogService }) {
  const t = useTranslations("Commerce");
  const { addItem } = useCommerce();

  return (
    <div className="grid w-full grid-cols-1 gap-4 pt-2 lg:grid-cols-3 lg:gap-6">
      {service.tiers.map((tier) => {
        const localizedTierName = getLocalizedTierName(t, tier.id, tier.name);
        const featured = tier.name === "Professional";

        return (
          <motion.article
            key={tier.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "relative flex w-full flex-col items-start overflow-hidden rounded-2xl border border-foreground/10 bg-white/90 transition-all dark:bg-slate-950/60 lg:rounded-3xl",
              featured && "border-cyan-300 shadow-glow dark:border-cyan-400/30"
            )}
          >
            {featured ? <div className="absolute inset-x-0 top-1/2 -z-10 mx-auto h-16 w-full -rotate-6 rounded-3xl bg-cyan-500/20 blur-[7rem]" /> : null}

            <div className="flex w-full flex-col items-start rounded-t-2xl p-6 lg:rounded-t-3xl lg:p-8">
              <div className="flex w-full items-start justify-between gap-4">
                <h2 className="pt-2 text-xl font-medium text-foreground">{localizedTierName}</h2>
                {featured ? (
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                    {t("mostPopular")}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-3xl font-bold md:text-5xl text-slate-950 dark:text-white">
                <NumberFlow
                  value={tier.price}
                  format={{
                    currency: "USD",
                    style: "currency",
                    currencySign: "standard",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                    currencyDisplay: "narrowSymbol"
                  }}
                />
              </h3>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">{tier.summary}</p>
            </div>

            <div className="flex w-full flex-col items-start px-6 py-2 lg:px-8">
              <Button
                size="lg"
                className="h-11 w-full rounded-xl bg-slate-950 text-white hover:bg-violet-700"
                onClick={() => addItem({ serviceId: service.id, tierId: tier.id, price: tier.price })}
              >
                <ShoppingBag className="me-2 size-4" />
                {t("addToCart")}
              </Button>
              <div className="mt-3 h-6 w-full text-center text-sm text-muted-foreground">
                {featured ? t("mostPopular") : "Ready for immediate activation"}
              </div>
            </div>

            <div className="mb-4 ml-1 flex w-full flex-col items-start gap-y-3 p-6 lg:p-8">
              <span className="mb-1 text-base text-left text-slate-950 dark:text-white">Includes:</span>
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-center justify-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-center text-cyan-600 dark:text-cyan-300">
                    <CheckIcon className="size-5" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
