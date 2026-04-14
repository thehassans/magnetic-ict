"use client";

import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppleIcon, AtSignIcon, ChevronLeftIcon, GithubIcon } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SocialProvider = {
  id: "google" | "apple" | "github";
  label: string;
  enabled: boolean;
  onClick: () => void;
};

type AuthPageProps = {
  logo: ReactNode;
  title: string;
  description: string;
  homeHref: string;
  homeLabel: string;
  quote: string;
  quoteAuthor: string;
  socialProviders: SocialProvider[];
  email: string;
  onEmailChange: (value: string) => void;
  onEmailSubmit: (event: FormEvent<HTMLFormElement>) => void;
  emailPlaceholder: string;
  emailHint: string;
  emailButtonLabel: string;
  otpStage: "email" | "otp";
  otpDigits: string[];
  onOtpDigitChange: (index: number, value: string) => void;
  onOtpSubmit: (event: FormEvent<HTMLFormElement>) => void;
  verifyOtpLabel: string;
  useDifferentEmailLabel: string;
  onUseDifferentEmail: () => void;
  pending: boolean;
  error?: string;
  info?: string;
  footerTermsHref: string;
  footerPrivacyHref: string;
  footerBrandText: string;
};

export function AuthPage({
  logo,
  title,
  description,
  homeHref,
  homeLabel,
  quote,
  quoteAuthor,
  socialProviders,
  email,
  onEmailChange,
  onEmailSubmit,
  emailPlaceholder,
  emailHint,
  emailButtonLabel,
  otpStage,
  otpDigits,
  onOtpDigitChange,
  onOtpSubmit,
  verifyOtpLabel,
  useDifferentEmailLabel,
  onUseDifferentEmail,
  pending,
  error,
  info,
  footerTermsHref,
  footerPrivacyHref,
  footerBrandText
}: AuthPageProps) {
  return (
    <main className="relative min-h-screen bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,249,255,0.96))] text-slate-950 dark:bg-[linear-gradient(135deg,rgba(2,6,23,1),rgba(3,7,18,0.98))] dark:text-white lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-screen flex-col overflow-hidden border-r border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.85))] p-10 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(30,41,59,0.3))] lg:flex">
        <div className="from-background absolute inset-0 z-10 bg-gradient-to-t to-transparent dark:from-slate-950/20" />
        <div className="z-10 flex items-center rounded-2xl bg-white/60 px-3 py-2 shadow-sm backdrop-blur dark:bg-slate-950/10">{logo}</div>
        <div className="z-10 mt-auto max-w-lg">
          <blockquote className="space-y-3">
            <p className="text-xl leading-8 text-slate-800 dark:text-slate-100">&ldquo;{quote}&rdquo;</p>
            <footer className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">~ {quoteAuthor}</footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center p-4 sm:p-6 lg:p-8">
        <div aria-hidden className="absolute inset-0 isolate -z-10 overflow-hidden opacity-80 dark:opacity-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.16),transparent_24%)] dark:bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.2),transparent_24%)]" />
          <div className="absolute right-[-10rem] top-[-14rem] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.02)_50%,transparent_75%)] dark:bg-[radial-gradient(circle,rgba(56,189,248,0.08)_0%,rgba(56,189,248,0.01)_55%,transparent_75%)]" />
          <div className="absolute right-[10%] top-[-12rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.06)_0%,rgba(15,23,42,0.01)_65%,transparent_80%)] dark:bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,rgba(99,102,241,0.01)_65%,transparent_80%)]" />
        </div>

        <div className="absolute left-5 right-5 top-7 flex items-center justify-between gap-3 sm:left-6 sm:right-6 lg:left-8 lg:right-8">
          <Button variant="ghost" className="text-slate-700 hover:bg-white/70 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white" asChild>
            <Link href={homeHref}>
              <ChevronLeftIcon className="me-2 size-4" />
              {homeLabel}
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-md space-y-4">
          <div className="flex items-center lg:hidden rounded-2xl bg-white/60 px-3 py-2 shadow-sm backdrop-blur dark:bg-white/5">{logo}</div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-wide text-slate-950 dark:text-white">{title}</h1>
            <p className="text-base text-slate-700 dark:text-slate-300">{description}</p>
          </div>

          <div className="space-y-2">
            {socialProviders.map((provider) => (
              <Button
                key={provider.id}
                type="button"
                size="lg"
                variant="outline"
                className={cn(
                  "h-12 w-full justify-center rounded-2xl border-slate-200 bg-white/90 text-slate-950 shadow-sm hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:text-white dark:hover:bg-slate-900/80",
                  !provider.enabled && "cursor-not-allowed opacity-50"
                )}
                onClick={provider.onClick}
                disabled={!provider.enabled || pending}
              >
                {provider.id === "google" ? <GoogleIcon className="me-2 size-4" /> : null}
                {provider.id === "apple" ? <AppleIcon className="me-2 size-4" /> : null}
                {provider.id === "github" ? <GithubIcon className="me-2 size-4" /> : null}
                {provider.label}
              </Button>
            ))}
          </div>

          <AuthSeparator />

          {otpStage === "email" ? (
            <form onSubmit={onEmailSubmit} className="space-y-3">
              <p className="text-start text-xs text-slate-600 dark:text-slate-400">{emailHint}</p>
              <div className="relative h-max">
                <Input
                  placeholder={emailPlaceholder}
                  className="peer h-12 rounded-2xl border-slate-200 bg-white/95 ps-10 text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950/55 dark:text-white"
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-slate-400 peer-disabled:opacity-50 dark:text-slate-500">
                  <AtSignIcon className="size-4" aria-hidden="true" />
                </div>
              </div>
              <Button type="submit" className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100" disabled={pending}>
                <span>{emailButtonLabel}</span>
              </Button>
            </form>
          ) : (
            <form onSubmit={onOtpSubmit} className="space-y-3">
              <p className="text-start text-xs text-slate-600 dark:text-slate-400">{emailHint}</p>
              <div className="grid grid-cols-6 gap-2">
                {otpDigits.map((digit, index) => (
                  <Input
                    key={index}
                    value={digit}
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(event) => onOtpDigitChange(index, event.target.value.replace(/\D/g, "").slice(0, 1))}
                    className="h-12 rounded-2xl border-slate-200 bg-white/95 text-center text-lg font-semibold text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950/55 dark:text-white"
                  />
                ))}
              </div>
              <Button type="submit" className="h-12 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100" disabled={pending}>
                <span>{verifyOtpLabel}</span>
              </Button>
              <Button type="button" variant="outline" onClick={onUseDifferentEmail} className="h-12 w-full rounded-2xl border-slate-200 bg-white/90 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-slate-950/45 dark:text-white dark:hover:bg-slate-900/80" disabled={pending}>
                {useDifferentEmailLabel}
              </Button>
            </form>
          )}

          {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
          {!error && info ? <p className="text-sm text-emerald-600 dark:text-emerald-300">{info}</p> : null}

          <p className="pt-4 text-sm text-slate-600 dark:text-slate-400">
            By clicking continue, you agree to {footerBrandText}&apos;s{" "}
            <a href={footerTermsHref} className="underline underline-offset-4 hover:text-slate-950 dark:hover:text-white">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href={footerPrivacyHref} className="underline underline-offset-4 hover:text-slate-950 dark:hover:text-white">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    duration: 20 + i * 0.35
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="h-full w-full text-slate-700 dark:text-white" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0]
            }}
            transition={{
              duration: path.duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear"
            }}
          />
        ))}
      </svg>
    </div>
  );
}

function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <g>
        <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
      </g>
    </svg>
  );
}

function AuthSeparator() {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
      <span className="px-2 text-xs text-slate-500 dark:text-slate-400">OR</span>
      <div className="h-px w-full bg-slate-200 dark:bg-white/10" />
    </div>
  );
}
