import Image from "next/image";
import { Activity, Briefcase, Bot, Database, Globe, ImageIcon, LayoutGrid, Lock, Mail, ScanFace, Search, Shield, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getServiceDescription, getServiceTitle } from "@/lib/service-i18n";
import { serviceMenuItems, type ServiceMenuKey } from "@/lib/service-menu";
import { getVisibleServiceCatalogWithOverrides, type ServiceOverride } from "@/lib/service-overrides";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const iconMap = {
  ssl: ShieldCheck,
  websiteBuilder: LayoutGrid,
  emailServices: Mail,
  professionalEmail: Briefcase,
  seoTools: Search,
  imageConversion: ImageIcon,
  magneticSocialBot: Bot,
  magneticFaceSearch: ScanFace,
  siteLockVpn: Lock,
  siteMonitoring: Activity,
  websiteSecurity: Shield,
  websiteBackup: Database,
  nordVpn: Globe
} satisfies Record<ServiceMenuKey, typeof ShieldCheck>;

export default async function ServicesPage() {
  const [t, navigation, services] = await Promise.all([
    getTranslations("Pages"),
    getTranslations("Navigation"),
    getVisibleServiceCatalogWithOverrides()
  ]);

  const servicesById = new Map<string, ServiceOverride>(services.map((service: ServiceOverride) => [service.id, service]));

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
          const service = servicesById.get(item.key);

          if (!service) {
            return null;
          }

          const title = service.overrides.title ? service.name : getServiceTitle(navigation, service.id);
          const description = service.overrides.description ? service.description : getServiceDescription(navigation, service.id);
          const fromPrice = Math.min(...service.tiers.map((tier) => tier.price));
          const priceLabel = fromPrice === 0 ? "Free" : `From $${fromPrice}`;

          return (
            <Link
              id={item.id}
              key={item.key}
              href={`/services/${item.key}`}
              className="group block overflow-hidden rounded-[30px] border border-slate-200 bg-white/90 transition hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-50/50 dark:border-white/10 dark:bg-slate-950/60 dark:hover:border-cyan-400/20 dark:hover:bg-white/5"
            >
              <div className="relative aspect-[16/10] overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_30%),#eff6ff] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_30%),rgba(15,23,42,0.8)]">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl}
                    alt={title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    unoptimized
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-950/10 to-transparent" />
                <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-violet-600 shadow-lg backdrop-blur transition group-hover:bg-white dark:bg-slate-950/70 dark:text-cyan-300 dark:group-hover:bg-slate-950/80">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    {service.category}
                  </div>
                  <div className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">{priceLabel}</div>
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.tiers.map((tier) => (
                    <span key={tier.id} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      {tier.name}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
