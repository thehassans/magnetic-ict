"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { InfiniteMarquee } from "@/components/home/infinite-marquee";
import { ScrollReveal } from "@/components/home/scroll-reveal";

const partners = [
  { name: "Stripe", Logo: StripeLogo },
  { name: "Apple", Logo: AppleLogo },
  { name: "Visa", Logo: VisaLogo },
  { name: "AWS", Logo: AwsLogo },
  { name: "Google", Logo: GoogleLogo },
  { name: "PayPal", Logo: PayPalLogo },
  { name: "Mastercard", Logo: MastercardLogo },
  { name: "Cloudflare", Logo: CloudflareLogo }
] as const;

export function TrustedPartnersMarquee() {
  const t = useTranslations("Landing");

  return (
    <section className="space-y-6 py-4 sm:py-8">
      <ScrollReveal className="space-y-3 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-700 dark:text-cyan-300">{t("partnersEyebrow")}</div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          {t("partnersTitle")}
        </h2>
      </ScrollReveal>

      <InfiniteMarquee
        duration={22}
        className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        itemClassName="shrink-0"
        items={partners.map(({ name, Logo }) => (
          <motion.div
            key={name}
            whileHover={{ y: -4 }}
            className="flex h-20 w-[13.5rem] items-center justify-center rounded-[24px] border border-slate-200/90 bg-white/95 px-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition hover:border-cyan-200 hover:bg-cyan-50/60 dark:border-white/10 dark:bg-slate-950/70 dark:hover:border-cyan-400/20 dark:hover:bg-white/5"
          >
            <Logo />
          </motion.div>
        ))}
      />
    </section>
  );
}

function StripeLogo() {
  return (
    <svg viewBox="0 0 190 44" className="h-9 w-auto" fill="none" aria-hidden="true">
      <rect x="5" y="7" width="30" height="30" rx="10" fill="#635BFF" />
      <path d="M13 24c0-4 3-7 8-7h9v5h-9c-1 0-2 1-2 2s1 2 2 2h4c5 0 8 2 8 6 0 5-4 8-10 8h-9v-5h9c2 0 3-1 3-2 0-2-1-2-3-2h-4c-4 0-7-3-7-7Z" fill="#fff" />
      <text x="47" y="29" fontSize="24" fontWeight="800" fill="#635BFF" fontFamily="Inter, Arial, sans-serif">
        Stripe
      </text>
    </svg>
  );
}

function PayPalLogo() {
  return (
    <svg viewBox="0 0 180 44" className="h-9 w-auto" fill="none" aria-hidden="true">
      <path d="M20 9h10c7 0 12 5 11 11-1 7-6 12-13 12h-5l-2 8h-8l5-31Z" fill="#003087" />
      <path d="M28 9h8c7 0 12 5 11 11-1 7-6 12-13 12h-4l-1 6h-7l4-25Z" fill="#009CDE" opacity="0.95" />
      <text x="53" y="29" fontSize="24" fontWeight="700" fill="#003087" fontFamily="Inter, Arial, sans-serif">
        PayPal
      </text>
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 180 44" className="h-9 w-auto text-slate-900 dark:text-white" fill="none" aria-hidden="true">
      <g fill="currentColor">
        <path d="M25 20c0-4 3-7 6-8-2-3-5-5-8-5-4 0-7 3-9 3s-5-3-8-3c-5 0-10 4-12 10-2 7 2 15 5 19 2 3 5 6 8 6 3 0 4-2 8-2 3 0 4 2 8 2 3 0 6-3 8-6 2-4 3-6 4-10-7-3-10-8-10-6Z" transform="translate(8 2) scale(0.65)" />
        <path d="M25 5c2-2 3-5 3-7-3 0-6 2-8 4-2 2-3 5-3 7 3 1 6-1 8-4Z" transform="translate(8 8) scale(0.65)" />
        <text x="42" y="29" fontSize="24" fontWeight="700" fontFamily="Inter, Arial, sans-serif">
          Apple
        </text>
      </g>
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 180 44" className="h-9 w-auto text-slate-900 dark:text-white" fill="none" aria-hidden="true">
      <path d="M27 22h-9v-6h15c0 1 1 2 1 4 0 10-7 17-17 17-10 0-18-8-18-18s8-18 18-18c5 0 9 2 13 5l-5 5c-2-2-5-3-8-3-6 0-11 5-11 11s5 11 11 11c6 0 9-4 10-8Z" fill="#4285F4" />
      <path d="M18 8c3 0 6 1 8 3l5-5c-4-3-8-5-13-5-7 0-14 4-17 11l6 5c1-5 6-9 11-9Z" fill="#EA4335" />
      <path d="M1 12c-1 2-2 5-2 7s1 5 2 7l6-5c-1-1-1-3-1-4s0-3 1-4l-6-5Z" fill="#FBBC05" />
      <path d="M18 37c5 0 9-2 12-5l-6-5c-2 2-4 3-6 3-5 0-10-4-11-9l-6 5c3 7 10 11 17 11Z" fill="#34A853" />
      <text x="47" y="29" fontSize="22" fontWeight="600" fill="currentColor" fontFamily="Inter, Arial, sans-serif">Google</text>
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg viewBox="0 0 180 44" className="h-9 w-auto" fill="none" aria-hidden="true">
      <text x="10" y="31" fontSize="28" fontWeight="900" fill="#1A1F71" letterSpacing="0.04em" fontFamily="Inter, Arial, sans-serif">
        VISA
      </text>
      <path d="M68 11h10l-10 21H58l10-21Z" fill="#F7B600" />
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 190 44" className="h-9 w-auto text-slate-700 dark:text-white" fill="none" aria-hidden="true">
      <circle cx="28" cy="22" r="11" fill="#EB001B" />
      <circle cx="42" cy="22" r="11" fill="#F79E1B" />
      <rect x="35" y="11" width="8" height="22" fill="#FF5F00" opacity="0.8" />
      <text x="62" y="28" fontSize="18" fontWeight="700" fill="currentColor" fontFamily="Inter, Arial, sans-serif">
        mastercard
      </text>
    </svg>
  );
}

function AwsLogo() {
  return (
    <svg viewBox="0 0 180 44" className="h-9 w-auto text-slate-900 dark:text-white" fill="none" aria-hidden="true">
      <text x="10" y="24" fontSize="24" fontWeight="700" fill="currentColor" fontFamily="Inter, Arial, sans-serif">
        aws
      </text>
      <path d="M13 31c18 8 46 8 63-1" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
      <path d="M58 31l6 4 9-7" stroke="#FF9900" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloudflareLogo() {
  return (
    <svg viewBox="0 0 200 44" className="h-9 w-auto text-slate-700 dark:text-white" fill="none" aria-hidden="true">
      <path d="M18 29h39c3 0 4-1 5-4 1-4-2-7-6-6-1-5-5-8-10-8-5 0-9 3-11 8-4-1-8 1-9 5-2 3-1 5 3 5Z" fill="#F38020" />
      <path d="M30 31h29c2 0 4-1 4-3 1-2-1-4-4-4H33c-2 0-4 1-5 3 0 2 1 4 2 4Z" fill="#F9AE40" />
      <text x="70" y="29" fontSize="21" fontWeight="700" fill="currentColor" fontFamily="Inter, Arial, sans-serif">
        Cloudflare
      </text>
    </svg>
  );
}
