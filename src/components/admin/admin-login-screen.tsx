"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowUpRight, LockKeyhole, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";
import { authenticateAdmin, type AdminLoginState } from "@/app/admin/actions";
import { BrandLogo } from "@/components/branding/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const initialState: AdminLoginState = {
  error: null
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("Pages");

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t("adminAuthButton") : t("adminAuthButton")}
    </button>
  );
}

export function AdminLoginScreen({
  callbackPath,
  hasConfiguredCredentials,
  showAccessDenied
}: {
  callbackPath: string;
  hasConfiguredCredentials: boolean;
  showAccessDenied: boolean;
}) {
  const t = useTranslations("Pages");
  const commerce = useTranslations("Commerce");
  const [state, formAction] = useActionState(authenticateAdmin, initialState);

  const errorMessage = !hasConfiguredCredentials
    ? t("adminAuthConfigError")
    : state.error === "invalid_credentials"
      ? t("adminAuthError")
      : state.error === "missing_configuration"
        ? t("adminAuthConfigError")
        : null;

  return (
    <section className="w-full max-w-6xl rounded-[40px] border border-slate-200/80 bg-white/88 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.1)] backdrop-blur-2xl transition-colors dark:border-white/10 dark:bg-slate-950/72 dark:shadow-[0_40px_120px_rgba(2,6,23,0.55)] sm:p-8 lg:p-10">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-white/10">
        <BrandLogo className="w-[154px] sm:w-[170px]" framed priority />
        <ThemeToggle />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
            <ShieldCheck className="h-4 w-4" />
            {t("adminOrdersEyebrow")}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-[3.5rem]">
              {t("adminAuthTitle")}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              Access the Magnetic operations panel through a dedicated administrator sign-in.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[30px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Magnetic ICT</div>
                  <div className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Admin panel</div>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Workflow className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">A premium internal workspace for orders, fulfillment, users, platform settings, and operational control.</div>
            </div>
            <div className="rounded-[30px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.05]">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Restricted access</div>
              <div className="mt-3 flex items-start gap-3 text-slate-950 dark:text-white">
                <LockKeyhole className="mt-1 h-5 w-5 text-slate-500 dark:text-slate-400" />
                <span className="text-sm leading-7 text-slate-600 dark:text-slate-300">Only configured administrator credentials can enter this workspace.</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />
                Private operator access
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[34px] border border-slate-200/80 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/[0.04] sm:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="callback" value={callbackPath} />
            <div className="flex items-center justify-between gap-4 pb-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Secure admin access</div>
                <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Sign in</div>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {commerce("emailPlaceholder")}
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder={commerce("emailPlaceholder")}
                className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                {commerce("passwordPlaceholder")}
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={commerce("passwordPlaceholder")}
                className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950 dark:border-white/10 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>
            <SubmitButton />
          </form>

          {showAccessDenied ? <p className="mt-4 text-sm leading-6 text-amber-700 dark:text-amber-300">{t("adminAccessDenied")}</p> : null}
          {errorMessage ? <p className="mt-4 text-sm leading-6 text-rose-600 dark:text-rose-300">{errorMessage}</p> : null}
        </div>
      </div>
    </section>
  );
}
