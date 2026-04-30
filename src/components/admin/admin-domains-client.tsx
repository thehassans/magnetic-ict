type AdminDomainOrder = {
  _id: string;
  domain: string;
  customerEmail: string;
  years: number;
  amount: number;
  paymentMethod: string;
  status: string;
  errorMessage: string | null;
  registrarReference: string | null;
  updatedAt: string;
};

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

export function AdminDomainsClient({ orders }: { orders: AdminDomainOrder[] }) {
  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          No domain orders yet.
        </div>
      ) : null}
      {orders.map((order) => (
        <section key={order._id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm text-slate-500">{order.customerEmail}</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{order.domain}</h2>
              <p className="mt-2 text-sm text-slate-600">{order.years} year registration · {order.paymentMethod} · ${order.amount.toFixed(2)}</p>
            </div>
            <div className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold ${getTone(order.status)}`}>
              {order.status}
            </div>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <div className="font-semibold text-slate-950">Registrar reference</div>
              <div className="mt-2">{order.registrarReference ?? "Not registered yet"}</div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <div className="font-semibold text-slate-950">Last updated</div>
              <div className="mt-2">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.updatedAt))}</div>
            </div>
          </div>
          {order.errorMessage ? <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{order.errorMessage}</div> : null}
        </section>
      ))}
    </div>
  );
}
