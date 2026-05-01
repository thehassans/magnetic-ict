type HostingProvision = {
  _id: string;
  orderId: string;
  customerEmail: string;
  customerName: string | null;
  tierName: string;
  status: string;
  errorMessage: string | null;
  updatedAt: string;
  configuration: {
    controlPanelName: string | null;
    addonNames: string[];
    locationName: string | null;
    extraMonthlyPrice: number;
    summaryLines: string[];
  };
  reseller: {
    contractId: string | null;
    adminId: string | null;
  };
  cloud: {
    datacenterId: string | null;
    serverId: string | null;
    volumeId: string | null;
    location: string | null;
  };
};

function getTone(status: string) {
  switch (status) {
    case "provisioned":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export function AdminHostingClient({ provisions }: { provisions: HostingProvision[] }) {
  return (
    <div className="space-y-4">
      {provisions.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          No Magnetic VPS Hosting provisions yet. Fulfilled hosting orders will appear here.
        </div>
      ) : null}
      {provisions.map((provision) => (
        <section key={provision._id} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-sm text-slate-500">{provision.customerEmail}</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Magnetic VPS Hosting · {provision.tierName}</h2>
              <p className="mt-2 text-sm text-slate-600">Order ID: {provision.orderId}</p>
            </div>
            <div className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold ${getTone(provision.status)}`}>
              {provision.status}
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-950">Configuration</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Control panel: {provision.configuration.controlPanelName ?? "None"}</div>
                <div>Region: {provision.configuration.locationName ?? "Default"}</div>
                <div>Configuration uplift: ${provision.configuration.extraMonthlyPrice.toFixed(2)}</div>
                <div>Add-ons: {provision.configuration.addonNames.length ? provision.configuration.addonNames.join(", ") : "None"}</div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-950">Reseller</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Contract ID: {provision.reseller.contractId ?? "Pending"}</div>
                <div>Admin ID: {provision.reseller.adminId ?? "Pending"}</div>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-950">Cloud</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div>Location: {provision.cloud.location ?? "Pending"}</div>
                <div>Data center ID: {provision.cloud.datacenterId ?? "Pending"}</div>
                <div>Server ID: {provision.cloud.serverId ?? "Pending"}</div>
                <div>Volume ID: {provision.cloud.volumeId ?? "Pending"}</div>
              </div>
            </div>
          </div>
          {provision.errorMessage ? (
            <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {provision.errorMessage}
            </div>
          ) : null}
          <div className="mt-5 text-xs uppercase tracking-[0.22em] text-slate-400">
            Last updated {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(provision.updatedAt))}
          </div>
        </section>
      ))}
    </div>
  );
}
