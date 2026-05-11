import { Bot, Instagram, MessageCircle, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { MagneticCommerceServicePage } from "@/components/services/magnetic-commerce-service-page";
import { MagneticPortfolioBuilderServicePage } from "@/components/services/magnetic-portfolio-builder-service-page";
import { MagneticSocialBotServicePage } from "@/components/services/magnetic-social-bot-service-page";
import { MagneticVpsServicePage } from "@/components/services/magnetic-vps-service-page";
import { AiDetectionTool } from "@/components/services/ai-detection-tool";
import { ImageConversionTool } from "@/components/services/image-conversion-tool";
import { ServiceTierSelector } from "@/components/services/service-tier-selector";
import { VideoDownloaderTool } from "@/components/services/video-downloader-tool";
import { Link } from "@/i18n/navigation";
import { getHostingProviderSettings } from "@/lib/platform-settings";
import { getServiceTitle } from "@/lib/service-i18n";
import { getServiceByIdWithOverrides } from "@/lib/service-overrides";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations("ServicesDetail");
  const navigation = await getTranslations("Navigation");
  const service = await getServiceByIdWithOverrides(id);

  if (!service) {
    notFound();
  }

  const title = service.overrides.title ? service.name : getServiceTitle(navigation, service.id);
  const isFaceSearchService = service.id === "magneticFaceSearch";
  const isImageConversionService = service.id === "imageConversion";
  const isAiDetectionService = service.id === "aiDetection";
  const isVideoDownloaderService = service.id === "videoDownloader";
  const isMagneticSocialBotService = service.id === "magneticSocialBot";
  const isMagneticCommerceService = service.id === "magneticCommerce";
  const isMagneticVpsHostingService = service.id === "magneticVpsHosting";
  const isMagneticPortfolioBuilderService = service.id === "magneticPortfolioBuilder";
  const isFreeUtilityService = isImageConversionService || isAiDetectionService || isVideoDownloaderService;
  const hostingProviderConfig = isMagneticVpsHostingService ? await getHostingProviderSettings() : null;

  if (isMagneticPortfolioBuilderService) {
    return <MagneticPortfolioBuilderServicePage service={service} />;
  }

  if (isMagneticCommerceService) {
    return <MagneticCommerceServicePage service={service} title={title} />;
  }

  if (isMagneticSocialBotService) {
    return <MagneticSocialBotServicePage service={service} title={title} />;
  }

  if (isMagneticVpsHostingService) {
    return <MagneticVpsServicePage service={service} title={title} />;
  }

  if (isVideoDownloaderService) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#06080f]">
        {/* Background mesh */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-[30%] left-[20%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="absolute top-[20%] right-[10%] h-[40vh] w-[40vh] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.06),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          {/* Hero text */}
          <div className="mb-10 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              {t("freeDownloader")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500 dark:text-slate-400">
              {t("downloaderDescription")}
            </p>
          </div>
          {/* The tool itself */}
          <VideoDownloaderTool />
        </div>
      </main>
    );
  }

  if (isAiDetectionService) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#06080f]">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[20%] top-0 h-[50vh] w-[50vh] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(139,92,246,0.15),transparent_60%)]" />
          <div className="absolute right-[5%] top-[40%] h-[40vh] w-[40vh] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.06),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(6,182,212,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              {t("freeForensicScan")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{title}</h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500 dark:text-slate-400">
              {t("aiDetectionDescription")}
            </p>
          </div>
          <AiDetectionTool />
        </div>
      </main>
    );
  }

  if (isImageConversionService) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#06080f]">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-0 h-[50vh] w-[50vh] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.07),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(16,185,129,0.13),transparent_60%)]" />
          <div className="absolute right-[15%] top-[30%] h-[40vh] w-[40vh] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(99,102,241,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Free converter
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{title}</h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-500 dark:text-slate-400">
              Upload an image, choose your output format and resize options — get a converted file instantly, free.
            </p>
          </div>
          <ImageConversionTool />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <ScrollReveal>
          <div className="space-y-5 rounded-[38px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
              <Sparkles className="h-4 w-4" />
              {service.eyebrow}
            </div>
            <div>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                {title}
              </h1>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="rounded-[38px] border border-violet-100 bg-white/90 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/65 sm:p-10">
            <div className="mt-6 rounded-[30px] border border-slate-200 bg-slate-50 p-8 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{service.category}</div>
              <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{title}</div>
              <div className="mt-6 flex flex-wrap gap-2">
                {service.highlights.map((highlight) => (
                  <span key={highlight} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {isImageConversionService ? (
        <section>
          <ScrollReveal>
            <ImageConversionTool compact />
          </ScrollReveal>
        </section>
      ) : isAiDetectionService ? (
        <section>
          <ScrollReveal>
            <AiDetectionTool compact />
          </ScrollReveal>
        </section>
      ) : isVideoDownloaderService ? (
        <section>
          <ScrollReveal>
            <VideoDownloaderTool compact />
          </ScrollReveal>
        </section>
      ) : (
        <section>
          <ScrollReveal>
            <div className="rounded-[34px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{service.category}</div>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">{service.imageLabel}</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {service.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {isFaceSearchService ? (
        <section>
          <ScrollReveal>
            <div className="flex flex-col gap-5 rounded-[34px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Live demo</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Magnetic Face Search</h2>
              </div>

              <Link
                href="/services/magneticFaceSearch/live"
                locale={locale}
                className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Launch live demo
              </Link>
            </div>
          </ScrollReveal>
        </section>
      ) : null}

      {isMagneticSocialBotService ? (
        <section>
          <ScrollReveal>
            <div className="rounded-[34px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  <Bot className="h-4 w-4" />
                  Messenger
                </div>
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Unified messaging</h2>
            </div>
          </ScrollReveal>
        </section>
      ) : null}

      {isFreeUtilityService ? (
        null
      ) : (
        <section className="space-y-5">
          <ScrollReveal>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {t("pricingTitle")}
              </h2>
            </div>
          </ScrollReveal>
  
          <ServiceTierSelector service={service} hostingProviderConfig={hostingProviderConfig} />
        </section>
      )}
    </main>
  );
}
