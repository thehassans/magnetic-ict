import { notFound } from "next/navigation";
import { AuroraTemplate } from "@/components/portfolio/template-aurora";
import { LuminaTemplate } from "@/components/portfolio/template-lumina";
import { PrismTemplate } from "@/components/portfolio/template-prism";
import type { PortfolioSite } from "@/lib/portfolio-db";

const DEMO_SITE: PortfolioSite = {
  _id: "demo",
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
    { id: "p1", title: "Aurora Dashboard", description: "A real-time analytics platform built with Next.js, tRPC and Recharts.", tags: ["Next.js", "TypeScript", "Recharts"], link: "#", imageUrl: "" },
    { id: "p2", title: "Lumina Commerce", description: "A full-stack e-commerce engine with multi-currency checkout and inventory sync.", tags: ["React", "Node.js", "Stripe"], link: "#", imageUrl: "" }
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

const templateConfig: Record<string, { accent: string; Component: React.ComponentType<{ site: PortfolioSite }> }> = {
  aurora: { accent: "#6366f1", Component: AuroraTemplate },
  lumina: { accent: "#0ea5e9", Component: LuminaTemplate },
  prism:  { accent: "#f59e0b", Component: PrismTemplate }
};

export default async function TemplateDemoPage({
  params
}: {
  params: Promise<{ template: string }>;
}) {
  const { template } = await params;
  const config = templateConfig[template];
  if (!config) notFound();

  const { accent, Component } = config;
  const site: PortfolioSite = { ...DEMO_SITE, selectedTemplate: template, accentColor: accent };

  return <Component site={site} />;
}

export function generateStaticParams() {
  return [{ template: "aurora" }, { template: "lumina" }, { template: "prism" }];
}
