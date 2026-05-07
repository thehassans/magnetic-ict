import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ClearCartOnMount } from "@/components/commerce/clear-cart-on-mount";
import { markOrdersPaid } from "@/lib/order-processing";
import { capturePayPalCheckoutOrder, getStripeClient } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export default async function CheckoutSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string; token?: string; order_refs?: string; provider?: string }>;
}) {
  const { locale } = await params;
  const { session_id, token, order_refs, provider } = await searchParams;
  const t = await getTranslations("Commerce");

  const stripe = getStripeClient();
  let verified = false;
  let orderIds: string[] = [];

  if (stripe && session_id) {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    orderIds = session.metadata?.orderIds?.split(",").filter(Boolean) ?? [];

    if (session.payment_status === "paid") {
      await markOrdersPaid(orderIds, session.id);
      verified = true;
    }
  }

  if (!verified && provider === "paypal" && token && order_refs) {
    const capture = await capturePayPalCheckoutOrder(token);
    orderIds = order_refs.split(",").filter(Boolean);

    if (capture && (capture.status === "COMPLETED" || capture.status === "APPROVED")) {
      await markOrdersPaid(orderIds, capture.id);
      verified = true;
    }
  }

  const unlockedOrders = verified && orderIds.length > 0
    ? await prisma.order.findMany({
        where: {
          id: {
            in: orderIds
          }
        },
        include: {
          serviceTier: {
            include: {
              service: {
                select: {
                  catalogKey: true
                }
              }
            }
          }
        }
      })
    : [];

  const unlockedMagneticSocialBot = unlockedOrders.some(
    (order) => order.serviceTier.service.catalogKey === "magneticSocialBot"
  );
  const unlockedMagneticCommerce = unlockedOrders.some(
    (order) => order.serviceTier.service.catalogKey === "magneticCommerce"
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      {verified ? <ClearCartOnMount /> : null}
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-slate-950 sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{t("checkoutSuccessEyebrow")}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{t("checkoutSuccessTitle")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          {verified ? t("checkoutSuccessDescription") : t("checkoutSuccessPendingDescription")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {unlockedMagneticSocialBot ? (
            <Link
              href="/dashboard/magnetic-social-bot"
              locale={locale}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Open Magnetic Social Bot
            </Link>
          ) : null}
          {unlockedMagneticCommerce ? (
            <Link
              href="/dashboard/magnetic-commerce"
              locale={locale}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Open Magnetic Commerce
            </Link>
          ) : null}
          <Link
            href="/dashboard"
            locale={locale}
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {t("returnToDashboard")}
          </Link>
        </div>
      </section>
    </main>
  );
}
