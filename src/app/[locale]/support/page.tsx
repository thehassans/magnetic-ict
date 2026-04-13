import { Headphones, LifeBuoy, ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Pages");
  const session = await auth();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[36px] border border-violet-100 bg-white/85 p-8 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("supportEyebrow")}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            {t("supportTitle")}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            {t("supportDescription")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              locale={locale}
              className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              {t("supportDashboardAction")}
            </Link>
            {session?.user?.role === "ADMIN" ? (
              <Link
                href="/admin/orders"
                locale={locale}
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-cyan-400/20 dark:hover:bg-white/10"
              >
                {t("supportAdminAction")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="space-y-5 rounded-[36px] border border-slate-200 bg-white/85 p-8 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <Headphones className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            <div>
              <div className="text-sm font-semibold text-slate-950 dark:text-white">Priority concierge</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Architecture guidance and onboarding support</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <LifeBuoy className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            <div>
              <div className="text-sm font-semibold text-slate-950 dark:text-white">Always-on assistance</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Rapid issue response and service continuity</div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
            <ShieldCheck className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            <div>
              <div className="text-sm font-semibold text-slate-950 dark:text-white">Trusted delivery</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Secure support workflows for focused operations</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
