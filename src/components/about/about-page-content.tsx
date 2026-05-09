"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, Globe, Lightbulb, Shield, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";
import type { AboutSettings } from "@/lib/platform-settings";

type AboutPageContentProps = {
  about: AboutSettings;
};

const valueIconMap = [Zap, Shield, Sparkles, Globe, Lightbulb, Building2];

export function AboutPageContent({ about }: AboutPageContentProps) {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.10),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.10),transparent_40%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.18),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.14),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-20 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
              <Sparkles className="h-3 w-3" />
              {about.eyebrow}
            </div>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              {about.headline}
            </h1>
          </motion.div>
        </section>

        {/* Sister company card */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-10 shadow-[0_40px_100px_rgba(124,58,237,0.22)] sm:p-14">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.28),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.18),transparent_40%)]" />
            <div className="relative z-10 grid gap-10 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
                  <Building2 className="h-3 w-3" />
                  Sister company
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {about.parentCompany}
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
                  {about.parentCompanyDescription}
                </p>
              </div>
              <div className="flex shrink-0 items-start justify-end md:pt-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Globe className="h-7 w-7 text-cyan-300" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Two-column: mission + founder note */}
        <section className="mb-16 grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Our mission</h3>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{about.missionStatement}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-300">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">A founder&apos;s note</h3>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{about.founderNote}</p>
          </motion.div>
        </section>

        {/* Leadership */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-700 dark:text-violet-300">Leadership</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">The team behind Magnetic</h2>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { title: "Founder & CEO", detail: "Visionary leadership and strategic direction. Responsible for product, growth, and the long-term infrastructure roadmap.", icon: Star },
              { title: "CTO", detail: "Technical architecture, engineering delivery, and AI systems. Oversees all platform, security, and cloud infrastructure decisions.", icon: Zap }
            ].map(({ title, detail, icon: Icon }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 + index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 dark:from-violet-400/20 dark:to-indigo-400/10 dark:text-violet-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{detail}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values grid */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="mb-10 text-center"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300">Core principles</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">What drives us</h2>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.map((value, index) => {
              const Icon = valueIconMap[index % valueIconMap.length];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36 + index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:border-violet-200 hover:shadow-[0_16px_48px_rgba(124,58,237,0.10)] dark:border-white/10 dark:bg-slate-950/70 dark:hover:border-cyan-400/20"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100 dark:bg-violet-400/10 dark:text-violet-300 dark:group-hover:bg-violet-400/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">{value.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <div className="relative inline-block rounded-[40px] bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-px shadow-[0_24px_64px_rgba(124,58,237,0.26)]">
            <div className="rounded-[39px] bg-gradient-to-br from-slate-950 to-slate-900 px-12 py-12">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Ready to work together?</div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Partner with Magnetic ICT</h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
                Explore our full suite of digital tools, or reach out to talk about building something exceptional together.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/services"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-violet-50"
                >
                  Explore services
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/support"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  Talk to support
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </main>
  );
}
