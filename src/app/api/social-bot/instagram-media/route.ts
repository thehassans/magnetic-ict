import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import { findOneMongoDocument, socialBotCollections } from "@/lib/social-bot-db";
import { decryptSecret } from "@/lib/social-bot-rag";
import type { SocialBotIntegration } from "@/lib/social-bot-types";

export const runtime = "nodejs";

const GRAPH_BASE = "https://graph.facebook.com/v25.0";

// ─── Types ────────────────────────────────────────────────────────────────────

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
};

type InstagramMediaListResponse = {
  data?: InstagramMedia[];
  paging?: { cursors?: { before?: string; after?: string }; next?: string };
  error?: { message?: string };
};

type InstagramSingleMediaResponse = InstagramMedia & {
  error?: { message?: string };
};

type InstagramCommentsResponse = {
  data?: Array<{
    id: string;
    text: string;
    timestamp: string;
    username?: string;
  }>;
  error?: { message?: string };
};

type InstagramInsightsResponse = {
  data?: Array<{ name: string; values: Array<{ value: number }>; period: string; title: string }>;
  error?: { message?: string };
};

// ─── Helper ───────────────────────────────────────────────────────────────────

async function resolveInstagramToken(ownerId: string): Promise<{ token: string; accountId: string } | null> {
  // 1. Check per-user integration stored in MongoDB
  const integration = await findOneMongoDocument<SocialBotIntegration>(
    socialBotCollections.integrations,
    { userId: ownerId, channel: "INSTAGRAM" }
  );

  if (integration?.status === "CONNECTED" && integration.accessTokenEncrypted) {
    return {
      token: decryptSecret(integration.accessTokenEncrypted),
      accountId: integration.accountId
    };
  }

  // 2. Fall back to environment variable (for the long-lived token you exchange)
  const envToken = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN?.trim();
  const envAccountId = process.env.INSTAGRAM_ACCOUNT_ID?.trim();
  if (envToken && envAccountId) {
    return { token: envToken, accountId: envAccountId };
  }

  return null;
}

// ─── Route handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/social-bot/instagram-media
 *
 * Query params:
 *   action=list            — paginated media list (default)
 *   action=single&id=...   — single media object with full fields
 *   action=comments&id=... — comments on a media object
 *   action=insights&id=... — engagement insights for a media object
 *   after=<cursor>         — pagination cursor for list
 *   limit=<number>         — max items per page (default 10, max 50)
 *
 * All calls are authenticated using the Instagram Page Access Token stored
 * either in the Social Bot integration settings or in INSTAGRAM_PAGE_ACCESS_TOKEN env var.
 */
export async function GET(request: Request) {
  // ── Auth gate ────────────────────────────────────────────────────────────
  const session = await getRequiredUserSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const workspace = await getWorkspaceContext(session.user.id);
  const creds = await resolveInstagramToken(workspace.ownerId);

  if (!creds) {
    return NextResponse.json(
      {
        error:
          "Instagram is not connected. Save a connected Instagram integration in the Social Bot settings, or set INSTAGRAM_PAGE_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID in your .env."
      },
      { status: 503 }
    );
  }

  const { token, accountId } = creds;
  const { searchParams } = new URL(request.url);
  const action = (searchParams.get("action") ?? "list").toLowerCase();
  const mediaId = (searchParams.get("id") ?? "").trim();
  const after = (searchParams.get("after") ?? "").trim();
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)), 50);

  try {
    // ── action=list ──────────────────────────────────────────────────────────
    if (action === "list") {
      const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
      let url =
        `${GRAPH_BASE}/${encodeURIComponent(accountId)}/media` +
        `?fields=${encodeURIComponent(fields)}` +
        `&limit=${limit}` +
        `&access_token=${encodeURIComponent(token)}`;
      if (after) url += `&after=${encodeURIComponent(after)}`;

      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const data: InstagramMediaListResponse = await res.json();

      if (!res.ok || data.error) {
        return NextResponse.json(
          { error: data.error?.message ?? "Failed to fetch Instagram media." },
          { status: res.status }
        );
      }

      return NextResponse.json({ ok: true, media: data.data ?? [], paging: data.paging ?? null });
    }

    // ── action=single ────────────────────────────────────────────────────────
    if (action === "single") {
      if (!mediaId) {
        return NextResponse.json({ error: "id is required for action=single." }, { status: 400 });
      }
      const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
      const url =
        `${GRAPH_BASE}/${encodeURIComponent(mediaId)}` +
        `?fields=${encodeURIComponent(fields)}` +
        `&access_token=${encodeURIComponent(token)}`;

      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const data: InstagramSingleMediaResponse = await res.json();

      if (!res.ok || data.error) {
        return NextResponse.json(
          { error: (data as { error?: { message?: string } }).error?.message ?? "Failed to fetch media." },
          { status: res.status }
        );
      }

      return NextResponse.json({ ok: true, media: data });
    }

    // ── action=comments ──────────────────────────────────────────────────────
    if (action === "comments") {
      if (!mediaId) {
        return NextResponse.json({ error: "id is required for action=comments." }, { status: 400 });
      }
      const url =
        `${GRAPH_BASE}/${encodeURIComponent(mediaId)}/comments` +
        `?fields=id,text,timestamp,username` +
        `&limit=${limit}` +
        `&access_token=${encodeURIComponent(token)}`;

      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const data: InstagramCommentsResponse = await res.json();

      if (!res.ok || data.error) {
        return NextResponse.json(
          { error: data.error?.message ?? "Failed to fetch comments." },
          { status: res.status }
        );
      }

      return NextResponse.json({ ok: true, comments: data.data ?? [] });
    }

    // ── action=insights ──────────────────────────────────────────────────────
    if (action === "insights") {
      if (!mediaId) {
        return NextResponse.json({ error: "id is required for action=insights." }, { status: 400 });
      }
      // Note: insights are only available for Business/Creator accounts
      const url =
        `${GRAPH_BASE}/${encodeURIComponent(mediaId)}/insights` +
        `?metric=impressions,reach,saved,video_views` +
        `&access_token=${encodeURIComponent(token)}`;

      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const data: InstagramInsightsResponse = await res.json();

      if (!res.ok || data.error) {
        return NextResponse.json(
          { error: data.error?.message ?? "Failed to fetch insights." },
          { status: res.status }
        );
      }

      return NextResponse.json({ ok: true, insights: data.data ?? [] });
    }

    return NextResponse.json(
      { error: `Unknown action '${action}'. Valid values: list, single, comments, insights.` },
      { status: 400 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unexpected error." },
      { status: 500 }
    );
  }
}
