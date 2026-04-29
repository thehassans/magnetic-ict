"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { authenticateAdmin, type AdminLoginState } from "@/app/admin/actions";
import { BrandLogo } from "@/components/branding/brand-logo";
import { useTheme } from "@/components/providers/theme-provider";

const initialState: AdminLoginState = {
  error: null
};

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("Pages");

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative inline-flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 px-6 text-sm font-medium text-white transition-all hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
    >
      <span className="relative z-10">{t("adminAuthButton")}</span>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <BrandLogo className="w-[160px]" priority />
          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.12)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_2px_40px_-12px_rgba(0,0,0,0.5)]">
          {/* Gradient accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
          
          <div className="p-8">
            {/* Title */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 dark:bg-white">
                <Lock className="h-6 w-6 text-white dark:text-slate-950" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {t("adminAuthTitle")}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Secure admin access only
              </p>
            </div>

            {/* Form */}
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="callback" value={callbackPath} />
              
              <div className="space-y-1.5">
                <label htmlFor="admin-email" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {commerce("emailPlaceholder")}
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@magneticict.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-600 dark:focus:bg-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {commerce("passwordPlaceholder")}
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-600 dark:focus:bg-slate-800"
                />
              </div>

              <div className="pt-2">
                <SubmitButton />
              </div>
            </form>

            {/* Messages */}
            {showAccessDenied ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/20">
                <p className="text-sm text-amber-700 dark:text-amber-400">{t("adminAccessDenied")}</p>
              </div>
            ) : null}
            
            {errorMessage ? (
              <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/30 dark:bg-rose-900/20">
                <p className="text-sm text-rose-600 dark:text-rose-400">{errorMessage}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
          Protected area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
