type AdminDomainOrder = {
  _id: string;
  domain: string;
  customerEmail: string;
  registrantContact?: {
    firstName: string;
    lastName: string;
    organization: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  years: number;
  amount: number;
  paymentMethod: string;
  status: string;
  errorMessage: string | null;
  registrarReference: string | null;
  updatedAt: string;
};

type AdminManagedDomain = {
  _id: string;
  domain: string;
  userId: string;
  status: string;
  autoRenew: boolean;
  renewalPrice: number;
  provider: string;
  registrarReference: string | null;
  nameservers: string[];
  registeredAt: string | null;
  expiresAt: string | null;
  errorMessage: string | null;
  updatedAt: string;
};

function getTone(status: string) {
  switch (status) {
    case "active":
    case "registered":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function AdminDomainsClient({ orders, managedDomains }: { orders: AdminDomainOrder[]; managedDomains: AdminManagedDomain[] }) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Managed domains</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live domain state, registrar references, renewal posture, and nameserver assignments.</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">{managedDomains.length} domains</div>
        </div>
        <div className="space-y-4">
          {managedDomains.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
              No managed domains yet.
            </div>
          ) : managedDomains.map((domain) => (
            <section key={domain._id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_18px_70px_rgba(2,6,23,0.45)] sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Provider: {domain.provider}</div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{domain.domain}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Renewal ${domain.renewalPrice.toFixed(2)} · Auto-renew {domain.autoRenew ? "enabled" : "disabled"}</p>
                </div>
                <div className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold ${getTone(domain.status)}`}>
                  {domain.status}
                </div>
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <div className="font-semibold text-slate-950 dark:text-white">Registrar reference</div>
                  <div className="mt-2 break-all">{domain.registrarReference ?? "Pending"}</div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <div className="font-semibold text-slate-950 dark:text-white">Registered</div>
                  <div className="mt-2">{formatDate(domain.registeredAt)}</div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <div className="font-semibold text-slate-950 dark:text-white">Expires</div>
                  <div className="mt-2">{formatDate(domain.expiresAt)}</div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <div className="font-semibold text-slate-950 dark:text-white">Last updated</div>
                  <div className="mt-2">{formatDate(domain.updatedAt)}</div>
                </div>
              </div>
              <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                <div className="font-semibold text-slate-950 dark:text-white">Nameservers</div>
                <div className="mt-2 break-all">{domain.nameservers.length > 0 ? domain.nameservers.join(", ") : "None assigned yet"}</div>
              </div>
              {domain.errorMessage ? <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">{domain.errorMessage}</div> : null}
            </section>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Domain checkout orders</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Raw order, payment, and registrant intake records before and after activation.</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">{orders.length} orders</div>
        </div>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
              No domain orders yet.
            </div>
          ) : orders.map((order) => (
            <section key={order._id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_18px_70px_rgba(2,6,23,0.45)] sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{order.customerEmail}</div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{order.domain}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{order.years} year registration · {order.paymentMethod} · ${order.amount.toFixed(2)}</p>
                </div>
                <div className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold ${getTone(order.status)}`}>
                  {order.status}
                </div>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <div className="font-semibold text-slate-950 dark:text-white">Registrar reference</div>
                  <div className="mt-2 break-all">{order.registrarReference ?? "Not registered yet"}</div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <div className="font-semibold text-slate-950 dark:text-white">Registrant</div>
                  <div className="mt-2">{order.registrantContact ? `${order.registrantContact.firstName} ${order.registrantContact.lastName}` : "Legacy order"}</div>
                  <div>{order.registrantContact?.email ?? order.customerEmail}</div>
                  <div>{order.registrantContact?.country ?? "Unknown"}</div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  <div className="font-semibold text-slate-950 dark:text-white">Last updated</div>
                  <div className="mt-2">{formatDate(order.updatedAt)}</div>
                </div>
              </div>
              {order.errorMessage ? <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">{order.errorMessage}</div> : null}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
