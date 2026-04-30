import { LandingHero } from "@/components/home/landing-hero";
import { LiveReviewsMarquee } from "@/components/home/live-reviews-marquee";
import { TrustedPartnersMarquee } from "@/components/home/trusted-partners-marquee";

export default async function LocalizedHomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8 lg:space-y-16">
      <LandingHero locale={locale} />

      <TrustedPartnersMarquee />

      <LiveReviewsMarquee />
    </main>
  );
}
