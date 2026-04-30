import { AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { markDomainOrdersCancelled } from "@/lib/domain-orders";

export default async function DomainCheckoutCancelPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order_refs?: string }>;
}) {
  const { locale } = await params;
  const { order_refs } = await searchParams;
  const orderIds = order_refs?.split(",").filter(Boolean) ?? [];

  if (orderIds.length > 0) {
    await markDomainOrdersCancelled(orderIds);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-slate-200 bg-white p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.28em] text-slate-500">Domain checkout</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Domain purchase cancelled</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">Your domain checkout was cancelled before payment completed. You can search again and retry whenever you’re ready.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/domains" locale={locale} className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800">
            Return to domain search
          </Link>
        </div>
      </section>
    </main>
  );
}
