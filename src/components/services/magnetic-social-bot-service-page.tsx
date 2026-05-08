import {
  ArrowRight,
  BadgeDollarSign,
  Bot,
  Brain,
  ChevronRight,
  Globe,
  Headphones,
  Instagram,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  Sparkles,
  Users,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Settings2,
  Bell,
} from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { ServiceTierSelector } from "@/components/services/service-tier-selector";
import type { CatalogService } from "@/lib/service-catalog";

const channels = [
  { name: "WhatsApp", icon: MessageCircle, color: "from-emerald-500 to-green-400", desc: "Auto-reply, broadcasts, order updates & CRM sync over WhatsApp Business API." },
  { name: "Instagram", icon: Instagram, color: "from-pink-500 to-rose-400", desc: "DM automation, story replies, comment triggers and lead capture flows." },
  { name: "Messenger", icon: MessageSquare, color: "from-blue-500 to-indigo-400", desc: "Facebook Messenger bots with keyword routing and handoff to live agents." },
] as const;

const automationFeatures = [
  { title: "AI Auto-Reply", icon: Brain, accent: "from-violet-500 to-purple-400", items: ["GPT-powered responses", "Context memory", "Tone matching", "Fallback escalation"] },
  { title: "Broadcast Campaigns", icon: Bell, accent: "from-amber-500 to-orange-400", items: ["Segment by tag/status", "Schedule delivery", "Click tracking", "Unsubscribe management"] },
  { title: "Lead Capture", icon: TrendingUp, accent: "from-cyan-500 to-sky-400", items: ["Custom intake flows", "CRM integration", "Auto-tagging", "Conversion tracking"] },
  { title: "Order Notifications", icon: CheckCircle2, accent: "from-emerald-500 to-teal-400", items: ["Status updates", "Delivery alerts", "Payment confirmations", "Return flows"] },
  { title: "Live Handoff", icon: Headphones, accent: "from-rose-500 to-pink-400", items: ["Agent queue routing", "Ticket creation", "Chat history", "Availability scheduling"] },
  { title: "Analytics Dashboard", icon: LayoutDashboard, accent: "from-indigo-500 to-blue-400", items: ["Message open rates", "Bot performance", "Response times", "Engagement trends"] },
  { title: "Workflow Builder", icon: Settings2, accent: "from-fuchsia-500 to-violet-400", items: ["Visual flow editor", "Condition branches", "Delay steps", "API webhooks"] },
  { title: "24/7 Uptime", icon: Clock, accent: "from-slate-500 to-gray-400", items: ["99.9% SLA", "Auto-restart", "Health monitoring", "Incident alerts"] },
] as const;

const quickStats = [
  { label: "Channels", value: "3", icon: Globe },
  { label: "Response time", value: "< 1 second", icon: Zap },
  { label: "Automation", value: "AI-powered", icon: Brain },
  { label: "Uptime SLA", value: "99.9%", icon: ShieldCheck },
] as const;

const heroHighlights = [
  "WhatsApp · Instagram · Messenger",
  "AI auto-reply engine",
  "Broadcast campaigns",
  "Live agent handoff",
] as const;

