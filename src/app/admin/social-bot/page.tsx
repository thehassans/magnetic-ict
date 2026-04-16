import { AdminSocialBotClient } from "@/components/admin/admin-social-bot-client";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSocialBotCustomers } from "@/lib/admin-social-bot";
import { requireAdmin } from "@/lib/admin";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export default async function AdminSocialBotPage({
  searchParams
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  await requireAdmin("/admin/social-bot");

  if (!hasDatabase) {
    return (
      <AdminShell
        title="Social Bot"
        description="Manage customer channel connections, documents, and inboxes from the admin panel."
        activePath="/admin/social-bot"
      >
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          Configure `DATABASE_URL` to unlock the admin Social Bot workspace.
        </div>
      </AdminShell>
    );
  }

  const [query, customers] = await Promise.all([searchParams, getAdminSocialBotCustomers()]);
  const selectedUserId = customers.some((customer) => customer.id === query.userId) ? (query.userId as string) : customers[0]?.id ?? "";

  return (
    <AdminShell
      title="Social Bot"
      description="Handle customer integrations, upload knowledge, and reply from one admin inbox."
      activePath="/admin/social-bot"
    >
      <AdminSocialBotClient customers={customers} selectedUserId={selectedUserId} />
    </AdminShell>
  );
}
