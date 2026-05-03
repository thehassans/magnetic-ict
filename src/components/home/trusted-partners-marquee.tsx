"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { InfiniteMarquee } from "@/components/home/infinite-marquee";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { cn } from "@/lib/utils";

const partnerAssetVersion = "2026-05-03-aligned";

const partners = [
  {
    name: "Cloudflare",
    src: `/partners/cloudflare.svg?v=${partnerAssetVersion}`,
    width: 240,
    height: 84,
    imageClassName: "h-[4.5rem] max-w-[13rem] sm:h-[4.75rem] sm:max-w-[13.5rem]"
  },
  {
    name: "Mastercard",
    src: `/partners/mastercard.svg?v=${partnerAssetVersion}`,
    width: 180,
    height: 56,
    imageClassName: "h-10 max-w-[9.5rem] sm:h-11 sm:max-w-[10rem]"
  },
  {
    name: "Stripe",
    src: `/partners/stripe.svg?v=${partnerAssetVersion}`,
    width: 180,
    height: 56,
    imageClassName: "h-9 max-w-[8.75rem] sm:h-10 sm:max-w-[9.25rem]"
  },
  {
    name: "AWS",
    src: `/partners/aws.svg?v=${partnerAssetVersion}`,
    width: 190,
    height: 60,
    imageClassName: "h-10 max-w-[9.5rem] sm:h-11 sm:max-w-[10.25rem]"
  },
  {
    name: "Apple Pay",
    src: `/partners/apple-pay.svg?v=${partnerAssetVersion}`,
    width: 190,
    height: 56,
    imageClassName: "h-9 max-w-[9rem] sm:h-10 sm:max-w-[9.5rem]"
  },
  {
    name: "Visa",
    src: `/partners/visa.svg?v=${partnerAssetVersion}`,
    width: 170,
    height: 52,
    imageClassName: "h-8 max-w-[8rem] sm:h-9 sm:max-w-[8.5rem]"
  }
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
        items={partners.map(({ name, src, width, height, imageClassName }) => (
          <motion.div
            key={name}
            whileHover={{ y: -4 }}
            className="flex h-24 w-[15rem] items-center justify-center rounded-[24px] border border-slate-200/90 bg-white/95 px-7 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition hover:border-cyan-200 hover:bg-cyan-50/60 dark:border-white/10 dark:bg-white/95 dark:hover:border-cyan-400/20 dark:hover:bg-cyan-50/90"
          >
            <Image
              src={src}
              alt={name}
              width={width}
              height={height}
              className={cn("w-auto object-contain object-center", imageClassName)}
              unoptimized
            />
          </motion.div>
        ))}
      />
    </section>
  );
}
