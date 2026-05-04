"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { InfiniteMarquee } from "@/components/home/infinite-marquee";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { cn } from "@/lib/utils";

type TrustedPartner = {
  id: string;
  name: string;
  logoUrl: string;
  enabled: boolean;
};

const defaultPartners: TrustedPartner[] = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    logoUrl: "/partners/cloudflare.svg?v=2026-05-03-aligned",
    enabled: true
  },
  {
    id: "mastercard",
    name: "Mastercard",
    logoUrl: "/partners/mastercard.svg?v=2026-05-03-aligned",
    enabled: true
  },
  {
    id: "stripe",
    name: "Stripe",
    logoUrl: "/partners/stripe.svg?v=2026-05-03-aligned",
    enabled: true
  },
  {
    id: "aws",
    name: "AWS",
    logoUrl: "/partners/aws.svg?v=2026-05-03-aligned",
    enabled: true
  },
  {
    id: "apple-pay",
    name: "Apple Pay",
    logoUrl: "/partners/apple-pay.svg?v=2026-05-03-aligned",
    enabled: true
  },
  {
    id: "visa",
    name: "Visa",
    logoUrl: "/partners/visa.svg?v=2026-05-03-aligned",
    enabled: true
  }
];

type TrustedPartnersMarqueeProps = {
  partners?: TrustedPartner[];
};

export function TrustedPartnersMarquee({ partners }: TrustedPartnersMarqueeProps) {
  const t = useTranslations("Landing");
  const visiblePartners = (partners?.length ? partners : defaultPartners).filter((partner) => partner.enabled);

  return (
    <section id="trusted-ecosystem" className="space-y-6 py-4 sm:py-8">
      <ScrollReveal className="space-y-3 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300">{t("partnersEyebrow")}</div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {t("partnersTitle")}
        </h2>
      </ScrollReveal>

      <InfiniteMarquee
        duration={22}
        className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        itemClassName="shrink-0"
        items={visiblePartners.map((partner) => (
          <motion.div
            key={partner.id}
            whileHover={{ y: -4 }}
            className="relative flex h-24 w-[15rem] items-center justify-center overflow-hidden rounded-[24px] border border-slate-200/90 bg-white/95 px-7 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition hover:border-cyan-200 hover:bg-cyan-50/60 dark:border-white/10 dark:bg-white/95 dark:hover:border-cyan-400/20 dark:hover:bg-cyan-50/90"
          >
            <Image
              src={partner.logoUrl}
              alt={partner.name}
              fill
              sizes="240px"
              className={cn("object-contain object-center p-3")}
              unoptimized={partner.logoUrl.toLowerCase().includes(".svg")}
            />
          </motion.div>
        ))}
      />
    </section>
  );
}
