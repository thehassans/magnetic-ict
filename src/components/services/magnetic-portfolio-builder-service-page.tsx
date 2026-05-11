"use client";

import { useState } from "react";
import { ArrowRight, Check, Globe, Layout, Sparkles, Upload, Zap } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CatalogService } from "@/lib/service-catalog";
import { cn } from "@/lib/utils";

const features = [
  { icon: Layout, title: "Premium Templates", body: "Beautifully crafted portfolio templates with dark/light mode and responsive layouts." },
  { icon: Sparkles, title: "AI Chat Editor", body: "Tell the Portfolio AI what to change and it updates your site instantly — no code." },
  { icon: Upload, title: "Brand Uploads", body: "Upload your logo in light and dark variants. Your portfolio, your brand." },
  { icon: Globe, title: "Custom Domain", body: "Connect your own domain or use a free subdomain on magnetic-ict.com." },
  { icon: Zap, title: "1-Click Publish", body: "Go from draft to live in seconds. Your portfolio is always ready to share." }
];

const TIER_LABELS: Record<string, { accent: string; border: string; badge: string }> = {
  Starter: { accent: "from-slate-900 to-slate-800", border: "border-slate-200 dark:border-white/10", badge: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200" },
  Professional: { accent: "from-violet-700 to-indigo-700", border: "border-violet-300/60 dark:border-violet-400/30", badge: "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300" },
  Enterprise: { accent: "from-amber-600 to-orange-600", border: "border-amber-300/60 dark:border-amber-400/30", badge: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" }
};

export function MagneticPortfolioBuilderServicePage({ service }: { service: CatalogService }) {
  const locale = useLocale();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-white dark:bg-[#06080f]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-[10%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.07),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(124,58,237,0.14),transparent_60%)]" />
        <div className="absolute top-[30%] right-0 h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.05),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(6,182,212,0.10),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-14 sm:px-6 lg:px-8 sm:pt-20">

        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            {service.eyebrow}
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
            Magnetic<br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">Portfolio Builder</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            {service.tagline}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#pricing"
              locale={locale}
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-slate-950 px-7 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(15,23,42,0.18)] transition hover:bg-violet-700 dark:bg-white dark:text-slate-950 dark:hover:bg-violet-100"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/portfolio/preview"
              locale={locale}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
            >
              Preview template
            </Link>
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[26px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_4px_20px_rgba(15,23,42,0.04)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.03]">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-400/10">
                <Icon className="h-5 w-5 text-violet-600 dark:text-violet-300" />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="mt-24 rounded-[34px] border border-slate-200/80 bg-gradient-to-br from-slate-950 to-slate-900 p-10 dark:border-white/[0.06] sm:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-400">Why Magnetic Portfolio Builder</p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Your portfolio, your rules</h2>
          <div className="mt-8 space-y-4">
            {service.benefits.map((b) => (
              <div key={b} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                  <Check className="h-3 w-3 text-violet-300" />
                </span>
                <p className="text-sm leading-6 text-slate-300">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <section id="pricing" className="mt-24 scroll-mt-24">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Simple pricing</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Pick your plan
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {service.tiers.map((tier, i) => {
              const style = TIER_LABELS[tier.name] ?? TIER_LABELS["Starter"]!;
              const featured = tier.name === "Professional";

              return (
                <div
                  key={tier.id}
                  onMouseEnter={() => setHovered(tier.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    "relative flex flex-col rounded-[30px] border p-8 transition-transform duration-200",
                    style.border,
                    featured ? "bg-slate-950 dark:bg-white/[0.05]" : "bg-white dark:bg-white/[0.02]",
                    hovered === tier.id && !featured ? "scale-[1.02]" : "",
                    featured ? "scale-[1.03] shadow-[0_20px_60px_rgba(124,58,237,0.22)]" : "shadow-[0_4px_20px_rgba(15,23,42,0.06)]"
                  )}
                >
                  {featured && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-lg">
                        <Sparkles className="h-3 w-3" /> Most popular
                      </span>
                    </div>
                  )}

                  <div className={cn("mb-2 inline-flex w-max rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]", style.badge)}>
                    {tier.name}
                  </div>

                  <div className="mt-4 flex items-end gap-1.5">
                    <span className={cn("text-5xl font-bold", featured ? "text-white" : "text-slate-950 dark:text-white")}>
                      ${tier.price}
                    </span>
                    <span className={cn("mb-1.5 text-sm", featured ? "text-slate-300" : "text-slate-500 dark:text-slate-400")}>/mo</span>
                  </div>

                  <p className={cn("mt-3 text-sm leading-6", featured ? "text-slate-300" : "text-slate-500 dark:text-slate-400")}>
                    {tier.summary}
                  </p>

                  <ul className="my-8 flex-1 space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check className={cn("mt-0.5 h-4 w-4 shrink-0", featured ? "text-violet-400" : "text-violet-600 dark:text-violet-400")} />
                        <span className={cn("text-sm", featured ? "text-slate-200" : "text-slate-700 dark:text-slate-300")}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/cart?tierId=${tier.id}`}
                    locale={locale}
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition",
                      featured
                        ? "bg-violet-600 text-white hover:bg-violet-500"
                        : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                    )}
                  >
                    Get {tier.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
