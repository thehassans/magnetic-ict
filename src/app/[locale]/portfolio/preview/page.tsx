import { ArrowRight, ExternalLink, Monitor, Moon, Smartphone, Sparkles, Sun } from "lucide-react";
import Link from "next/link";
import React from "react";
import { AuroraTemplate } from "@/components/portfolio/template-aurora";
import { LuminaTemplate } from "@/components/portfolio/template-lumina";
import { PrismTemplate } from "@/components/portfolio/template-prism";
import type { PortfolioSite } from "@/lib/portfolio-db";

const DEMO: PortfolioSite = {
  _id: "preview",
  userId: "demo",
  planTier: "professional",
  name: "Alex Karim",
  tagline: "Full-Stack Engineer & Product Designer",
  about:
    "I build high-performance web applications and intuitive digital products. With 6+ years across startups and agencies I specialise in turning ideas into polished, shipped software.",
  phone: "+880 17XX XXXXXX",
  email: "alex@example.com",
  address: "Dhaka, Bangladesh",
  logoLight: "",
  logoDark: "",
  socialLinks: [
    { platform: "GitHub", url: "#" },
    { platform: "LinkedIn", url: "#" }
  ],
  customDomain: "",
  subdomain: "alex",
  selectedTemplate: "aurora",
  skills: ["React", "Next.js", "TypeScript", "Node.js", "Figma", "Tailwind CSS", "PostgreSQL", "Docker"],
  projects: [
    { id: "p1", title: "Aurora Dashboard", description: "A real-time analytics platform built with Next.js, tRPC and Recharts.", tags: ["Next.js", "TypeScript"], link: "#", imageUrl: "" },
    { id: "p2", title: "Lumina Commerce", description: "A full-stack e-commerce engine with multi-currency checkout.", tags: ["React", "Stripe"], link: "#", imageUrl: "" }
  ],
  experience: [
    { id: "e1", role: "Senior Engineer", company: "MagneticICT", period: "2022 – Present", description: "Leading frontend architecture across 3 product lines." },
    { id: "e2", role: "Full-Stack Developer", company: "Acme Labs", period: "2019 – 2022", description: "Built B2B SaaS products serving 15k daily users." }
  ],
  accentColor: "#6366f1",
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const TEMPLATES = [
  {
    id: "aurora",
    name: "Aurora",
    badge: "Dark",
    badgeIcon: Moon,
    accentColor: "#6366f1",
    description: "Deep dark background with vivid mesh gradients, accent-colour system, and smooth section transitions.",
    features: ["Dark mode first", "Mesh gradients", "Smooth scroll"],
    site: { ...DEMO, selectedTemplate: "aurora", accentColor: "#6366f1" }
  },
  {
    id: "lumina",
    name: "Lumina",
    badge: "Light",
    badgeIcon: Sun,
    accentColor: "#0ea5e9",
    description: "Clean white surface with subtle grid texture, card-based sections, and bold typography for a professional look.",
    features: ["Light mode first", "Card layout", "Grid texture"],
    site: { ...DEMO, selectedTemplate: "lumina", accentColor: "#0ea5e9" }
  },
  {
    id: "prism",
    name: "Prism",
    badge: "Editorial",
    badgeIcon: Sparkles,
    accentColor: "#f59e0b",
    description: "Bold split-layout with giant oversized typography, noise texture, and an accent-first editorial design language.",
    features: ["Editorial layout", "Giant type", "Accent-first"],
    site: { ...DEMO, selectedTemplate: "prism", accentColor: "#f59e0b" }
  }
] as const;

type TemplateEntry = typeof TEMPLATES[number];

function BrowserFrame({ children, url }: { children: React.ReactNode; url: string }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-slate-50 shadow-[0_16px_48px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#111318] dark:shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
      {/* Chrome bar */}
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5 dark:border-white/[0.07] dark:bg-[#0d1017]">
        <div className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-white/20" />
          <span className="truncate text-[11px] text-slate-400 dark:text-white/25">{url}</span>
        </div>
      </div>
      {/* Content — desktop width ~1280px scaled to fill frame */}
      <div className="relative overflow-hidden" style={{ height: 420 }}>
        <div className="pointer-events-none" style={{ transform: "scale(0.47)", transformOrigin: "top left", width: "213%" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  // Phone inner content area: 158px wide
  // We want to render the template at 390px (mobile viewport)
  // Scale = 158 / 390 = 0.405 — template sees a 390px wide container
  const MOBILE_W = 390;
  const FRAME_INNER_W = 158;
  const scale = FRAME_INNER_W / MOBILE_W;

  return (
    <div className="relative mx-auto shrink-0" style={{ width: 168 }}>
      <div
        className="relative overflow-hidden rounded-[36px] border-[5px] border-slate-300 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.15)] dark:border-white/[0.12] dark:bg-[#0d1017] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        style={{ height: 358 }}
      >
        {/* Dynamic island */}
        <div className="relative z-10 flex justify-center pt-2.5">
          <div className="h-3.5 w-14 rounded-full bg-black" />
        </div>
        {/* Screen — force 390px mobile width then scale down */}
        <div className="overflow-hidden" style={{ height: 330 }}>
          <div
            className="pointer-events-none"
            style={{
              width: MOBILE_W,
              transform: `scale(${scale})`,
              transformOrigin: "top left"
            }}
          >
            {children}
          </div>
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <div className="h-1 w-12 rounded-full bg-slate-200 dark:bg-white/20" />
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ t, index }: { t: TemplateEntry; index: number }) {
  const BadgeIcon = t.badgeIcon;
  const TemplateComponent =
    t.id === "aurora" ? AuroraTemplate :
    t.id === "lumina" ? LuminaTemplate :
    PrismTemplate;

  return (
    <section id={t.id} className="scroll-mt-24 border-b border-slate-100 px-4 py-16 dark:border-white/[0.06] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header row */}
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-300 dark:text-white/30">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white/50">
                <BadgeIcon className="h-3 w-3" />
                {t.badge}
              </span>
            </div>
            <h2 className="text-[2.5rem] font-black tracking-tight text-slate-900 dark:text-white">{t.name}</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500 dark:text-white/40">{t.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.features.map((f) => (
                <span key={f} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white/35">
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/portfolio/demo/${t.id}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white/80 dark:hover:border-white/20 dark:hover:bg-white/[0.1] dark:hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visit template
            </Link>
            <Link
              href="/services/magneticPortfolioBuilder#pricing"
              className="inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: t.accentColor }}
            >
              Use this <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Preview grid: desktop + mobile */}
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_200px]">

          {/* Desktop browser preview */}
          <div>
            <div className="mb-2.5 flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-white/30">
              <Monitor className="h-3.5 w-3.5" />
              Desktop
            </div>
            <BrowserFrame url={`${t.site.subdomain}.magnetic-ict.com`}>
              <TemplateComponent site={t.site as PortfolioSite} />
            </BrowserFrame>
          </div>

          {/* Mobile phone preview */}
          <div>
            <div className="mb-2.5 flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-white/30">
              <Smartphone className="h-3.5 w-3.5" />
              Mobile
            </div>
            <PhoneFrame>
              <TemplateComponent site={t.site as PortfolioSite} />
            </PhoneFrame>
          </div>

        </div>
      </div>
    </section>
  );
}

export default function PortfolioPreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  void params;

  return (
    <div className="min-h-screen bg-white dark:bg-[#06080f]">

      {/* Ambient glow — dark mode only */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden dark:block hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-[140px]"
          style={{ background: "radial-gradient(ellipse, #6366f130, transparent 60%)" }} />
      </div>

      {/* Sticky header */}
      <div className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#06080f]/90 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/services/magneticPortfolioBuilder"
              className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 transition hover:text-slate-700 dark:text-white/30 dark:hover:text-white/60">
              ← Portfolio Builder
            </Link>
            <span className="h-4 w-px bg-slate-200 dark:bg-white/[0.07]" />
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">Template Gallery</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1 sm:flex">
              {TEMPLATES.map((t) => (
                <a key={t.id} href={`#${t.id}`}
                  className="inline-flex h-8 items-center rounded-full border border-slate-200 px-3.5 text-[12px] font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-800 dark:border-white/[0.07] dark:text-white/40 dark:hover:border-white/15 dark:hover:text-white/70">
                  {t.name}
                </a>
              ))}
            </div>
            <Link
              href="/services/magneticPortfolioBuilder#pricing"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative px-4 pb-4 pt-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400 dark:text-white/30">3 templates included</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Template{" "}
            <span className="bg-gradient-to-r from-violet-500 to-sky-500 bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-500 dark:text-white/40">
            Every template is fully editable via the Portfolio AI. Upload your logo, adjust colours, and go live.
          </p>
        </div>
      </div>

      {/* Templates */}
      {TEMPLATES.map((t, i) => (
        <TemplateCard key={t.id} t={t} index={i} />
      ))}

      {/* CTA */}
      <section className="border-t border-slate-100 px-4 py-20 text-center dark:border-white/[0.06] sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400 dark:text-white/30">Ready?</p>
        <h2 className="mt-4 text-4xl font-black text-slate-900 dark:text-white sm:text-5xl">
          Your portfolio,{" "}
          <span className="bg-gradient-to-r from-violet-500 to-sky-500 bg-clip-text text-transparent">live today</span>
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-base text-slate-500 dark:text-white/40">
          Pick a template, upload your logo, and let the Portfolio AI do the rest.
        </p>
        <div className="mt-8">
          <Link
            href="/services/magneticPortfolioBuilder#pricing"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-sky-600 px-8 text-sm font-bold text-white shadow-[0_4px_24px_rgba(124,58,237,0.25)] transition hover:opacity-90"
          >
            Start with Portfolio Builder <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
