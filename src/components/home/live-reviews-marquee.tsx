"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import { TestimonialsSection } from "@/components/ui/simple-animated-testimonials";
import { developerTestimonials } from "@/lib/developer-testimonials";
import { reviews } from "@/lib/reviews";

export function LiveReviewsMarquee() {
  const t = useTranslations("Landing");
  const testimonials = reviews.map((review) => ({
    name: review.name,
    designation: `${t(`reviewRoles.${review.id}`)} · ${review.company}`,
    quote: t(`reviewContent.${review.id}`),
    src: review.avatar,
    company: review.company,
    rating: review.rating,
    badgeLabel: "Verified customer"
  }));
  const highlightReviews = reviews.slice(0, 3);

  return (
    <section className="space-y-8 py-8 sm:py-12">
      <ScrollReveal className="space-y-4 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300">{t("reviewsEyebrow")}</div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {t("reviewsTitle")}
        </h2>
        <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          {t("reviewsDescription")}
        </p>
      </ScrollReveal>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.2),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,1))] px-4 py-6 shadow-[0_28px_90px_rgba(2,6,23,0.45)] sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <CircularTestimonials
            testimonials={testimonials}
            autoplay
            theme="dark"
            colors={{
              name: "#f8fafc",
              designation: "#cbd5e1",
              testimony: "#e2e8f0",
              arrowBackground: "#e2e8f0",
              arrowForeground: "#020617",
              arrowHoverBackground: "#22d3ee"
            }}
            fontSizes={{
              name: "clamp(1.75rem, 2vw, 2.5rem)",
              designation: "1rem",
              quote: "clamp(1rem, 1.4vw, 1.25rem)"
            }}
          />
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.16),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] px-4 py-6 shadow-[0_28px_90px_rgba(2,6,23,0.32)] sm:px-6 sm:py-8">
          <TestimonialsSection
            title="Built with developers across Bangladesh & South Asia"
            subtitle="A second signal of trust from engineers who care about clean architecture, strong delivery, and premium customer-facing product quality."
            testimonials={[...developerTestimonials]}
            autoRotateInterval={6500}
            trustedCompanies={["Dhaka", "Chattogram", "Sylhet", "Colombo", "Karachi"]}
            trustedCompaniesTitle="Regional developer voices"
            theme="dark"
            className="py-0"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlightReviews.map((review) => (
          <div key={review.id} className="rounded-[1.5rem] border border-slate-200/90 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-slate-950 dark:text-white">{review.name}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t(`reviewRoles.${review.id}`)}</div>
              </div>
              <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                {review.rating.toFixed(1)}
              </div>
            </div>
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{t(`reviewContent.${review.id}`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
