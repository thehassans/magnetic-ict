"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { BrandLogo } from "@/components/branding/brand-logo";
import { AuthPage } from "@/components/ui/auth-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProviderAvailability = {
  google: boolean;
  github: boolean;
  apple: boolean;
};

function normalizeCallbackPath(rawPath: string | null) {
  if (!rawPath || !rawPath.startsWith("/")) {
    return "/dashboard";
  }

  return rawPath;
}

export function CustomerSignInClient({ providerAvailability }: { providerAvailability: ProviderAvailability }) {
  const t = useTranslations("Pages");
  const commerce = useTranslations("Commerce");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [stage, setStage] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isPending, startTransition] = useTransition();

  const callbackPath = normalizeCallbackPath(searchParams.get("callback"));
  const adminMode = searchParams.get("mode") === "admin" || callbackPath.startsWith("/admin");
  const otpValue = useMemo(() => code.join(""), [code]);

  async function handleProviderSignIn(provider: "google" | "github" | "apple") {
    setError("");
    setInfo("");
    setAdminError("");
    await signIn(provider, { callbackUrl: `/${locale}${callbackPath}` });
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");
    setAdminError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(commerce("emailRequired"));
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? commerce("otpRequestError"));
        return;
      }

      setEmail(normalizedEmail);
      setStage("otp");
      setInfo(commerce("otpRequestSuccess"));
    });
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");
    setAdminError("");

    if (otpValue.length !== 6) {
      setError(commerce("otpInvalid"));
      return;
    }

    startTransition(async () => {
      const result = await signIn("email-otp", {
        email,
        code: otpValue,
        redirect: false,
        callbackUrl: `/${locale}${callbackPath}`
      });

      if (result?.error) {
        setError(commerce("otpVerifyError"));
        return;
      }

      router.push(callbackPath);
    });
  }

  async function handleAdminSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");
    setAdminError("");

    const normalizedEmail = adminEmail.trim().toLowerCase();

    if (!normalizedEmail || !adminPassword) {
      setAdminError(t("adminAuthError"));
      return;
    }

    startTransition(async () => {
      const result = await signIn("admin-credentials", {
        email: normalizedEmail,
        password: adminPassword,
        redirect: false,
        callbackUrl: `/${locale}${callbackPath}`
      });

      if (result?.error || !result?.ok) {
        setAdminError(t("adminAuthError"));
        return;
      }

      router.push(callbackPath);
    });
  }

  if (adminMode) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[36px] border border-violet-200/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(124,58,237,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
          <div className="flex items-center justify-center">
            <BrandLogo className="w-[180px]" priority />
          </div>
          <div className="mx-auto mt-8 max-w-xl rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/40">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
              <KeyRound className="h-4 w-4" />
              {t("adminOrdersEyebrow")}
            </div>
            <h1 className="mt-5 text-3xl font-semibold text-slate-950 dark:text-white">{t("adminAuthTitle")}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{t("adminAuthDescription")}</p>
            <form onSubmit={handleAdminSubmit} className="mt-5 space-y-4">
              <Input
                type="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                placeholder={commerce("emailPlaceholder")}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              />
              <Input
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                placeholder={commerce("passwordPlaceholder")}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-4 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              />
              <Button type="submit" disabled={isPending} className="h-12 w-full rounded-2xl bg-amber-500 text-slate-950 hover:bg-amber-400">
                {t("adminAuthButton")}
              </Button>
            </form>
            {adminError ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{adminError}</p> : null}
          </div>
        </section>
      </main>
    );
  }

  return (
    <AuthPage
      logo={<BrandLogo className="w-[180px]" priority />}
      title="Sign in or join Magnetic ICT"
      description="Access your Magnetic ICT account with social sign-in or secure email verification."
      homeHref={`/${locale}`}
      homeLabel={t("customerAuthBackHome")}
      quote="This platform helps teams move faster, launch better services, and manage customer work with confidence."
      quoteAuthor="Magnetic-Ict"
      socialProviders={[
        {
          id: "google",
          label: "Continue with Google",
          enabled: providerAvailability.google,
          onClick: () => handleProviderSignIn("google")
        },
        {
          id: "apple",
          label: "Continue with Apple",
          enabled: providerAvailability.apple,
          onClick: () => handleProviderSignIn("apple")
        },
        {
          id: "github",
          label: "Continue with GitHub",
          enabled: providerAvailability.github,
          onClick: () => handleProviderSignIn("github")
        }
      ]}
      email={email}
      onEmailChange={setEmail}
      onEmailSubmit={handleEmailSubmit}
      emailPlaceholder={commerce("emailPlaceholder")}
      emailHint={stage === "email" ? "Enter your email address to sign in or create an account" : `Enter the 6-digit code sent to ${email}`}
      emailButtonLabel={isPending ? commerce("sendingOtp") : t("customerAuthEmailButton")}
      otpStage={stage}
      otpDigits={code}
      onOtpDigitChange={(index, value) =>
        setCode((current) => {
          const next = [...current];
          next[index] = value;
          return next;
        })
      }
      onOtpSubmit={handleOtpSubmit}
      verifyOtpLabel={isPending ? commerce("verifyingOtp") : commerce("verifyOtp")}
      useDifferentEmailLabel={commerce("useDifferentEmail")}
      onUseDifferentEmail={() => {
        setStage("email");
        setCode(["", "", "", "", "", ""]);
      }}
      pending={isPending}
      error={error}
      info={info || (status === "authenticated" ? t("customerAuthOpenWorkspace") : "")}
      footerTermsHref="#"
      footerPrivacyHref="#"
      footerBrandText="Magnetic ICT"
    />
  );
}
