"use client";

import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
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
  function focusOtpInput(index: number) {
    requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>(`[data-otp-index="${index}"]`)?.focus();
    });
  }

  function applyOtpInput(index: number, rawValue: string) {
    const digits = rawValue.replace(/\D/g, "").slice(0, 6 - index);

    if (!digits) {
      onOtpDigitChange(index, "");
      return;
    }

    digits.split("").forEach((digit, offset) => {
      onOtpDigitChange(index + offset, digit);
    });

    focusOtpInput(Math.min(index + digits.length, 5));
  }

  function handleOtpChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    // When a box already has a digit and the user types a new one, browsers
    // append the new character producing a 2-char value (e.g. "26").
    // Strip the existing digit so only the newly typed character is processed.
    const existing = otpDigits[index] ?? "";
    let incoming = event.target.value;
    if (existing && incoming.startsWith(existing) && incoming.length === existing.length + 1) {
      incoming = incoming.slice(existing.length);
    }
    applyOtpInput(index, incoming);
  }

  function handleOtpPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    applyOtpInput(index, event.clipboardData.getData("text"));
  }

  function handleOtpKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      onOtpDigitChange(index - 1, "");
      focusOtpInput(index - 1);
    }
  }

  const enabledProviders = socialProviders.filter((p) => p.enabled);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#F9F9FB] px-4 py-12 dark:bg-[#0A0A0F]">
      {/* Top bar */}
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between sm:left-8 sm:right-8">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-[13px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          asChild
        >
          <Link href={homeHref}>
            <ChevronLeftIcon className="size-3.5" />
            {homeLabel}
          </Link>
        </Button>
        <ThemeToggle />
      </div>

      {/* Card */}
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center justify-center">
            {logo}
          </div>
        </div>

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        {/* Social providers */}
        {enabledProviders.length > 0 && (
          <div className="space-y-2.5">
            {enabledProviders.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={provider.onClick}
                disabled={pending}
                className="group flex h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-[13.5px] font-medium text-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/8 dark:hover:border-white/20"
              >
                {provider.id === "google" && <GoogleIcon className="size-[15px]" />}
                {provider.id === "apple" && <AppleIcon className="size-[15px]" />}
                {provider.id === "github" && <GithubIcon className="size-[15px]" />}
                {provider.label}
              </button>
            ))}
          </div>
        )}

        {/* Divider */}
        {enabledProviders.length > 0 && (
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/8" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/8" />
          </div>
        )}

        {/* Email / OTP form */}
        {otpStage === "email" ? (
          <form onSubmit={onEmailSubmit} className="space-y-3">
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{emailHint}</p>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                <AtSignIcon className="size-[14px]" />
              </div>
              <Input
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                className="h-[44px] rounded-xl border-slate-200 bg-white pl-9 text-[13.5px] text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)] placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-white/20"
              />
            </div>
            <button
              type="submit"
              disabled={pending}
              className="h-[44px] w-full rounded-xl bg-slate-900 text-[13.5px] font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition-all duration-150 hover:bg-slate-800 hover:shadow-[0_3px_12px_rgba(0,0,0,0.2)] disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {emailButtonLabel}
            </button>
          </form>
        ) : (
          <form onSubmit={onOtpSubmit} className="space-y-3">
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{emailHint}</p>
            <div className="grid grid-cols-6 gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  value={digit}
                  data-otp-index={index}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : undefined}
                  maxLength={2}
                  onChange={(e) => handleOtpChange(index, e)}
                  onPaste={(e) => handleOtpPaste(index, e)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={cn(
                    "h-12 w-full rounded-xl border text-center text-[18px] font-semibold outline-none transition-all duration-150",
                    "border-slate-200 bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
                    "focus:border-slate-400 focus:shadow-[0_0_0_3px_rgba(15,23,42,0.07)] focus:ring-0",
                    "dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/30 dark:focus:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]",
                    digit && "border-slate-400 dark:border-white/30"
                  )}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={pending}
              className="h-[44px] w-full rounded-xl bg-slate-900 text-[13.5px] font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition-all duration-150 hover:bg-slate-800 hover:shadow-[0_3px_12px_rgba(0,0,0,0.2)] disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {verifyOtpLabel}
            </button>
            <button
              type="button"
              onClick={onUseDifferentEmail}
              disabled={pending}
              className="h-[40px] w-full rounded-xl border border-slate-200 bg-transparent text-[13px] font-medium text-slate-500 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
            >
              {useDifferentEmailLabel}
            </button>
          </form>
        )}

        {/* Error / info */}
        {error && (
          <p className="mt-3 text-center text-[12.5px] text-rose-500 dark:text-rose-400">{error}</p>
        )}
        {!error && info && (
          <p className="mt-3 text-center text-[12.5px] text-emerald-600 dark:text-emerald-400">{info}</p>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-[11.5px] leading-relaxed text-slate-400 dark:text-slate-500">
          By continuing, you agree to {footerBrandText}&apos;s{" "}
          <Link
            href={footerTermsHref}
            className="underline underline-offset-2 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href={footerPrivacyHref}
            className="underline underline-offset-2 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
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
