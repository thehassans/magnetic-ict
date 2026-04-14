"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { InfiniteMarquee } from "@/components/home/infinite-marquee";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { reviews } from "@/lib/reviews";

export function LiveReviewsMarquee() {
  const t = useTranslations("Landing");
  const firstRow = reviews.slice(0, Math.ceil(reviews.length / 2));
  const secondRow = reviews.slice(Math.ceil(reviews.length / 2));

  return (
    <section className="space-y-8 py-8 sm:py-12">
      <ScrollReveal className="space-y-4 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300">{t("reviewsEyebrow")}</div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {t("reviewsTitle")}
        </h2>
      </ScrollReveal>

      <div className="space-y-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <InfiniteMarquee
          duration={26}
          itemClassName="shrink-0"
          items={firstRow.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        />
        <InfiniteMarquee
          duration={30}
          reverse
          itemClassName="shrink-0"
          items={secondRow.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        />
      </div>
    </section>
  );
}

function ReviewCard({
  review
}: {
  review: (typeof reviews)[number];
}) {
  const t = useTranslations("Landing");
  const numericRating = review.rating.toFixed(1);

  return (
    <div className="w-[23rem] rounded-[26px] border border-slate-200/90 bg-white/95 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="overflow-hidden rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 p-1 shadow-[0_10px_28px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 dark:from-violet-400/20 dark:to-cyan-400/20 dark:ring-white/10">
            <Image
              src={review.avatar}
              alt={review.name}
              width={72}
              height={72}
              className="h-[4.5rem] w-[4.5rem] rounded-full border border-white/80 object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-slate-950 dark:text-white">{review.name}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{t(`reviewRoles.${review.id}`)}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <GoogleIcon />
            Google
          </div>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {numericRating}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => {
          const fillPercent = Math.max(0, Math.min(1, review.rating - index)) * 100;

          return (
            <span key={index} className="relative h-4 w-4">
              <Star className="absolute inset-0 h-4 w-4 text-slate-200 dark:text-slate-700" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                <Star className="h-4 w-4 fill-current text-amber-500" />
              </span>
            </span>
          );
        })}
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{t(`reviewContent.${review.id}`)}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M16.64 9.2c0-.58-.05-1.14-.16-1.68H9v3.18h4.27a3.66 3.66 0 0 1-1.58 2.4v1.99h2.56c1.5-1.38 2.39-3.41 2.39-5.89Z" fill="#4285F4" />
      <path d="M9 17c2.02 0 3.71-.67 4.95-1.82l-2.56-1.99c-.71.47-1.62.75-2.39.75-1.84 0-3.41-1.24-3.97-2.91H2.38v2.05A8 8 0 0 0 9 17Z" fill="#34A853" />
      <path d="M5.03 11.03A4.8 4.8 0 0 1 4.81 10c0-.36.08-.71.22-1.03V6.92H2.38A8 8 0 0 0 1.5 10c0 1.29.31 2.51.88 3.58l2.65-2.05Z" fill="#FBBC05" />
      <path d="M9 4.06c1.1 0 2.08.38 2.85 1.11l2.13-2.13C12.7 1.85 11.01 1 9 1 5.87 1 3.18 2.8 2.38 5.42l2.65 2.05c.56-1.67 2.13-2.91 3.97-2.91Z" fill="#EA4335" />
    </svg>
  );
}
