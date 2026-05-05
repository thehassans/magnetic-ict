import { Activity, Briefcase, Bot, BrainCircuit, Database, Download, Globe, ImageIcon, LayoutGrid, Lock, Mail, Package, ScanFace, Search, Server, Shield, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getServiceTitle } from "@/lib/service-i18n";
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
  aiDetection: BrainCircuit,
  videoDownloader: Download,
  magneticSocialBot: Bot,
  magneticCommerce: Package,
  magneticVpsHosting: Server,
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
      <section className="border-b border-slate-200 pb-8 dark:border-white/10 sm:pb-10">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{t("servicesEyebrow")}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
          {t("servicesTitle")}
        </h1>
      </section>

      <section className="mt-8 divide-y divide-slate-200 border-t border-slate-200 dark:divide-white/10 dark:border-white/10">
        {serviceMenuItems.map((item) => {
          const Icon = iconMap[item.key];
          const service = servicesById.get(item.key);

          if (!service) {
            return null;
          }

          const title = service.overrides.title ? service.name : getServiceTitle(navigation, service.id);
          const fromPrice = Math.min(...service.tiers.map((tier) => tier.price));
          const priceLabel = fromPrice === 0 ? "Free" : `From $${fromPrice}`;

          return (
            <Link
              id={item.id}
              key={item.key}
              href={`/services/${item.key}`}
              className="group block py-6 transition hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
            >
              <div className="grid gap-4 md:grid-cols-[72px_minmax(0,1fr)_160px] md:items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
                    {service.category}
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
                </div>
                <div className="md:text-right">
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">{priceLabel}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
