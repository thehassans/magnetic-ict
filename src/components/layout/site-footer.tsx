"use client";

import { ArrowRight, Headset, Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/branding/brand-logo";
import { Link } from "@/i18n/navigation";

type SiteFooterProps = {
  locale: string;
};

export function SiteFooter({ locale }: SiteFooterProps) {
  const t = useTranslations("Footer");

  return (
    <footer className="relative z-10 mt-12 border-t border-white/70 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-hidden rounded-[32px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100">
                  <Headset className="h-4 w-4" />
                  {t("ctaEyebrow")}
                </div>
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                    {t("ctaTitle")}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                    {t("ctaDescription")}
                  </p>
                </div>
              </div>
              <Link
                href="/support"
                locale={locale}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-700"
              >
                {t("ctaButton")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-cyan-100 bg-white/85 p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{t("contact")}</h3>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                  <span>support@magneticict.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                  <span>+1 (000) 000-0000</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                  <span>Global delivery, always-on support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 rounded-[32px] border border-violet-100 bg-white/85 p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-[0_10px_35px_rgba(124,58,237,0.08)] dark:border-white/10 dark:bg-white/5">
              <BrandLogo className="w-[160px]" />
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">{t("description")}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {t("platform")}
            </h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Link href="/" locale={locale} className="transition hover:text-violet-700 dark:hover:text-cyan-300">
                Home
              </Link>
              <Link href="/services" locale={locale} className="transition hover:text-violet-700 dark:hover:text-cyan-300">
                Services
              </Link>
              <Link href="/cart" locale={locale} className="transition hover:text-violet-700 dark:hover:text-cyan-300">
                Cart
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {t("company")}
            </h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Link href="/support" locale={locale} className="transition hover:text-violet-700 dark:hover:text-cyan-300">
                Support
              </Link>
              <Link href="/dashboard" locale={locale} className="transition hover:text-violet-700 dark:hover:text-cyan-300">
                Dashboard
              </Link>
              <span className="text-slate-500 dark:text-slate-400">{t("rights")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
