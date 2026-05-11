import { Layout, MessageSquare, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PortfolioWorkspace } from "@/components/dashboard/portfolio-workspace";
import { userHasPortfolioAccess } from "@/lib/portfolio-access";
import { getPortfolioSite } from "@/lib/portfolio-db";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortfolioDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const hasAccess = await userHasPortfolioAccess(session.user.id);
  if (!hasAccess) notFound();

  const site = await getPortfolioSite(session.user.id);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
              <Layout className="h-4 w-4" />
              Magnetic Portfolio Builder
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Sparkles className="h-4 w-4" />
              Aurora Template
            </div>
          </div>
          <Link
            href="/dashboard/portfolio/chat"
            locale={locale}
            className="inline-flex items-center gap-2.5 rounded-2xl border border-violet-200/70 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:border-violet-300 hover:from-violet-100 hover:to-indigo-100 dark:border-violet-400/20 dark:from-violet-500/10 dark:to-indigo-500/10 dark:text-violet-300 dark:hover:border-violet-400/40"
          >
            <MessageSquare className="h-4 w-4" />
            Portfolio AI
          </Link>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          Portfolio Builder
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Manage your portfolio site — upload logos, update contact info, configure your domain, and publish your site to the world.
        </p>
      </section>

      <PortfolioWorkspace initialSite={site} userId={session.user.id} />
    </div>
  );
}
