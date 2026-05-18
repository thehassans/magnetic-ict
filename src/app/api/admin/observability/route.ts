import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminUser } from "@/lib/admin";
import { findMongoDocuments } from "@/lib/social-bot-db";

const ERROR_COLLECTION = "ApiErrors";

type ErrorRecord = {
  _id: string;
  requestId: string;
  route: string;
  method: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  resolved: boolean;
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !(await isAdminUser(session.user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "200"), 500);

  const errors = await findMongoDocuments<ErrorRecord>(
    ERROR_COLLECTION,
    { resolved: false },
    { sort: { timestamp: -1 }, limit }
  );

  // Aggregate: errors by day (last 14 days)
  const now = Date.now();
  const days: Record<string, number> = {};
  for (let d = 13; d >= 0; d--) {
    const date = new Date(now - d * 86_400_000).toISOString().slice(0, 10);
    days[date] = 0;
  }

  for (const err of errors) {
    const date = err.timestamp.slice(0, 10);
    if (date in days) days[date]++;
  }

  // Aggregate: by severity
  const bySeverity: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const err of errors) {
    bySeverity[err.severity] = (bySeverity[err.severity] ?? 0) + 1;
  }

  // Aggregate: top routes
  const byRoute: Record<string, number> = {};
  for (const err of errors) {
    byRoute[err.route] = (byRoute[err.route] ?? 0) + 1;
  }
  const topRoutes = Object.entries(byRoute)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([route, count]) => ({ route, count }));

  return NextResponse.json({
    total: errors.length,
    errorsByDay: Object.entries(days).map(([date, count]) => ({ date, count })),
    bySeverity: Object.entries(bySeverity).map(([severity, count]) => ({ severity, count })),
    topRoutes,
    recent: errors.slice(0, 50).map((e) => ({
      id: e._id,
      requestId: e.requestId,
      route: e.route,
      method: e.method,
      message: e.message,
      severity: e.severity,
      timestamp: e.timestamp,
    })),
  });
}
