import { ArrowRight, Moon, Sparkles, Sun } from "lucide-react";
import Link from "next/link";
import { AuroraTemplate } from "@/components/portfolio/template-aurora";
import { LuminaTemplate } from "@/components/portfolio/template-lumina";
import { PrismTemplate } from "@/components/portfolio/template-prism";
import type { PortfolioSite } from "@/lib/portfolio-db";

const DEMO_SITE: PortfolioSite = {
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
    {
      id: "p1",
      title: "Aurora Dashboard",
      description: "A real-time analytics platform built with Next.js, tRPC and Recharts.",
      tags: ["Next.js", "TypeScript", "Recharts"],
      link: "#",
      imageUrl: ""
    },
    {
      id: "p2",
      title: "Lumina Commerce",
      description: "A full-stack e-commerce engine with multi-currency checkout and inventory sync.",
      tags: ["React", "Node.js", "Stripe"],
      link: "#",
      imageUrl: ""
    }
  ],
  experience: [
    { id: "e1", role: "Senior Engineer", company: "MagneticICT", period: "2022 – Present", description: "Leading frontend architecture and design system adoption across 3 product lines." },
    { id: "e2", role: "Full-Stack Developer", company: "Acme Labs", period: "2019 – 2022", description: "Built and shipped B2B SaaS products serving 15 k+ daily active users." }
  ],
  accentColor: "#6366f1",
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const DEMO_LUMINA: PortfolioSite = {
  ...DEMO_SITE,
  selectedTemplate: "lumina",
  accentColor: "#0ea5e9"
};

const DEMO_PRISM: PortfolioSite = {
  ...DEMO_SITE,
  selectedTemplate: "prism",
  accentColor: "#f59e0b"
};

export default function PortfolioPreviewPage() {
  return (
    <div className="min-h-screen bg-[#06080f]">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#06080f]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Portfolio Builder</p>
            <h1 className="text-lg font-bold text-white">Template Gallery</h1>
          </div>
          <Link
            href="/services/magneticPortfolioBuilder#pricing"
            className="inline-flex h-9 items-center gap-2 rounded-full bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Template 1: Aurora */}
      <section className="border-b border-white/10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                <Moon className="h-3 w-3" /> Dark
              </div>
              <h2 className="text-2xl font-bold text-white">Aurora</h2>
              <p className="mt-1 text-sm text-white/50">Deep dark background with vivid mesh gradients and accent colour system.</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
            <div className="pointer-events-none origin-top scale-[0.6] sm:scale-75" style={{ height: "clamp(520px, 60vw, 900px)" }}>
              <div style={{ transform: "scale(1.67) translateY(0)", transformOrigin: "top left", width: "150%" }} className="sm:hidden">
                <AuroraTemplate site={DEMO_SITE} />
              </div>
              <div className="hidden sm:block" style={{ transform: "scale(1.34) translateY(0)", transformOrigin: "top left", width: "134%" }}>
                <AuroraTemplate site={DEMO_SITE} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Template 2: Lumina */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                <Sun className="h-3 w-3" /> Light
              </div>
              <h2 className="text-2xl font-bold text-white">Lumina</h2>
              <p className="mt-1 text-sm text-white/50">Clean white surface with grid texture, bold typography and card-based sections.</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
            <div className="pointer-events-none origin-top scale-[0.6] sm:scale-75" style={{ height: "clamp(520px, 60vw, 900px)" }}>
              <div style={{ transform: "scale(1.67) translateY(0)", transformOrigin: "top left", width: "150%" }} className="sm:hidden">
                <LuminaTemplate site={DEMO_LUMINA} />
              </div>
              <div className="hidden sm:block" style={{ transform: "scale(1.34) translateY(0)", transformOrigin: "top left", width: "134%" }}>
                <LuminaTemplate site={DEMO_LUMINA} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Template 3: Prism */}
      <section className="border-b border-white/10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                <Sparkles className="h-3 w-3" /> Dark · Editorial
              </div>
              <h2 className="text-2xl font-bold text-white">Prism</h2>
              <p className="mt-1 text-sm text-white/50">Bold split-layout with giant typography, noise texture, and accent-first design language.</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
            <div className="pointer-events-none origin-top scale-[0.6] sm:scale-75" style={{ height: "clamp(520px, 60vw, 900px)" }}>
              <div style={{ transform: "scale(1.67) translateY(0)", transformOrigin: "top left", width: "150%" }} className="sm:hidden">
                <PrismTemplate site={DEMO_PRISM} />
              </div>
              <div className="hidden sm:block" style={{ transform: "scale(1.34) translateY(0)", transformOrigin: "top left", width: "134%" }}>
                <PrismTemplate site={DEMO_PRISM} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-4 py-16 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Ready to launch?</p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Your portfolio, live in minutes</h2>
        <p className="mx-auto mt-4 max-w-md text-base text-white/50">
          Pick a template, upload your logo, and let the Portfolio AI fill in the rest.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/services/magneticPortfolioBuilder#pricing"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-violet-600 px-8 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] transition hover:bg-violet-500"
          >
            Get Portfolio Builder <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
