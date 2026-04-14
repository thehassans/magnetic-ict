"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { Component as Globe } from "@/components/ui/interactive-globe";
import { serviceCatalog } from "@/lib/service-catalog";

type LandingHeroProps = {
  locale: string;
  isSignedIn: boolean;
};

export function LandingHero({ locale, isSignedIn }: LandingHeroProps) {
  const t = useTranslations("Landing");
  const secondaryHref = isSignedIn ? "/dashboard" : "/customer/sign-in?callback=/dashboard";

  return (
    <section className="relative overflow-hidden rounded-[40px] bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.98))] shadow-[0_25px_80px_rgba(59,130,246,0.08)] backdrop-blur-2xl dark:bg-[linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.12),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.14),transparent_26%)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(14,165,233,0.18),transparent_26%)]" />
      <div className="absolute right-1/4 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="flex min-h-[540px] flex-col md:flex-row">
        <div className="relative z-10 flex flex-1 flex-col justify-center p-8 md:p-10 lg:p-14">
          <ScrollReveal>
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Magnetic ICT global service network
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                Magnetic ICT
                <br />
                <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-sky-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-300">
                  Global Digital Services
                </span>
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-700 sm:text-lg dark:text-slate-300">
                {t("description")}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="flex flex-wrap items-center gap-4 mb-8">
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
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-6 text-sm font-semibold text-slate-800 backdrop-blur-xl transition hover:border-violet-200 hover:text-violet-700 dark:border-white/10 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  {isSignedIn ? t("secondaryCtaSignedIn") : t("secondaryCtaGuest")}
                </Link>
              </motion.div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="flex items-center gap-6">
              <HeroStat value={`${serviceCatalog.length}+`} label="Service lines" />
              <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
              <HeroStat value="24/7" label="Priority support" />
              <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
              <HeroStat value="99.9%" label="Ops uptime target" />
            </div>
          </ScrollReveal>
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-0 min-h-[420px]">
          <ScrollReveal delay={0.1} className="relative w-full max-w-[30rem]">
            <div className="relative mx-auto overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-slate-50 to-violet-50/70 p-5 shadow-[0_24px_70px_rgba(59,130,246,0.08)] backdrop-blur-2xl dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.88))]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{t("panelBadge")}</p>
                  <h2 className="mt-2 max-w-xs text-xl font-semibold text-slate-950 dark:text-white">{t("panelTitle")}</h2>
                </div>
                <div className="inline-flex h-10 items-center justify-center rounded-2xl bg-cyan-50 px-4 text-sm font-semibold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-200">
                  {t("panelStatus")}
                </div>
              </div>

              <div className="flex items-center justify-center min-h-[360px] rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95),rgba(239,246,255,0.92))] dark:bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.98),rgba(2,6,23,0.96))]">
                <Globe size={420} />
              </div>

              <div className="mt-5 space-y-3">
                <PanelMetric title={t("panelMetricOneTitle")} description={t("panelMetricOneDescription")} accent="from-violet-500 to-fuchsia-400" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
      <p className="text-xs text-slate-600 dark:text-slate-400">{label}</p>
    </div>
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
    <div className="rounded-[28px] bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:bg-slate-50">
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
