import { AdminShell } from "@/components/admin/admin-shell";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdmin("/admin/analytics");
  return (
    <AdminShell
      title="Analytics & Engagement"
      eyebrow="PostHog"
      description="User lifecycle events, DAU trends, and conversion funnels"
    >
      <AnalyticsDashboard />
    </AdminShell>
  );
}
