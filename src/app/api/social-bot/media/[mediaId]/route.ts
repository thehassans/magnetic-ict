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
    const url2 = new URL(request.url);
    const phoneHint = url2.searchParams.get("ph") ?? "";

    const integrations = await findMongoDocuments<SocialBotIntegration>(
      socialBotCollections.integrations,
      { userId, status: "CONNECTED" }
    );
    if (!integrations.length) return NextResponse.json({ error: "No connected integration." }, { status: 400 });

    // Prefer the integration matching the phoneNumberId hint
    const sorted = phoneHint
      ? [...integrations].sort((a, b) => (a.phoneNumberId === phoneHint ? -1 : b.phoneNumberId === phoneHint ? 1 : 0))
      : integrations;

    let lastErr = "";
    for (const integration of sorted) {
      const accessToken = decryptSecret(integration.accessTokenEncrypted);
      if (!accessToken) continue;

      // Step 1: resolve media URL from Meta
      const metaRes = await fetch(`https://graph.facebook.com/v25.0/${mediaId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!metaRes.ok) { lastErr = `Meta ${metaRes.status}`; continue; }
      const metaJson = (await metaRes.json()) as { url?: string; error?: { message?: string } };
      if (!metaJson.url) { lastErr = metaJson.error?.message ?? "no url"; continue; }

      // Step 2: download media and proxy to client
      const mediaRes = await fetch(metaJson.url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!mediaRes.ok) { lastErr = `Media ${mediaRes.status}`; continue; }

      const contentType = mediaRes.headers.get("content-type") ?? "application/octet-stream";
      const buffer = await mediaRes.arrayBuffer();

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "private, max-age=3600"
        }
      });
    }

    return NextResponse.json({ error: `Media fetch failed: ${lastErr}` }, { status: 502 });
  } catch (error) {
    console.error("media proxy error", error);
    return NextResponse.json({ error: "Media fetch failed." }, { status: 500 });
  }
}
