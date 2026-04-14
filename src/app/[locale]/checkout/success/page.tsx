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

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {verified ? <ClearCartOnMount /> : null}
      <section className="rounded-[36px] border border-violet-100 bg-white/85 p-8 text-center shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">{t("checkoutSuccessEyebrow")}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{t("checkoutSuccessTitle")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
          {verified ? t("checkoutSuccessDescription") : t("checkoutSuccessPendingDescription")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {unlockedMagneticSocialBot ? (
            <Link
              href="/dashboard/magnetic-social-bot"
              locale={locale}
              className="inline-flex h-12 items-center justify-center rounded-full bg-cyan-600 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-500"
            >
              Open Magnetic Social Bot
            </Link>
          ) : null}
          <Link
            href="/dashboard"
            locale={locale}
            className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-700"
          >
            {t("returnToDashboard")}
          </Link>
          <Link
            href="/services"
            locale={locale}
            className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            {t("continueExploring")}
          </Link>
        </div>
      </section>
    </main>
  );
}
