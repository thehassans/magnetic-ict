import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { getDomainOrdersForUser } from "@/lib/domain-db";

function getTone(status: string) {
  switch (status) {
    case "registered":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default async function DashboardDomainsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const orders = await getDomainOrdersForUser(session.user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Domain management</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Your domains</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">Review purchased domains, payment state, and registration progress from your signed-in dashboard.</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/domains" locale={locale} className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800">
            Search another domain
          </Link>
          <Link href="/dashboard" locale={locale} className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
            Back to dashboard
          </Link>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">You have not purchased any domains yet.</div>
        ) : null}
        {orders.map((order) => (
          <div key={order._id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-950">{order.domain}</div>
                <div className="mt-2 text-sm text-slate-500">{order.years} year registration · {order.paymentMethod} · ${order.amount.toFixed(2)}</div>
                {order.invoiceNumber ? <div className="mt-2 text-sm text-slate-500">Invoice: {order.invoiceNumber}</div> : null}
              </div>
              <div className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold ${getTone(order.status)}`}>
                {order.status}
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-semibold text-slate-950">Payment reference</div>
                <div className="mt-2 break-all">{order.paymentReference ?? "Pending"}</div>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-semibold text-slate-950">Registrar reference</div>
                <div className="mt-2 break-all">{order.registrarReference ?? "Not registered yet"}</div>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="font-semibold text-slate-950">Last updated</div>
                <div className="mt-2">{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.updatedAt))}</div>
              </div>
            </div>
            {order.errorMessage ? <div className="mt-4 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{order.errorMessage}</div> : null}
          </div>
        ))}
      </section>
    </main>
  );
}
