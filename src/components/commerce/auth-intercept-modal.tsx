"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, ShieldCheck, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCommerce } from "@/components/commerce/commerce-provider";

export function AuthInterceptModal() {
  const { status } = useSession();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Commerce");
  const { isAuthModalOpen, closeAuthModal, authRedirectPath, closeCart } = useCommerce();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [stage, setStage] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isPending, startTransition] = useTransition();

  const otpValue = useMemo(() => code.join(""), [code]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setStage("email");
      setError("");
      setInfo("");
      setCode(["", "", "", "", "", ""]);
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (status === "authenticated" && isAuthModalOpen) {
      closeAuthModal();
      closeCart();
      router.push(authRedirectPath);
    }
  }, [authRedirectPath, closeAuthModal, closeCart, isAuthModalOpen, router, status]);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(t("emailRequired"));
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
        setError(payload.error ?? t("otpRequestError"));
        return;
      }

      setEmail(normalizedEmail);
      setStage("otp");
      setInfo(t("otpRequestSuccess"));
    });
  }

  async function handleOtpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setInfo("");

    if (otpValue.length !== 6) {
      setError(t("otpInvalid"));
      return;
    }

    startTransition(async () => {
      const result = await signIn("email-otp", {
        email,
        code: otpValue,
        redirect: false,
        callbackUrl: `/${locale}${authRedirectPath}`
      });

      if (result?.error) {
        setError(t("otpVerifyError"));
        return;
      }

      closeAuthModal();
      closeCart();
      router.push(authRedirectPath);
    });
  }

  async function handleGoogleSignIn() {
    setError("");
    await signIn("google", { callbackUrl: `/${locale}${authRedirectPath}` });
  }

  return (
    <AnimatePresence>
      {isAuthModalOpen ? (
        <>
          <motion.button
            type="button"
            aria-label={t("closeAuthModal")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-1/2 z-[100] mx-auto w-full max-w-2xl -translate-y-1/2 overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/95 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_100px_rgba(15,23,42,0.8)] backdrop-blur-2xl"
          >
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-cyan-300">{t("authEyebrow")}</div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{t("authTitle")}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-slate-400">{t("authDescription")}</p>
                </div>
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[1fr_0.92fr]">
              <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  {t("authSecureLabel")}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{t("googleTitle")}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">{t("googleDescription")}</p>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                >
                  {t("googleButton")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                  <Mail className="h-4 w-4 text-cyan-300" />
                  {t("otpLabel")}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{stage === "email" ? t("otpTitle") : t("otpVerifyTitle")}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {stage === "email" ? t("otpDescription") : t("otpVerifyDescription")}
                </p>

                {stage === "email" ? (
                  <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder={t("emailPlaceholder")}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/30"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                    >
                      {isPending ? t("sendingOtp") : t("sendOtp")}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">
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
                          className="h-12 rounded-2xl border border-white/10 bg-slate-950/60 text-center text-lg font-semibold text-white outline-none transition focus:border-cyan-400/30"
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:opacity-60"
                    >
                      {isPending ? t("verifyingOtp") : t("verifyOtp")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStage("email")}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      {t("useDifferentEmail")}
                    </button>
                  </form>
                )}

                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-4 text-sm text-rose-300"
                    >
                      {error}
                    </motion.p>
                  ) : null}
                  {!error && info ? (
                    <motion.p
                      key="info"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-4 text-sm text-emerald-300"
                    >
                      {info}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
