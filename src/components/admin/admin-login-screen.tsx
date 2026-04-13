"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { authenticateAdmin, type AdminLoginState } from "@/app/admin/actions";

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
    <section className="w-full max-w-5xl rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-600">
            <ShieldCheck className="h-4 w-4" />
            {t("adminOrdersEyebrow")}
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {t("adminAuthTitle")}
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Access the Magnetic operations panel through a dedicated administrator sign-in.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Magnetic ICT</div>
              <div className="mt-3 text-2xl font-semibold text-slate-950">Admin panel</div>
              <div className="mt-2 text-sm leading-7 text-slate-600">A clean internal workspace for orders, fulfillment, and payment operations.</div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Restricted access</div>
              <div className="mt-3 flex items-start gap-3 text-slate-950">
                <LockKeyhole className="mt-1 h-5 w-5 text-slate-500" />
                <span className="text-sm leading-7 text-slate-600">Only configured administrator credentials can enter this workspace.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 sm:p-7">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="callback" value={callbackPath} />
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {commerce("emailPlaceholder")}
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder={commerce("emailPlaceholder")}
                className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {commerce("passwordPlaceholder")}
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder={commerce("passwordPlaceholder")}
                className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950"
              />
            </div>
            <SubmitButton />
          </form>

          {showAccessDenied ? <p className="mt-4 text-sm leading-6 text-amber-700">{t("adminAccessDenied")}</p> : null}
          {errorMessage ? <p className="mt-4 text-sm leading-6 text-rose-600">{errorMessage}</p> : null}
        </div>
      </div>
    </section>
  );
}
