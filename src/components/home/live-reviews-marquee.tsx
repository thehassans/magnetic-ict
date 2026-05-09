"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { TestimonialsSection } from "@/components/ui/simple-animated-testimonials";
import { developerTestimonials } from "@/lib/developer-testimonials";

/* ─── Review Data ─── */
const ROW_A = [
  { name: "Emily Chen",      role: "eCommerce Owner",    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", comment: "Migrated from another host and the difference is night and day. Absolutely incredible." },
  { name: "Michael Brown",   role: "Startup Founder",    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face", comment: "The cloud servers are blazing fast. Perfect for our growing business needs." },
  { name: "Fatima Rahman",   role: "Blogger",            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face", comment: "Simple setup and great performance. My blog loads instantly. Love it!" },
  { name: "James Wilson",    role: "Agency Director",    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face", comment: "We host 50+ client sites here. Never had any issues. Premium quality service." },
  { name: "Sophie Anderson", role: "Marketing Manager",  avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=face", comment: "Incredible speed and reliability. Our campaigns run smoothly every time." },
  { name: "Lisa Wang",       role: "Product Manager",    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face", comment: "Seamless integration with our workflow. Highly recommended to everyone!" },
  { name: "Alex Johnson",    role: "CTO",                avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face", comment: "Enterprise-grade security and performance. Best investment we have made." },
  { name: "Priya Sharma",    role: "SaaS Founder",       avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face", comment: "Onboarding was smooth and the support team is exceptional. 10 out of 10." },
  { name: "Omar Farooq",     role: "Dev Lead",           avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face", comment: "The uptime is stellar. Our SLA has never been breached since switching." },
  { name: "Nora Khalid",     role: "Freelancer",         avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=face", comment: "Affordable pricing for the level of quality they deliver. Outstanding." },
];

const ROW_B = [
  { name: "David Lee",       role: "Full Stack Dev",     avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face", comment: "API documentation is superb. Had my integration running in under an hour." },
  { name: "Ayesha Malik",    role: "E-Commerce Head",    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face", comment: "Our Ramadan campaign handled record traffic without a single hiccup." },
  { name: "Tom Parker",      role: "Startup CEO",        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face", comment: "Switched three businesses over. Every single one performs better now." },
  { name: "Yasmin Hassan",   role: "Content Creator",    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face", comment: "My audience has grown 3x since my site started loading this fast." },
  { name: "Ravi Kumar",      role: "Backend Engineer",   avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face", comment: "Server response times are consistently under 50ms. Phenomenal." },
  { name: "Clara Müller",    role: "Project Manager",    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face", comment: "The dashboard gives full visibility into everything. Great UX." },
  { name: "Bilal Ahmed",     role: "Dropshipper",        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face", comment: "Magnetic Commerce doubled my conversion rate. I can't believe the difference." },
  { name: "Sara Iqbal",      role: "Brand Manager",      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face", comment: "Our brand identity is perfectly reflected across every channel. Superb." },
  { name: "Chen Wei",        role: "Data Analyst",       avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face", comment: "The analytics suite is powerful. Real-time insights changed how we operate." },
  { name: "Liam O'Brien",    role: "Podcast Host",       avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face", comment: "My media site handles thousands of concurrent listeners without breaking a sweat." },
];

/* ─── Single review card ─── */
function ReviewCard({ name, role, avatar, comment }: { name: string; role: string; avatar: string; comment: string }) {
  return (
    <div className="mx-3 w-[300px] shrink-0 rounded-[20px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      {/* Comment */}
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 line-clamp-3">{comment}</p>
      {/* Author */}
      <div className="mt-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt={name} className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-white/10" />
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{name}</p>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Marquee row ─── */
function MarqueeRow({ items, reverse = false }: { items: typeof ROW_A; reverse?: boolean }) {
  const doubled = [...items, ...items, ...items];
  return (
    <div className="relative overflow-hidden">
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-slate-50 to-transparent dark:from-[#020617]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-slate-50 to-transparent dark:from-[#020617]" />
      <div
        className="flex py-3"
        style={{
          animation: reverse
            ? "marquee-reverse 55s linear infinite"
            : "marquee 50s linear infinite",
        }}
      >
        {doubled.map((item, i) => (
          <ReviewCard key={i} {...item} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export function LiveReviewsMarquee() {
  const t = useTranslations("Landing");
  const tTestimonials = useTranslations("Testimonials");
  const tReviews = useTranslations("Reviews");

  const translatedRowA = ROW_A.map((item, i) => ({
    ...item,
    comment: tReviews(`rowA.${i}`) || item.comment,
    role: tReviews(`rolesA.${i}`) || item.role
  }));

  const translatedRowB = ROW_B.map((item, i) => ({
    ...item,
    comment: tReviews(`rowB.${i}`) || item.comment,
    role: tReviews(`rolesB.${i}`) || item.role
  }));
  return (
    <section id="home-reviews" className="py-10 sm:py-16">
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes marquee-reverse {
          0%   { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <ScrollReveal>
        <div className="rounded-[2.5rem] border border-slate-200/70 bg-slate-50 py-12 dark:border-white/10 dark:bg-slate-950 overflow-hidden">

          {/* ── Header ── */}
          <div className="px-6 sm:px-10">
            <div className="mx-auto max-w-3xl text-center">
              {/* Google badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285F4] shadow-sm dark:bg-white/95">G</span>
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">5,000+ Verified Reviews</span>
                </div>
              </div>

              <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                Loved by{" "}
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
                  50,000+
                </span>{" "}
                Customers
              </h2>
              <p className="mt-4 text-base text-slate-500 dark:text-slate-400">
                Businesses, creators, and developers across the globe trust Magnetic ICT every day.
              </p>

              {/* Stats row */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-10">
                {[
                  { value: "5,218", label: "Total Reviews" },
                  { value: "4.9★", label: "Average Rating" },
                  { value: "99.9%", label: "Uptime SLA" },
                  { value: "50K+", label: "Active Customers" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{value}</div>
                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 1: right → left ── */}
          <div className="mt-12">
            <MarqueeRow items={translatedRowA} reverse={false} />
          </div>

          {/* ── Row 2: left → right ── */}
          <div className="mt-4">
            <MarqueeRow items={translatedRowB} reverse={true} />
          </div>

          {/* ── CTA ── */}
          <div className="mt-10 flex justify-center px-6">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(99,102,241,0.35)] transition hover:shadow-[0_12px_40px_rgba(99,102,241,0.45)] hover:-translate-y-0.5"
            >
              {t("viewAllReviews")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>

        </div>
      </ScrollReveal>

      {/* ── Loved by Developers ── */}
      <TestimonialsSection
        title={t("lovedByDevelopers")}
        subtitle={t("lovedByDevelopersDesc")}
        testimonials={developerTestimonials.map((testimonial, i) => ({
          ...testimonial,
          content: tTestimonials(`dev${i}`) || testimonial.content
        }))}
      />

    </section>
  );
}
