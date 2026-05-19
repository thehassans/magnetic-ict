import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import { findMongoDocuments, socialBotCollections } from "@/lib/social-bot-db";
import { decryptSecret } from "@/lib/social-bot-rag";
import type { SocialBotIntegration } from "@/lib/social-bot-types";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const workspace = await getWorkspaceContext(session.user.id);
  const userId = workspace.ownerId;
  const { mediaId } = await params;

  try {
    const integrations = await findMongoDocuments<SocialBotIntegration>(
      socialBotCollections.integrations,
      { userId, status: "CONNECTED" }
    );
    const integration = integrations[0];
    if (!integration) return NextResponse.json({ error: "No connected integration." }, { status: 400 });

    const accessToken = decryptSecret(integration.accessTokenEncrypted);

    // Step 1: get media URL from Meta
    const metaRes = await fetch(`https://graph.facebook.com/v25.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!metaRes.ok) return NextResponse.json({ error: "Media not found." }, { status: 404 });
    const { url } = (await metaRes.json()) as { url: string };

    // Step 2: download media and proxy to client
    const mediaRes = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!mediaRes.ok) return NextResponse.json({ error: "Failed to fetch media." }, { status: 502 });

    const contentType = mediaRes.headers.get("content-type") ?? "audio/ogg";
    const buffer = await mediaRes.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch (error) {
    console.error("media proxy error", error);
    return NextResponse.json({ error: "Media fetch failed." }, { status: 500 });
  }
}
