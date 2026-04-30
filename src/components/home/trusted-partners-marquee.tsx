"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { InfiniteMarquee } from "@/components/home/infinite-marquee";
import { ScrollReveal } from "@/components/home/scroll-reveal";

const partnerAssetVersion = "2026-04-15-desktop";

const partners = [
  { name: "Cloudflare", src: `/partners/cloudflare.png?v=${partnerAssetVersion}`, width: 200, height: 56 },
  { name: "Mastercard", src: `/partners/mastercard.png?v=${partnerAssetVersion}`, width: 190, height: 56 },
  { name: "Stripe", src: `/partners/stripe.jpg?v=${partnerAssetVersion}`, width: 190, height: 56 },
  { name: "AWS", src: `/partners/aws.webp?v=${partnerAssetVersion}`, width: 180, height: 56 },
  { name: "Apple Pay", src: `/partners/apple-pay.jpg?v=${partnerAssetVersion}`, width: 220, height: 56 },
  { name: "Visa", src: `/partners/visa.jpg?v=${partnerAssetVersion}`, width: 180, height: 56 }
] as const;

export function TrustedPartnersMarquee() {
  const t = useTranslations("Landing");

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
        items={partners.map(({ name, src, width, height }) => (
          <motion.div
            key={name}
            whileHover={{ y: -4 }}
            className="flex h-20 w-[13.5rem] items-center justify-center rounded-[24px] border border-slate-200/90 bg-white/95 px-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition hover:border-cyan-200 hover:bg-cyan-50/60 dark:border-white/10 dark:bg-white/95 dark:hover:border-cyan-400/20 dark:hover:bg-cyan-50/90"
          >
            <Image src={src} alt={name} width={width} height={height} className="h-9 w-auto max-w-[10rem] object-contain" unoptimized />
          </motion.div>
        ))}
      />
    </section>
  );
}
