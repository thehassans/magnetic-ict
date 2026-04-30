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
    <section id="home-reviews" className="space-y-10 py-8 sm:py-12">
      <ScrollReveal className="space-y-4 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300">{t("reviewsEyebrow")}</div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {t("reviewsTitle")}
        </h2>
        <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          {t("reviewsDescription")}
        </p>
      </ScrollReveal>

      <div className="space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] px-4 py-6 shadow-[0_28px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="mb-6 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Customers</div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Real customer feedback from operators who trust MagneticICT for performance, security, and day-to-day reliability.
            </p>
          </div>

          <CircularTestimonials
            testimonials={testimonials}
            autoplay
            fontSizes={{
              name: "clamp(1.75rem, 2vw, 2.5rem)",
              designation: "1rem",
              quote: "clamp(1rem, 1.4vw, 1.25rem)"
            }}
          />
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

        <div className="rounded-[2rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.14),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] px-4 py-6 shadow-[0_28px_90px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.16),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] sm:px-6 sm:py-8">
          <TestimonialsSection
            title="Developers across Bangladesh & South Asia"
            subtitle="Feedback from engineers who value clean architecture, strong delivery quality, and polished customer-facing implementation."
            testimonials={[...developerTestimonials]}
            autoRotateInterval={6500}
            trustedCompanies={["Dhaka", "Chattogram", "Sylhet", "Colombo", "Karachi"]}
            trustedCompaniesTitle="Regional developer voices"
            className="py-0"
            theme="dark"
          />
        </div>
      </div>
    </section>
  );
}
