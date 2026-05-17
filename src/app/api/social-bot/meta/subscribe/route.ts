import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { findOneMongoDocument, socialBotCollections } from "@/lib/social-bot-db";
import { decryptSecret } from "@/lib/social-bot-rag";
import type { SocialBotIntegration } from "@/lib/social-bot-types";

export const runtime = "nodejs";

const SUBSCRIBED_FIELDS = [
  "messages",
  "messaging_postbacks",
  "messaging_optins",
  "message_deliveries",
  "message_reads"
].join(",");

/**
 * Subscribes a connected Facebook page to this app's webhook so Facebook
 * starts delivering messages to /api/social-bot/meta/webhook.
 * Body: { pageId: string }
 */
export async function POST(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { pageId } = (await request.json()) as { pageId?: string };
    if (!pageId) return NextResponse.json({ error: "pageId required." }, { status: 400 });

    const integration = await findOneMongoDocument<SocialBotIntegration>(
      socialBotCollections.integrations,
      { userId: session.user.id, channel: "MESSENGER", pageId }
    );

    if (!integration?.accessTokenEncrypted) {
      return NextResponse.json({ error: "No access token found for this page." }, { status: 400 });
    }

    const pageToken = decryptSecret(integration.accessTokenEncrypted);

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}/subscribed_apps` +
      `?subscribed_fields=${encodeURIComponent(SUBSCRIBED_FIELDS)}` +
      `&access_token=${encodeURIComponent(pageToken)}`,
      { method: "POST", signal: AbortSignal.timeout(8000) }
    );

    const data = await res.json() as { success?: boolean; error?: { message?: string } };

    if (!res.ok || !data.success) {
      return NextResponse.json({ error: data.error?.message ?? "Subscription failed." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: `Page ${pageId} subscribed to webhook.` });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error." }, { status: 500 });
  }
}
