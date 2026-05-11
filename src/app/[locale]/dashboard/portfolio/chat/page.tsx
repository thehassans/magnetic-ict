import { MessageSquare } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PortfolioChat } from "@/components/dashboard/portfolio-chat";
import { userHasPortfolioAccess } from "@/lib/portfolio-access";
import { getChatMessages, getPortfolioSite } from "@/lib/portfolio-db";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortfolioChatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const hasAccess = await userHasPortfolioAccess(session.user.id);
  if (!hasAccess) notFound();

  const site = await getPortfolioSite(session.user.id);
  if (!site) notFound();

  const messages = await getChatMessages(site._id, 60);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/70 bg-white/75 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
            <MessageSquare className="h-4 w-4" />
            Portfolio AI
          </div>
          <Link
            href="/dashboard/portfolio"
            locale={locale}
            className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            ← Back to settings
          </Link>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Portfolio AI</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Chat with your Portfolio AI to update any content on your site — phone number, bio, skills, status, and more.
        </p>
      </section>
      <PortfolioChat site={site} initialMessages={messages} />
    </div>
  );
}
