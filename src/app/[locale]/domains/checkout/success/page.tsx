import { CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { markDomainOrdersPaid } from "@/lib/domain-orders";
import { capturePayPalCheckoutOrder, getStripeClient } from "@/lib/payments";

export default async function DomainCheckoutSuccessPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string; token?: string; order_refs?: string; provider?: string }>;
}) {
  const { locale } = await params;
  const { session_id, token, order_refs, provider } = await searchParams;
  const session = await auth();

  const stripe = getStripeClient();
  let verified = false;
  let orderIds: string[] = [];

  if (stripe && session_id) {
    const stripeSession = await stripe.checkout.sessions.retrieve(session_id);
    orderIds = stripeSession.metadata?.domainOrderIds?.split(",").filter(Boolean) ?? [];

    if (stripeSession.payment_status === "paid" && stripeSession.id) {
      await markDomainOrdersPaid(orderIds, stripeSession.id);
      verified = true;
    }
  }

  if (!verified && provider === "paypal" && token && order_refs) {
    const capture = await capturePayPalCheckoutOrder(token);
    orderIds = order_refs.split(",").filter(Boolean);

    if (capture && (capture.status === "COMPLETED" || capture.status === "APPROVED")) {
      await markDomainOrdersPaid(orderIds, capture.id);
      verified = true;
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-slate-200 bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.28em] text-slate-500">Domain checkout</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{verified ? "Your domain order is confirmed" : "Domain payment is still processing"}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          {verified ? "Your domain payment was captured successfully. Registration will now follow the mode configured in admin settings." : "We have not verified the payment yet. Refresh this page in a moment or contact support if the status does not update."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/domains" locale={locale} className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800">
            Search another domain
          </Link>
          <Link href="/dashboard" locale={locale} className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            {session?.user ? "Open dashboard" : "Continue browsing"}
          </Link>
        </div>
      </section>
    </main>
  );
}
