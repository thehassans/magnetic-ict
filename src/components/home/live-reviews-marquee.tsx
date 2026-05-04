"use client";

import { Star } from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { reviews } from "@/lib/reviews";
import { cn } from "@/lib/utils";

export function LiveReviewsMarquee() {
  return (
    <section id="home-reviews" className="py-10 sm:py-14">
      <ScrollReveal>
        <div className="rounded-[2rem] border border-slate-200 bg-white px-5 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950 sm:px-8 sm:py-10 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="text-[11px] font-medium uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">Customer reviews</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Trusted by customers buying hosting and premium infrastructure
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              A cleaner, more reference-style testimonial section with direct customer voices, service labels, and premium visual treatment.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {reviews.slice(0, 3).map((review, index) => (
              <article
                key={review.id}
                className={cn(
                  "rounded-[1.75rem] border p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1",
                  index === 1
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-200 bg-slate-50/70 text-slate-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-white/10">
                    <img src={review.avatar} alt={review.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className={cn("truncate text-sm font-semibold", index === 1 ? "text-white dark:text-slate-950" : "text-slate-950 dark:text-white")}>{review.name}</div>
                    <div className={cn("truncate text-[11px] uppercase tracking-[0.18em]", index === 1 ? "text-white/65 dark:text-slate-700" : "text-slate-400 dark:text-slate-500")}>{review.service}</div>
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
                          : index === 1
                            ? "fill-white/15 text-white/15 dark:fill-slate-300/30 dark:text-slate-300/30"
                            : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                      )}
                    />
                  ))}
                </div>

                <p className={cn("mt-4 text-sm leading-7", index === 1 ? "text-white/82 dark:text-slate-700" : "text-slate-600 dark:text-slate-300")}>
                  “{review.comment}”
                </p>

                <div className={cn("mt-5 text-[11px] uppercase tracking-[0.22em]", index === 1 ? "text-white/55 dark:text-slate-700" : "text-slate-400 dark:text-slate-500")}>
                  {review.company}
                </div>
              </article>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
