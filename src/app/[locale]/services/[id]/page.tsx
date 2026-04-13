import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { ServiceTierSelector } from "@/components/services/service-tier-selector";
import { getServiceDescription, getServiceTitle } from "@/lib/service-i18n";
import { getServiceById, serviceCatalog } from "@/lib/service-catalog";

export function generateStaticParams() {
  return serviceCatalog.map((service) => ({ id: service.id }));
}

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("ServicesDetail");
  const navigation = await getTranslations("Navigation");
  const service = getServiceById(id);

  if (!service) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <ScrollReveal>
          <div className="space-y-5 rounded-[38px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
              <Sparkles className="h-4 w-4" />
              {t("visualLabel")}
            </div>
            <div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                {getServiceTitle(navigation, service.id)}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                {getServiceDescription(navigation, service.id)}
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="relative overflow-hidden rounded-[38px] border border-violet-100 bg-white/90 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/65 sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.18),transparent_24%)]" />
            <div className="relative z-10">
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("visualLabel")}</div>
              <div className="mt-6 rounded-[30px] border border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-white/5">
                <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-cyan-400 text-2xl font-semibold text-white shadow-glow">
                  {getServiceTitle(navigation, service.id).slice(0, 1)}
                </div>
                <div className="mt-6 text-2xl font-semibold text-slate-950 dark:text-white">{getServiceTitle(navigation, service.id)}</div>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{t("visualDescription")}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="space-y-5">
        <ScrollReveal>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("pricingEyebrow")}</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              {t("pricingTitle")}
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              {t("pricingDescription")}
            </p>
          </div>
        </ScrollReveal>

        <ServiceTierSelector service={service} />
      </section>
    </main>
  );
}
