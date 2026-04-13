"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { InfiniteMarquee } from "@/components/home/infinite-marquee";
import { ScrollReveal } from "@/components/home/scroll-reveal";

const partners = [
  { name: "Stripe", Logo: StripeLogo },
  { name: "PayPal", Logo: PayPalLogo },
  { name: "Apple Pay", Logo: ApplePayLogo },
  { name: "Google Pay", Logo: GooglePayLogo },
  { name: "Visa", Logo: VisaLogo },
  { name: "Mastercard", Logo: MastercardLogo },
  { name: "AWS", Logo: AwsLogo },
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
        duration={28}
        className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        itemClassName="shrink-0"
        items={partners.map(({ name, Logo }) => (
          <motion.div
            key={name}
            whileHover={{ y: -4 }}
            className="flex h-20 w-[12rem] items-center justify-center rounded-[24px] border border-slate-200 bg-white/90 px-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-2xl transition hover:border-cyan-200 hover:bg-cyan-50/60 dark:border-white/10 dark:bg-slate-950/60 dark:hover:border-cyan-400/20 dark:hover:bg-white/5"
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
    <svg viewBox="0 0 150 44" className="h-9 w-auto" fill="none" aria-hidden="true">
      <text x="8" y="29" fontSize="26" fontWeight="700" fill="#4338CA" fontFamily="Arial, sans-serif">
        stripe
      </text>
    </svg>
  );
}

function PayPalLogo() {
  return (
    <svg viewBox="0 0 160 44" className="h-9 w-auto" fill="none" aria-hidden="true">
      <text x="12" y="29" fontSize="24" fontWeight="700" fill="#009CDE" fontFamily="Arial, sans-serif">
        Pay
      </text>
      <text x="56" y="29" fontSize="24" fontWeight="700" fill="#003087" fontFamily="Arial, sans-serif">
        Pal
      </text>
    </svg>
  );
}

function ApplePayLogo() {
  return (
    <svg viewBox="0 0 170 44" className="h-9 w-auto text-slate-900 dark:text-white" fill="none" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="16" cy="18" r="7" />
        <path d="M20 10c-2 1-3 3-3 5 2 0 4-1 5-3 1-2 1-3 1-5-1 0-2 1-3 3Z" />
        <text x="32" y="29" fontSize="24" fontWeight="600" fontFamily="Arial, sans-serif">
          Pay
        </text>
      </g>
    </svg>
  );
}

function GooglePayLogo() {
  return (
    <svg viewBox="0 0 180 44" className="h-9 w-auto" fill="none" aria-hidden="true">
      <g fontFamily="Arial, sans-serif" fontSize="23" fontWeight="700">
        <text x="10" y="29" fill="#4285F4">G</text>
        <text x="28" y="29" fill="#EA4335">o</text>
        <text x="42" y="29" fill="#FBBC05">o</text>
        <text x="56" y="29" fill="#4285F4">g</text>
        <text x="70" y="29" fill="#34A853">l</text>
        <text x="78" y="29" fill="#EA4335">e</text>
        <text x="100" y="29" className="fill-slate-900 dark:fill-white"> Pay</text>
      </g>
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg viewBox="0 0 150 44" className="h-9 w-auto" fill="none" aria-hidden="true">
      <text x="12" y="29" fontSize="27" fontWeight="800" fill="#1A1F71" fontFamily="Arial, sans-serif">
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 170 44" className="h-9 w-auto text-slate-700 dark:text-white" fill="none" aria-hidden="true">
      <circle cx="28" cy="22" r="11" fill="#EB001B" />
      <circle cx="42" cy="22" r="11" fill="#F79E1B" />
      <text x="62" y="28" fontSize="18" fontWeight="700" fill="currentColor" fontFamily="Arial, sans-serif">
        mastercard
      </text>
    </svg>
  );
}

function AwsLogo() {
  return (
    <svg viewBox="0 0 150 44" className="h-9 w-auto text-slate-900 dark:text-white" fill="none" aria-hidden="true">
      <text x="10" y="24" fontSize="22" fontWeight="700" fill="currentColor" fontFamily="Arial, sans-serif">
        aws
      </text>
      <path d="M12 30c18 8 46 8 63-1" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CloudflareLogo() {
  return (
    <svg viewBox="0 0 190 44" className="h-9 w-auto text-slate-700 dark:text-white" fill="none" aria-hidden="true">
      <path d="M18 29h39c3 0 4-1 5-4 1-4-2-7-6-6-1-5-5-8-10-8-5 0-9 3-11 8-4-1-8 1-9 5-2 3-1 5 3 5Z" fill="#F38020" />
      <path d="M30 31h29c2 0 4-1 4-3 1-2-1-4-4-4H33c-2 0-4 1-5 3 0 2 1 4 2 4Z" fill="#F9AE40" />
      <text x="70" y="29" fontSize="21" fontWeight="700" fill="currentColor" fontFamily="Arial, sans-serif">
        Cloudflare
      </text>
    </svg>
  );
}
