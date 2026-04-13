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
  const numericRating = `${review.rating}.0`;

  return (
    <div className="w-[23rem] rounded-[26px] border border-slate-200/90 bg-white/95 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 p-1 shadow-[0_10px_28px_rgba(15,23,42,0.12)] dark:from-violet-400/20 dark:to-cyan-400/20">
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
        <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          {numericRating}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current text-amber-500" : "text-slate-200 dark:text-slate-700"}`} />
        ))}
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{t(`reviewContent.${review.id}`)}</p>
    </div>
  );
}
