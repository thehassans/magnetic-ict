import { AdminShell } from "@/components/admin/admin-shell";
import { ObservabilityDashboard } from "@/components/admin/observability-dashboard";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function ObservabilityPage() {
  await requireAdmin("/admin/observability");
  return (
    <AdminShell
      title="Observability"
      eyebrow="System Health"
      description="Live error tracking across all API routes"
    >
      <ObservabilityDashboard />
    </AdminShell>
  );
}
