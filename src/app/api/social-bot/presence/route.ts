import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import {
  createSocialBotId,
  socialBotCollections,
  findOneMongoDocument,
  upsertMongoDocument
} from "@/lib/social-bot-db";

export const runtime = "nodejs";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserPresence = {
  _id: string;
  userId: string;
  lastSeenAt: string;       // ISO — last heartbeat
  sessionStart: string;     // ISO — when current/last session started
  totalTimeMs: number;      // cumulative online time across all sessions (ms)
  sessionTimeMs: number;    // time in the current session (ms)
  status: "online" | "away" | "offline";
};

// ─── GET — fetch current user's presence ──────────────────────────────────────
export async function GET() {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const presence = await findOneMongoDocument<UserPresence>(
    socialBotCollections.presence,
    { userId: session.user.id }
  );

  return NextResponse.json({ ok: true, presence: presence ?? null });
}

// ─── POST — heartbeat ping ────────────────────────────────────────────────────
/**
 * Called every 30 s while the user has the app open.
 * Body: { sessionId: string }  — a stable UUID generated client-side per tab/session.
 *
 * Logic:
 *  - If existing record has the same sessionId and lastSeenAt < 2 min ago → add delta to sessionTimeMs + totalTimeMs
 *  - If lastSeenAt > 2 min ago (away/new session) → reset sessionStart + sessionTimeMs = 0, keep totalTimeMs
 *  - If no record → create fresh
 */
export async function POST(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const userId = session.user.id;
  const body = (await request.json().catch(() => ({}))) as { sessionId?: string };
  const sessionId = (body.sessionId ?? "").trim();
  const now = new Date();
  const nowIso = now.toISOString();
  const HEARTBEAT_INTERVAL_MS = 30_000;    // 30 s — client sends every 30 s
  const AWAY_THRESHOLD_MS     = 120_000;   // 2 min gap → consider new session

  const existing = await findOneMongoDocument<UserPresence & { sessionId?: string }>(
    socialBotCollections.presence,
    { userId }
  );

  let totalTimeMs   = existing?.totalTimeMs   ?? 0;
  let sessionTimeMs = existing?.sessionTimeMs ?? 0;
  let sessionStart  = existing?.sessionStart  ?? nowIso;

  if (existing) {
    const lastSeen = new Date(existing.lastSeenAt).getTime();
    const gapMs    = now.getTime() - lastSeen;

    if (gapMs < AWAY_THRESHOLD_MS) {
      // Active session — add the gap (capped at heartbeat interval to avoid counting background tabs)
      const delta  = Math.min(gapMs, HEARTBEAT_INTERVAL_MS + 5_000);
      totalTimeMs   += delta;
      sessionTimeMs += delta;
    } else {
      // Gap too large → new session
      sessionStart  = nowIso;
      sessionTimeMs = 0;
    }
  }

  await upsertMongoDocument(
    socialBotCollections.presence,
    { userId },
    {
      lastSeenAt:    nowIso,
      sessionStart,
      totalTimeMs,
      sessionTimeMs,
      sessionId:     sessionId || undefined,
      status:        "online"
    },
    {
      _id:       existing?._id ?? createSocialBotId("sbpr"),
      userId,
      createdAt: existing ? undefined : nowIso
    }
  );

  return NextResponse.json({
    ok: true,
    totalTimeMs,
    sessionTimeMs,
    lastSeenAt: nowIso
  });
}
