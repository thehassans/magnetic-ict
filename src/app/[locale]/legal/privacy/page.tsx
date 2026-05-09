import { Eye, Lock, Server, Share2, Shield, UserCheck, Bell, ChevronRight, Clock, Mail } from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { Link } from "@/i18n/navigation";

export const metadata = {
  title: "Privacy Policy — Magnetic ICT",
  description: "Learn how Magnetic ICT collects, uses, and protects your personal information.",
};

const sections = [
  {
    id: "collection",
    icon: Eye,
    accent: "from-indigo-500 to-violet-500",
    title: "Information We Collect",
    content: [
      "We collect information you provide directly to us when creating an account, placing an order, or contacting support. This includes: name, email address, billing address, payment information (processed securely via Stripe), and account preferences.",
      "We automatically collect certain usage data when you interact with our Services: IP addresses, browser type, pages visited, time spent, and technical metadata. This is used solely to improve our Services and ensure security.",
      "For VPS and hosting products, we may collect server resource usage metrics to ensure fair usage and enforce service limits. This data is never sold or shared with third parties for marketing purposes.",
    ]
  },
  {
    id: "use",
    icon: UserCheck,
    accent: "from-emerald-500 to-teal-500",
    title: "How We Use Your Information",
    content: [
      "We use your information to: provision and maintain your services, process payments, send receipts and service notifications, provide customer support, and ensure security and fraud prevention.",
      "With your explicit consent, we may send product updates, offers, and newsletters. You may unsubscribe at any time via the link in any email or through your account dashboard.",
      "We analyze aggregated, anonymized data to improve our products. This analysis never exposes individual user data and is used purely to improve product quality and performance.",
    ]
  },
  {
    id: "storage",
    icon: Server,
    accent: "from-cyan-500 to-sky-500",
    title: "Data Storage & Security",
    content: [
      "All data is stored on encrypted servers with AES-256 encryption at rest and TLS 1.3 in transit. We employ multi-layer security including firewalls, intrusion detection, and 24/7 monitoring.",
      "Payment data is processed exclusively through PCI-DSS compliant providers (Stripe, PayPal). Magnetic ICT never stores raw payment card data on our servers.",
      "We maintain regular encrypted backups. In the unlikely event of a security breach, we will notify affected users within 72 hours in compliance with applicable data protection regulations.",
    ]
  },
  {
    id: "sharing",
    icon: Share2,
    accent: "from-amber-500 to-orange-500",
    title: "Information Sharing",
    content: [
      "We do not sell, trade, or rent your personal information to third parties. We share data only with trusted service providers who assist in operating our platform (e.g., payment processors, cloud providers) under strict data processing agreements.",
      "We may disclose information if required by law, to protect our rights, or to prevent fraud or harm. Any such disclosure will be limited to what is strictly required.",
      "If Magnetic ICT is acquired or merged, your data may transfer to the successor entity, which will be bound by this Privacy Policy.",
    ]
  },
  {
    id: "cookies",
    icon: Shield,
    accent: "from-violet-500 to-fuchsia-500",
    title: "Cookies & Tracking",
    content: [
      "We use essential cookies required for the platform to function (authentication sessions, security tokens). These cannot be disabled without breaking core functionality.",
      "Analytics cookies (first-party, anonymized) help us understand how users interact with our Services. These are optional and can be disabled in your browser settings.",
      "We do not use third-party advertising cookies or tracking pixels. We do not participate in cross-site user tracking for advertising purposes.",
    ]
  },
  {
    id: "rights",
    icon: Lock,
    accent: "from-rose-500 to-pink-500",
    title: "Your Rights & Choices",
    content: [
      "You have the right to: access your personal data, correct inaccuracies, request deletion of your data, object to processing, and receive a portable copy of your data. Submit requests to privacy@magnetic-ict.com.",
      "You may delete your account at any time from the dashboard settings. Upon deletion, your personal data will be removed within 30 days, except where retention is required by law.",
      "Residents of the EU/EEA have additional rights under GDPR, including the right to lodge a complaint with your local data protection authority.",
    ]
  },
  {
    id: "retention",
    icon: Bell,
    accent: "from-slate-600 to-gray-500",
    title: "Data Retention",
    content: [
      "We retain your personal data for as long as your account is active, or as needed to provide services. After account deletion, most personal data is removed within 30 days.",
      "Billing and transaction records are retained for 7 years to comply with financial regulations. Anonymized usage statistics may be retained indefinitely for product improvement.",
      "Server logs containing IP addresses are retained for 90 days for security and debugging purposes, then automatically purged.",
    ]
  },
  {
    id: "contact-privacy",
    icon: Mail,
    accent: "from-indigo-500 to-blue-500",
    title: "Contact & Changes",
    content: [
      "This Privacy Policy may be updated periodically. We will notify you of significant changes via email or a prominent notice on our website. The updated date at the top of this page reflects the most recent revision.",
      "For privacy-related inquiries, data access requests, or to exercise your rights, contact: privacy@magnetic-ict.com. We aim to respond within 5 business days.",
      "Our Data Protection Officer can be reached at dpo@magnetic-ict.com for matters relating to GDPR compliance or data protection concerns.",
    ]
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#06080f]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[20%] -top-[40%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.1),transparent_60%)] blur-3xl" />
          <div className="absolute -right-[10%] top-[10%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08),transparent_60%)] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-900 dark:text-white">Privacy Policy</span>
            </div>
            <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:border-emerald-400/20 dark:from-emerald-500/10 dark:to-teal-500/10 dark:text-emerald-300">
              <Lock className="h-3.5 w-3.5" />
              Privacy First
            </div>
            <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
              Privacy Policy
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500 dark:text-slate-400">
              We believe privacy is a right, not a feature. Here&apos;s exactly what data we collect, why we collect it, and how we keep it safe.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
              <Clock className="h-4 w-4" />
              Last updated: May 8, 2025 · Effective immediately
            </div>
          </ScrollReveal>

          {/* Privacy commitments */}
          <ScrollReveal delay={0.08}>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "No data selling", desc: "We never sell your personal information to advertisers or third parties." },
                { label: "Encrypted at rest", desc: "All your data is encrypted with AES-256 on our servers." },
                { label: "Your data, your rights", desc: "Request access, correction, or deletion of your data anytime." },
              ].map((commitment) => (
                <div key={commitment.label} className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 p-5 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{commitment.label}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-emerald-700 dark:text-emerald-400">{commitment.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Quick nav */}
      <section className="border-b border-slate-200/40 dark:border-white/[0.06] py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="rounded-full border border-slate-200/70 bg-slate-50/80 px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-emerald-400/30 dark:hover:text-emerald-300">
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
          <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 p-10 dark:border-emerald-400/20 dark:from-emerald-500/[0.08] dark:to-teal-500/[0.06] text-center">
            <Shield className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            <h3 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">Questions about your privacy?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Our privacy team responds within 5 business days.</p>
            <a href="mailto:privacy@magnetic-ict.com" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-7 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-xl">
              Contact privacy team <ChevronRight className="h-4 w-4" />
            </a>
            <div className="mt-6">
              <Link href="/legal/terms" className="text-sm text-emerald-600 underline underline-offset-4 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                View Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
