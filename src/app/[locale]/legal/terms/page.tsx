import { FileText, ShieldCheck, Scale, Gavel, AlertTriangle, Globe, Mail, Clock, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Magnetic ICT",
  description: "Read the complete Terms of Service for Magnetic ICT's platform, services, and products.",
};

const sections = [
  {
    id: "acceptance",
    icon: Scale,
    accent: "from-indigo-500 to-violet-500",
    title: "Acceptance of Terms",
    content: [
      "By accessing or using any Magnetic ICT service, platform, product, or website (collectively, the \"Services\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our Services.",
      "These Terms constitute a legally binding agreement between you and Magnetic ICT. We reserve the right to modify these Terms at any time. Continued use of the Services after changes constitute acceptance of the revised Terms.",
    ]
  },
  {
    id: "services",
    icon: Globe,
    accent: "from-cyan-500 to-sky-500",
    title: "Description of Services",
    content: [
      "Magnetic ICT provides a suite of digital infrastructure services including but not limited to: managed VPS hosting, e-commerce platform deployment, social automation tools, AI-powered services, domain management, and related technology products.",
      "All Services are provided on an \"as-is\" and \"as-available\" basis. We continuously invest in improving our infrastructure and may update, modify, or discontinue services with reasonable notice.",
      "Access to certain premium features or plans requires a paid subscription. Pricing, features, and availability are detailed on the respective service pages.",
    ]
  },
  {
    id: "account",
    icon: ShieldCheck,
    accent: "from-emerald-500 to-teal-500",
    title: "Account Responsibilities",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use at support@magnetic-ict.com.",
      "You agree to provide accurate, current, and complete information during registration and to update this information as necessary. Accounts with false information may be terminated without prior notice.",
      "One person may not maintain more than one active account unless expressly permitted. Account sharing or transferring access to third parties without authorization is prohibited.",
    ]
  },
  {
    id: "payments",
    icon: FileText,
    accent: "from-amber-500 to-orange-500",
    title: "Payments & Refunds",
    content: [
      "All fees are payable in advance and are non-refundable except as expressly stated in our 45-day money-back guarantee policy. Prices are listed in USD and may be subject to applicable taxes.",
      "Magnetic ICT offers a 45-day full refund policy for first-time purchases of any service plan. Refund requests must be submitted within 45 days of the original purchase date.",
      "Subscriptions renew automatically at the end of each billing period unless cancelled. You may cancel your subscription at any time from your dashboard, and access will remain until the end of the current paid period.",
    ]
  },
  {
    id: "prohibited",
    icon: AlertTriangle,
    accent: "from-rose-500 to-pink-500",
    title: "Prohibited Uses",
    content: [
      "You may not use our Services for: spam, phishing, malware distribution, illegal content, cryptocurrency mining, DDoS attacks, scrapers or automated bots without permission, or any activity that violates applicable law.",
      "Any use that consumes excessive server resources, impacts other customers' performance, or circumvents technical limitations without authorization is prohibited and may result in immediate suspension.",
      "Reselling or white-labeling our Services without a valid partner agreement is strictly prohibited. Contact us at partnerships@magnetic-ict.com to explore partner programs.",
    ]
  },
  {
    id: "ip",
    icon: Gavel,
    accent: "from-violet-500 to-fuchsia-500",
    title: "Intellectual Property",
    content: [
      "All content, software, designs, trademarks, and intellectual property associated with Magnetic ICT Services are the exclusive property of Magnetic ICT and its licensors.",
      "Your data and content remain yours. You grant Magnetic ICT a limited license to store, process, and display your content solely to provide the Services. We do not claim ownership over your data.",
      "You may not copy, modify, reverse-engineer, or create derivative works based on our platform or software without explicit written permission.",
    ]
  },
  {
    id: "liability",
    icon: Scale,
    accent: "from-slate-600 to-gray-500",
    title: "Limitation of Liability",
    content: [
      "To the maximum extent permitted by applicable law, Magnetic ICT shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits or data.",
      "Our total aggregate liability for any claim arising out of or relating to these Terms or the Services shall not exceed the total amount paid by you to Magnetic ICT in the 12 months preceding the claim.",
      "We maintain robust backup and monitoring systems, but do not guarantee uninterrupted or error-free service. Our target SLA is 99.9% uptime, detailed in individual service agreements.",
    ]
  },
  {
    id: "contact",
    icon: Mail,
    accent: "from-indigo-500 to-blue-500",
    title: "Contact & Governing Law",
    content: [
      "These Terms are governed by the laws of the jurisdiction in which Magnetic ICT is registered, without regard to conflict of law principles.",
      "For any questions regarding these Terms, please contact: legal@magnetic-ict.com. We aim to respond to all legal inquiries within 5 business days.",
      "Disputes arising from these Terms shall first be attempted to be resolved through good-faith negotiation. Failing that, disputes shall be submitted to binding arbitration.",
    ]
  },
] as const;

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#06080f]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[20%] -top-[40%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12),transparent_60%)] blur-3xl" />
          <div className="absolute -right-[10%] top-[10%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1),transparent_60%)] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-900 dark:text-white">Terms of Service</span>
            </div>
            <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-700 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-violet-500/10 dark:text-indigo-300">
              <Scale className="h-3.5 w-3.5" />
              Legal Agreement
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500 dark:text-slate-400">
              Please read these terms carefully before using any Magnetic ICT service. By using our platform you agree to these terms.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
              <Clock className="h-4 w-4" />
              Last updated: May 8, 2025 · Effective immediately
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Quick nav */}
      <section className="border-b border-slate-200/40 dark:border-white/[0.06] py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="rounded-full border border-slate-200/70 bg-slate-50/80 px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-indigo-400/30 dark:hover:text-indigo-300">
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          {sections.map((section, index) => (
            <ScrollReveal key={section.id} delay={index * 0.03}>
              <div id={section.id} className="group rounded-3xl border border-slate-200/60 bg-white p-8 transition hover:shadow-lg dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:bg-white/[0.03] sm:p-10">
                <div className="flex items-start gap-5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${section.accent} text-white shadow-lg`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold text-slate-950 dark:text-white">{section.title}</h2>
                      <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-300 dark:text-slate-600">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="mt-5 space-y-4">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-[15px] leading-7 text-slate-600 dark:text-slate-400">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-slate-200/40 dark:border-white/[0.06] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-violet-50 p-10 dark:border-indigo-400/20 dark:from-indigo-500/[0.08] dark:to-violet-500/[0.06] text-center">
            <Mail className="mx-auto h-10 w-10 text-indigo-600 dark:text-indigo-400" />
            <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">Questions about these terms?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Our legal team is happy to clarify anything.</p>
            <a href="mailto:legal@magnetic-ict.com" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl">
              Contact legal team <ChevronRight className="h-4 w-4" />
            </a>
            <div className="mt-6">
              <Link href="/legal/privacy" className="text-sm text-indigo-600 underline underline-offset-4 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                View Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
