"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";

function normalizeCallbackPath(rawPath: string | null) {
  if (!rawPath || !rawPath.startsWith("/")) {
    return "/dashboard";
  }

  return rawPath;
}

export default function CustomerSignInPage() {
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

  async function handleGoogleSignIn() {
    setError("");
    setAdminError("");
    await signIn("google", { callbackUrl: `/${locale}${callbackPath}` });
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

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[36px] border border-violet-200/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(124,58,237,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="rounded-[30px] border border-slate-200 bg-slate-50/80 p-6 sm:p-8 dark:border-white/10 dark:bg-white/5">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-violet-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
              {t("customerAuthEyebrow")}
            </div>
            <h1 className="mt-5 max-w-md text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              {t("customerAuthTitle")}
            </h1>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                locale={locale}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
              >
                {t("customerAuthBackHome")}
              </Link>
              {status === "authenticated" ? (
                <Link
                  href={callbackPath}
                  locale={locale}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  {t("customerAuthOpenWorkspace")}
                </Link>
              ) : null}
            </div>
          </div>

          <div className={`grid gap-6 ${adminMode ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2"}`}>
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950/40">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
                {commerce("authSecureLabel")}
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">{t("customerAuthGoogleTitle")}</h2>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                {commerce("googleButton")}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/40">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs uppercase tracking-[0.24em] text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-100">
                <Mail className="h-4 w-4" />
                {commerce("otpLabel")}
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">
                {stage === "email" ? t("customerAuthOtpTitle") : commerce("otpVerifyTitle")}
              </h2>

              {stage === "email" ? (
                <form onSubmit={handleEmailSubmit} className="mt-5 space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={commerce("emailPlaceholder")}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-300 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                  >
                    {isPending ? commerce("sendingOtp") : t("customerAuthEmailButton")}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="mt-5 space-y-4">
                  <div className="grid grid-cols-6 gap-2">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        value={digit}
                        inputMode="numeric"
                        maxLength={1}
                        onChange={(event) => {
                          const next = event.target.value.replace(/\D/g, "").slice(0, 1);
                          setCode((current) => {
                            const clone = [...current];
                            clone[index] = next;
                            return clone;
                          });
                        }}
                        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 text-center text-lg font-semibold text-slate-950 outline-none transition focus:border-violet-300 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                  >
                    {isPending ? commerce("verifyingOtp") : commerce("verifyOtp")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("email")}
                    className="inline-flex h-11 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
                  >
                    {commerce("useDifferentEmail")}
                  </button>
                </form>
              )}

              {error ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
              {!error && info ? <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-300">{info}</p> : null}
            </div>

            {adminMode ? (
              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_12px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/40">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs uppercase tracking-[0.24em] text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                  <KeyRound className="h-4 w-4" />
                  {t("adminOrdersEyebrow")}
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">{t("adminAuthTitle")}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{t("adminAuthDescription")}</p>
                <form onSubmit={handleAdminSubmit} className="mt-5 space-y-4">
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    placeholder={commerce("emailPlaceholder")}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-300 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    placeholder={commerce("passwordPlaceholder")}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-300 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-amber-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
                  >
                    {isPending ? t("adminAuthButton") : t("adminAuthButton")}
                  </button>
                </form>
                {adminError ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-300">{adminError}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
