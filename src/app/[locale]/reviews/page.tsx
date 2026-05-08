"use client";

import { useMemo } from "react";
import { Star, ShieldCheck, Zap, Globe2 } from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { reviews } from "@/lib/reviews";
import { developerTestimonials } from "@/lib/developer-testimonials";
import { cn } from "@/lib/utils";

export default function ReviewsPage() {
  // Combine and randomize reviews, keeping only 4 and 5 stars
  const allReviews = useMemo(() => {
    const combined = [
      ...reviews,
      ...developerTestimonials.map(t => ({
        id: t.id.toString(),
        name: t.name,
        rating: t.rating,
        avatar: t.avatar,
        company: t.company,
        service: t.role,
        comment: t.content
      }))
    ] as any[];
    
    // Filter for 4 and 5 stars, then shuffle
    const filtered = combined.filter(r => r.rating >= 4);
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
    }
    
    return filtered;
  }, []);

  return (
    <main className="bg-white dark:bg-[#06080f]">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-slate-200/40 py-24 dark:border-white/[0.06] sm:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[15%] -top-[30%] h-[90vh] w-[90vh] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(99,102,241,0.2),transparent_60%)]" />
          <div className="absolute -right-[10%] top-[5%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-indigo-700 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-indigo-300">
                <Star className="h-3.5 w-3.5" /> Loved by developers
              </div>
              <h1 className="mt-7 text-5xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl lg:leading-[1.05]">
                Real feedback from{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-300">
                  real operators.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500 dark:text-slate-400">
                See why thousands of developers, creators, and businesses across the globe trust Magnetic ICT for their premium digital infrastructure.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                {[
                  { icon: Star, label: "4.9/5", sub: "Average Rating" },
                  { icon: ShieldCheck, label: "99.9%", sub: "Uptime SLA" },
                  { icon: Zap, label: "5,218+", sub: "Verified Reviews" },
                ].map((b) => (
                  <div key={b.sub} className="inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/80 px-5 py-2.5 backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03]">
                    <b.icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{b.label}</span>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{b.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── REVIEWS GRID ── */}
      <section className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allReviews.map((review, i) => (
              <ScrollReveal key={`${review.id}-${i}`} delay={i * 0.05}>
                <article className="group flex h-full flex-col justify-between rounded-[2rem] border border-slate-200/60 bg-white p-7 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-[0_20px_60px_rgba(99,102,241,0.08)] dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.04] dark:hover:shadow-[0_20px_60px_rgba(2,6,23,0.5)]">
                  <div>
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={cn("h-4 w-4", index < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700")} />
                      ))}
                    </div>
                    <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                      "{review.comment}"
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={review.avatar} alt={review.name} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-100 dark:ring-white/10" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-slate-950 dark:text-white">{review.name}</div>
                      <div className="truncate text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{review.service || review.company}</div>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
