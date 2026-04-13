"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/home/scroll-reveal";

type LandingHeroProps = {
  locale: string;
  isSignedIn: boolean;
};

export function LandingHero({ locale, isSignedIn }: LandingHeroProps) {
  const t = useTranslations("Landing");
  const reduceMotion = useReducedMotion();
  const secondaryHref = isSignedIn ? "/dashboard" : "/customer/sign-in?callback=/dashboard";

  return (
    <section className="relative overflow-hidden rounded-[40px] border border-violet-100 bg-white/85 px-6 py-8 shadow-glow backdrop-blur-2xl sm:px-8 lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.12),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(6,182,212,0.1),transparent_28%)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-violet-500/12 blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, -18, 0], x: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl"
        animate={reduceMotion ? undefined : { y: [0, 18, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
        <div className="space-y-6">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-violet-700">
              <Sparkles className="h-4 w-4" />
              {t("eyebrow")}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.03] tracking-tight text-slate-950 sm:text-6xl xl:text-[4.5rem]">
                <span>{t("headlineStart")} </span>
                <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                  {t("headlineAccent")}
                </span>
                <span> {t("headlineEnd")}</span>
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                {t("description")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/services"
                  locale={locale}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  {t("primaryCta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={secondaryHref}
                  locale={locale}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 backdrop-blur-xl transition hover:border-violet-200 hover:text-violet-700"
                >
                  {isSignedIn ? t("secondaryCtaSignedIn") : t("secondaryCtaGuest")}
                </Link>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.1} className="relative">
          <div className="relative mx-auto max-w-md">
            <div className="rounded-[32px] border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/70 p-5 shadow-glow backdrop-blur-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{t("panelBadge")}</p>
                  <h2 className="mt-2 max-w-xs text-xl font-semibold text-slate-950">{t("panelTitle")}</h2>
                </div>
                <div className="inline-flex h-10 items-center justify-center rounded-2xl bg-cyan-50 px-4 text-sm font-semibold text-cyan-700">
                  {t("panelStatus")}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <PanelMetric
                  title={t("panelMetricOneTitle")}
                  description={t("panelMetricOneDescription")}
                  accent="from-violet-500 to-fuchsia-400"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PanelMetric({
  title,
  description,
  accent
}: {
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-4">
        <div className={`mt-1 h-12 w-2 rounded-full bg-gradient-to-b ${accent}`} />
        <div>
          <div className="text-base font-semibold text-slate-950">{title}</div>
          <div className="mt-1 text-sm leading-6 text-slate-600">{description}</div>
        </div>
      </div>
    </div>
  );
}