export function MagneticSocialBotServicePage({ service, title }: { service: CatalogService; title: string }) {
  return (
    <main className="bg-white dark:bg-[#06080f]">
      {/* ──── HERO ──── */}
      <section className="relative overflow-hidden border-b border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[20%] -top-[40%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(16,185,129,0.2),transparent_60%)]" />
          <div className="absolute -right-[10%] top-[10%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.1),transparent_60%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(168,85,247,0.16),transparent_60%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            {/* Left hero */}
            <ScrollReveal>
              <div className="space-y-8 rounded-3xl border border-slate-200/60 bg-white/80 p-8 shadow-[0_8px_60px_rgba(16,185,129,0.06)] ring-1 ring-white/60 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-[0_8px_60px_rgba(16,185,129,0.12)] dark:ring-white/[0.04] sm:p-10">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:border-emerald-400/20 dark:from-emerald-500/10 dark:to-teal-500/10 dark:text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  {service.eyebrow}
                </div>
                <div className="space-y-5">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">{title}</h1>
                  <p className="max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg sm:leading-8">
                    One AI-powered bot across WhatsApp, Instagram, and Messenger. Automate replies, run broadcasts, capture leads, and hand off to live agents — all from a single dashboard.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {heroHighlights.map((h) => (
                    <div key={h} className="rounded-full border border-slate-200/70 bg-slate-50/80 px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-emerald-400/30 dark:hover:text-emerald-300">{h}</div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="#socialbot-pricing" className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-7 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30">
                    View packages <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a href="#socialbot-channels" className="inline-flex h-12 items-center rounded-full border border-slate-300/80 bg-white px-7 text-sm font-semibold text-slate-700 transition-all hover:border-emerald-300 hover:text-emerald-600 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:hover:border-emerald-400/30 dark:hover:text-emerald-300">See channels</a>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="group rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white p-4 transition hover:border-emerald-200/60 hover:shadow-md dark:border-white/[0.06] dark:from-white/[0.03] dark:to-white/[0.01] dark:hover:border-emerald-400/20">
                      <div className="flex items-center gap-2">
                        <stat.icon className="h-3.5 w-3.5 text-emerald-500/60 dark:text-emerald-400/50" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{stat.label}</span>
                      </div>
                      <div className="mt-2.5 text-sm font-semibold text-slate-900 dark:text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Right — channel cards */}
            <ScrollReveal delay={0.1}>
              <div className="space-y-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-[0_8px_60px_rgba(16,185,129,0.06)] ring-1 ring-white/60 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Connected channels</p>
                {channels.map((ch) => (
                  <div key={ch.name} className="group rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-5 transition hover:border-emerald-200/50 hover:shadow-lg dark:border-white/[0.06] dark:from-white/[0.04] dark:to-white/[0.01] dark:hover:border-emerald-400/20">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${ch.color} text-white shadow-lg shadow-black/10`}>
                        <ch.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-950 dark:text-white">{ch.name}</div>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{ch.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Bot live indicator */}
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Bot is live &amp; responding</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ──── CHANNELS ──── */}
      <section id="socialbot-channels" className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                <Bot className="h-4 w-4" /> Automation Modules
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Everything your bot needs to run your business.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                8 fully integrated automation modules — from AI replies to campaign management to live agent routing.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {automationFeatures.map((mod, index) => (
              <ScrollReveal key={mod.title} delay={index * 0.04}>
                <div className="group h-full rounded-2xl border border-slate-200/60 bg-white p-5 transition-all hover:border-transparent hover:shadow-xl dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${mod.accent} text-white shadow-sm`}>
                      <mod.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-950 dark:text-white">{mod.title}</h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {mod.items.map((item) => (
                      <span key={item} className="rounded-full border border-slate-200/70 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">{item}</span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── HOW IT WORKS ──── */}
      <section className="relative border-y border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/40 dark:from-white/[0.02] dark:via-transparent dark:to-white/[0.01]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                <Zap className="h-4 w-4" /> How it works
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Message received. Answered in under a second.
              </h2>
              <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                Your bot listens 24/7. When a message arrives it routes through your automation rules, AI engine, or live agent queue — and sends a response before your customer even blinks.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { step: "01", title: "Message arrives", desc: "Customer sends a message on WhatsApp, Instagram, or Messenger.", color: "border-emerald-200/60 dark:border-emerald-400/20" },
              { step: "02", title: "AI routing", desc: "The engine matches intent, applies rules, and selects the best response path.", color: "border-teal-200/60 dark:border-teal-400/20" },
              { step: "03", title: "Instant reply", desc: "AI or template reply is sent in under 1 second with full context.", color: "border-cyan-200/60 dark:border-cyan-400/20" },
              { step: "04", title: "Escalate if needed", desc: "Complex queries route to a live agent with full chat history attached.", color: "border-sky-200/60 dark:border-sky-400/20" },
            ].map((step, i) => (
              <ScrollReveal key={step.step} delay={i * 0.07}>
                <div className={`group h-full rounded-2xl border ${step.color} bg-white p-6 dark:bg-white/[0.03]`}>
                  <div className="text-4xl font-black text-slate-100 dark:text-white/[0.06]">{step.step}</div>
                  <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── PRICING ──── */}
      <section id="socialbot-pricing" className="relative border-t border-slate-200/40 py-20 dark:border-white/[0.06] sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white dark:from-white/[0.02] dark:to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                <BadgeDollarSign className="h-4 w-4" /> Packages
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
                Choose your automation plan.
              </h2>
              <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
                Start with core WhatsApp automation, then scale into full multi-channel AI with live agent support and enterprise integrations.
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-12">
            <ServiceTierSelector service={service} />
          </div>
        </div>
      </section>
    </main>
  );
}
