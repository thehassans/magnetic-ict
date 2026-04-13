"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { authenticateAdmin, type AdminLoginState } from "@/app/[locale]/admin/actions";

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
      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? t("adminAuthButton") : t("adminAuthButton")}
    </button>
  );
}

export function AdminLoginScreen({
  locale,
  callbackPath,
  hasConfiguredCredentials,
  showAccessDenied
}: {
  locale: string;
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
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-slate-950/85 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.45)] backdrop-blur-3xl sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(124,58,237,0.24),transparent_28%)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
            {t("adminOrdersEyebrow")}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {t("adminAuthTitle")}
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              {t("adminAuthDescription")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Magnetic ICT</div>
              <div className="mt-3 text-2xl font-semibold text-white">Admin panel</div>
              <div className="mt-2 text-sm leading-7 text-slate-300">Orders, fulfillment, payments, and operational visibility in one protected cockpit.</div>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">Restricted access</div>
              <div className="mt-3 flex items-center gap-3 text-white">
                <KeyRound className="h-5 w-5 text-cyan-300" />
                <span className="text-sm leading-7 text-slate-300">Only configured administrator credentials can enter this workspace.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl sm:p-7">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="callback" value={callbackPath} />
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                {commerce("emailPlaceholder")}
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder={commerce("emailPlaceholder")}
                className="h-12 w-full rounded-[22px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                {commerce("passwordPlaceholder")}
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={commerce("passwordPlaceholder")}
                className="h-12 w-full rounded-[22px] border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
              />
            </div>
            <SubmitButton />
          </form>

          {showAccessDenied ? <p className="mt-4 text-sm leading-6 text-amber-300">{t("adminAccessDenied")}</p> : null}
          {errorMessage ? <p className="mt-4 text-sm leading-6 text-rose-300">{errorMessage}</p> : null}
        </div>
      </div>
    </section>
  );
}
