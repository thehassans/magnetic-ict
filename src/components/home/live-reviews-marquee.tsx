"use client";

import { Star } from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { developerTestimonials } from "@/lib/developer-testimonials";
import { reviews } from "@/lib/reviews";
import { cn } from "@/lib/utils";

export function LiveReviewsMarquee() {
  return (
    <section id="home-reviews" className="space-y-10 py-10 sm:py-14">
      <ReviewSection
        eyebrow="Customer reviews"
        title="Trusted by customers buying hosting and premium infrastructure"
        description="A cleaner, more reference-style testimonial section with direct customer voices, service labels, and premium visual treatment."
        items={reviews.slice(0, 3).map((review, index) => ({
          id: review.id,
          name: review.name,
          subtitle: review.service,
          meta: review.company,
          rating: review.rating,
          avatar: review.avatar,
          body: review.comment,
          highlighted: index === 1
        }))}
      />

      <ReviewSection
        eyebrow="Developer trust"
        title="Trusted by developers building with MagneticICT"
        description="A matching premium section for developer testimonials, restored as a separate block beneath customer reviews."
        items={developerTestimonials.slice(0, 3).map((review, index) => ({
          id: String(review.id),
          name: review.name,
          subtitle: review.role,
          meta: review.company,
          rating: review.rating,
          avatar: review.avatar,
          body: review.content,
          highlighted: index === 1
        }))}
      />
    </section>
  );
}

type ReviewItem = {
  id: string;
  name: string;
  subtitle: string;
  meta: string;
  rating: number;
  avatar: string;
  body: string;
  highlighted: boolean;
};

function ReviewSection({
  eyebrow,
  title,
  description,
  items
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: ReviewItem[];
}) {
  return (
    <ScrollReveal>
      <div className="rounded-[2rem] border border-slate-200 bg-white px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950 sm:px-8 sm:py-10 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">{eyebrow}</div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">{description}</p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {items.map((review) => (
            <article
              key={review.id}
              className={cn(
                "rounded-[1.75rem] border p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1",
                review.highlighted
                  ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                  : "border-slate-200 bg-slate-50/70 text-slate-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-white/10">
                  <img src={review.avatar} alt={review.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className={cn("truncate text-sm font-semibold", review.highlighted ? "text-white dark:text-slate-950" : "text-slate-950 dark:text-white")}>{review.name}</div>
                  <div className={cn("truncate text-[11px] uppercase tracking-[0.18em]", review.highlighted ? "text-white/65 dark:text-slate-700" : "text-slate-400 dark:text-slate-500")}>{review.subtitle}</div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className={cn(
                      "h-4 w-4",
                      starIndex < Math.floor(review.rating)
                        ? "fill-amber-400 text-amber-400"
                        : review.highlighted
                          ? "fill-white/15 text-white/15 dark:fill-slate-300/30 dark:text-slate-300/30"
                          : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                    )}
                  />
                ))}
              </div>

              <p className={cn("mt-4 text-sm leading-7", review.highlighted ? "text-white/82 dark:text-slate-700" : "text-slate-600 dark:text-slate-300")}>
                “{review.body}”
              </p>

              <div className={cn("mt-5 text-[11px] uppercase tracking-[0.22em]", review.highlighted ? "text-white/55 dark:text-slate-700" : "text-slate-400 dark:text-slate-500")}>{review.meta}</div>
            </article>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
