import { Activity, Briefcase, Database, Globe, LayoutGrid, Lock, Mail, Search, Shield, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { serviceMenuItems, type ServiceMenuKey } from "@/lib/service-menu";

const iconMap = {
  ssl: ShieldCheck,
  websiteBuilder: LayoutGrid,
  emailServices: Mail,
  professionalEmail: Briefcase,
  seoTools: Search,
  siteLockVpn: Lock,
  siteMonitoring: Activity,
  websiteSecurity: Shield,
  websiteBackup: Database,
  nordVpn: Globe
} satisfies Record<ServiceMenuKey, typeof ShieldCheck>;

export default async function ServicesPage() {
  const t = await getTranslations("Pages");
  const navigation = await getTranslations("Navigation");
  const servicesDetail = await getTranslations("ServicesDetail");

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("servicesEyebrow")}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          {t("servicesTitle")}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
          {t("servicesDescription")}
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {serviceMenuItems.map((item) => {
          const Icon = iconMap[item.key];

          return (
            <Link
              id={item.id}
              key={item.key}
              href={`/services/${item.key}`}
              className="group block rounded-[30px] border border-slate-200 bg-white/90 p-6 transition hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-50/50 dark:border-white/10 dark:bg-slate-950/60 dark:hover:border-cyan-400/20 dark:hover:bg-white/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100 dark:bg-white/5 dark:text-cyan-300 dark:group-hover:bg-cyan-400/10">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">
                {navigation(`items.${item.key}.title`)}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {navigation(`items.${item.key}.description`)}
              </p>
              <p className="mt-4 text-sm font-medium text-cyan-700 dark:text-cyan-300">{servicesDetail("pricingTitle")}</p>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
