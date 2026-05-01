import { Bot, Instagram, MessageCircle, Server, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { AiDetectionTool } from "@/components/services/ai-detection-tool";
import { ImageConversionTool } from "@/components/services/image-conversion-tool";
import { ServiceTierSelector } from "@/components/services/service-tier-selector";
import { VideoDownloaderTool } from "@/components/services/video-downloader-tool";
import { Link } from "@/i18n/navigation";
import { getHostingProviderSettings } from "@/lib/platform-settings";
import { getServiceDescription, getServiceTitle } from "@/lib/service-i18n";
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
  const description = service.overrides.description ? service.description : getServiceDescription(navigation, service.id);
  const isFaceSearchService = service.id === "magneticFaceSearch";
  const isImageConversionService = service.id === "imageConversion";
  const isAiDetectionService = service.id === "aiDetection";
  const isVideoDownloaderService = service.id === "videoDownloader";
  const isMagneticSocialBotService = service.id === "magneticSocialBot";
  const isMagneticVpsHostingService = service.id === "magneticVpsHosting";
  const isFreeUtilityService = isImageConversionService || isAiDetectionService || isVideoDownloaderService;
  const hostingProviderConfig = isMagneticVpsHostingService ? await getHostingProviderSettings() : null;

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
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                {description}
              </p>
              {!isFreeUtilityService ? (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
                  {service.tagline}
                </p>
              ) : null}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="rounded-[38px] border border-violet-100 bg-white/90 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/65 sm:p-10">
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("visualLabel")}</div>
            <div className="mt-6 rounded-[30px] border border-slate-200 bg-slate-50 p-8 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{service.category}</div>
              <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{title}</div>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{t("visualDescription")}</p>
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
        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
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

          <ScrollReveal delay={0.06}>
            <div className="rounded-[34px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
              <div className="space-y-4">
                {service.benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400" />
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">{benefit}</p>
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
              <div className="max-w-3xl">
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Live demo</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  Test the approved registry workflow with upload, scan animation, and ranked source matches.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  Launch the private demo to try the upload-to-search experience against an approved sample registry designed for consent-based product validation.
                </p>
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
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                1 inbox. AI or manual control. Business-aware replies.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                After purchase, your dashboard unlocks the onboarding wizard, document-to-RAG upload, channel setup, and the unified messaging command center.
              </p>
            </div>
          </ScrollReveal>
        </section>
      ) : null}

      {isMagneticVpsHostingService ? (
        <section>
          <ScrollReveal>
            <div className="rounded-[34px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <Server className="h-4 w-4" />
                IONOS-backed delivery
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Magnetic storefront. Reseller logic. Cloud provisioning.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Magnetic VPS Hosting keeps the buying experience on your platform while the backend can create reseller-side customer records, provision IONOS cloud infrastructure, and track provisioning state in the admin panel.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">Platform checkout</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Customers select a VPS tier, complete checkout on Magnetic, and stay inside your service flow.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">Admin fulfillment</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Operators trigger fulfillment from admin and can review reseller, datacenter, server, and volume references.</p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-sm font-semibold text-slate-950 dark:text-white">Configurable provider mode</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Run in manual mode first or switch to live IONOS API-backed provisioning once credentials and contract settings are ready.</p>
                </div>
              </div>
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
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("pricingEyebrow")}</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                {t("pricingTitle")}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                {t("pricingDescription")}
              </p>
            </div>
          </ScrollReveal>
  
          <ServiceTierSelector service={service} hostingProviderConfig={hostingProviderConfig} />
        </section>
      )}
    </main>
  );
}
