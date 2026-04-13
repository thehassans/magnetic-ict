import { AlertCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { markOrdersCancelled } from "@/lib/order-processing";

export default async function CheckoutCancelPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_refs?: string }>;
}) {
  const { locale } = await params;
  const { order_refs } = await searchParams;
  const t = await getTranslations("Commerce");

  const orderIds = order_refs?.split(",").filter(Boolean) ?? [];

  if (orderIds.length > 0) {
    await markOrdersCancelled(orderIds);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-violet-100 bg-white/85 p-8 text-center shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/10 text-amber-300">
          <AlertCircle className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("checkoutCancelEyebrow")}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{t("checkoutCancelTitle")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">{t("checkoutCancelDescription")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/checkout"
            locale={locale}
            className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-700"
          >
            {t("returnToCheckout")}
          </Link>
          <Link
            href="/cart"
            locale={locale}
            className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {t("returnToCart")}
          </Link>
        </div>
      </section>
    </main>
  );
}
