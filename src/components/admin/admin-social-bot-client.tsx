"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Settings2, Users } from "lucide-react";
import { AdminCustomerSocialBotWorkspace } from "@/components/admin/admin-customer-social-bot-workspace";
import type { AdminSocialBotCustomer } from "@/lib/admin-social-bot";

type AdminSocialBotClientProps = {
  customers: AdminSocialBotCustomer[];
  selectedUserId: string;
};

export function AdminSocialBotClient({ customers, selectedUserId }: AdminSocialBotClientProps) {
  const router = useRouter();
  const selectedCustomer = customers.find((customer) => customer.id === selectedUserId) ?? customers[0] ?? null;

  if (!selectedCustomer) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
        No Magnetic Social Bot customers are available yet. Once a customer purchases the service, their inbox and integration controls will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Customer context</div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-700">Choose customer</span>
              <select
                value={selectedCustomer.id}
                onChange={(event) => router.push(`/admin/social-bot?userId=${encodeURIComponent(event.target.value)}`)}
                className="h-12 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name || customer.email}
                  </option>
                ))}
              </select>
            </label>
            <Link
              href="/admin/settings"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
            >
              <Settings2 className="h-4 w-4" />
              Open platform settings
            </Link>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3 xl:grid-cols-1">
          <StatCard label="Selected customer" value={selectedCustomer.name || selectedCustomer.email} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Orders" value={String(selectedCustomer.orderCount)} icon={<Bot className="h-4 w-4" />} />
          <StatCard label="Joined" value={new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(selectedCustomer.createdAt))} icon={<Users className="h-4 w-4" />} />
        </div>
      </section>

      <AdminCustomerSocialBotWorkspace
        userId={selectedCustomer.id}
        customerLabel={selectedCustomer.name || selectedCustomer.email}
      />
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">{icon}</div>
      <div className="mt-5 text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-base font-semibold tracking-tight text-slate-950">{value}</div>
    </div>
  );
}
