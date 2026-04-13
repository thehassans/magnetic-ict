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
          duration={34}
          itemClassName="shrink-0"
          items={firstRow.map((review) => (
            <ReviewCard key={review.name} review={review} />
          ))}
        />
        <InfiniteMarquee
          duration={40}
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

  return (
    <div className="w-[23rem] rounded-[26px] border border-slate-200 bg-white/92 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image
            src={review.avatar}
            alt={review.name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full border border-white object-cover shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
          />
          <div>
            <div className="font-semibold text-slate-950 dark:text-white">{review.name}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{t(`reviewRoles.${review.id}`)}</div>
          </div>
        </div>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">5.0</div>
      </div>

      <div className="mt-4 flex items-center gap-1 text-amber-500">
        {Array.from({ length: review.rating }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{t(`reviewContent.${review.id}`)}</p>
    </div>
  );
}
