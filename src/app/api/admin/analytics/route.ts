import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

const POSTHOG_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_HOST = process.env.POSTHOG_HOST ?? "https://app.posthog.com";

async function phFetch(path: string) {
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) return null;
  const res = await fetch(`${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}${path}`, {
    headers: { Authorization: `Bearer ${POSTHOG_API_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !(await isAdminUser(session.user.email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // If PostHog not configured, return demo data
  if (!POSTHOG_API_KEY || !POSTHOG_PROJECT_ID) {
    return NextResponse.json({
      _demo: true,
      message: "Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID to see real data.",
      dau: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 50) + 10,
      })),
      topEvents: [
        { event: "user_login", count: 142 },
        { event: "chatbot_accessed", count: 87 },
        { event: "invite_sent", count: 34 },
        { event: "channel_connected", count: 23 },
        { event: "order_placed", count: 12 },
      ],
      funnel: [
        { step: "Landing Page", users: 1200 },
        { step: "Sign Up", users: 340 },
        { step: "Chatbot Access", users: 180 },
        { step: "First Message", users: 95 },
      ],
    });
  }

  // Fetch real data from PostHog API
  const [events] = await Promise.all([
    phFetch("/events/?limit=1000"),
  ]);

  const eventList = (events as { results?: { event: string; timestamp: string }[] })?.results ?? [];

  // Compute DAU for last 14 days
  const dauMap: Record<string, Set<string>> = {};
  for (const e of eventList) {
    const date = e.timestamp?.slice(0, 10);
    if (date) {
      dauMap[date] = dauMap[date] ?? new Set();
    }
  }

  const dau = Object.entries(dauMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, set]) => ({ date, count: set.size }));

  // Top events
  const eventCounts: Record<string, number> = {};
  for (const e of eventList) {
    eventCounts[e.event] = (eventCounts[e.event] ?? 0) + 1;
  }
  const topEvents = Object.entries(eventCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([event, count]) => ({ event, count }));

  return NextResponse.json({ dau, topEvents, funnel: [] });
}
