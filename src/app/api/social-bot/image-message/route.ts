import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import { appendMessage } from "@/lib/social-bot-service";
import { createSocialBotId, socialBotCollections, findOneMongoDocument, findMongoDocuments, upsertMongoDocument } from "@/lib/social-bot-db";
import { decryptSecret } from "@/lib/social-bot-rag";
import type { SocialBotThread, SocialBotIntegration } from "@/lib/social-bot-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const workspace = await getWorkspaceContext(session.user.id);
  const userId = workspace.ownerId;

  try {
    const formData = await request.formData();
    const threadId = formData.get("threadId") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (!threadId || !imageFile) {
      return NextResponse.json({ error: "threadId and image are required." }, { status: 400 });
    }

    const thread = await findOneMongoDocument<SocialBotThread>(
      socialBotCollections.threads,
      { _id: threadId, userId }
    );
    if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });

    const allIntegrations = await findMongoDocuments<SocialBotIntegration>(
      socialBotCollections.integrations,
      { userId }
    );
    const integration = allIntegrations.find(
      (i: SocialBotIntegration) => i.channel === thread.source && i.status === "CONNECTED"
    );
    if (!integration) {
      return NextResponse.json({ error: `${thread.source} not connected.` }, { status: 400 });
    }

    const accessToken = decryptSecret(integration.accessTokenEncrypted);
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: imageFile.type || "image/jpeg" });
    const now = new Date().toISOString();
    let msgMetadata: Record<string, unknown> = { mediaType: "image" };

    if (thread.source === "WHATSAPP") {
      const phoneId = integration.phoneNumberId;

      // 1. Upload image to WhatsApp Media API
      const uploadForm = new FormData();
      uploadForm.append("messaging_product", "whatsapp");
      uploadForm.append("type", imageFile.type || "image/jpeg");
      uploadForm.append("file", new File([imageBlob], imageFile.name || "image.jpg", { type: imageFile.type || "image/jpeg" }));

      const uploadRes = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: uploadForm
      });

      if (!uploadRes.ok) {
        const err = (await uploadRes.json().catch(() => ({}))) as { error?: { message?: string } };
        return NextResponse.json({ error: err.error?.message ?? "Image upload failed." }, { status: 502 });
      }

      const { id: mediaId } = (await uploadRes.json()) as { id: string };

      // 2. Send image message via WhatsApp
      const sendRes = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: thread.externalThreadId,
          type: "image",
          image: { id: mediaId }
        })
      });

      const sendPayload = (await sendRes.json().catch(() => ({}))) as { message_id?: string; error?: { message?: string } };
      if (!sendRes.ok) {
        return NextResponse.json({ error: sendPayload.error?.message ?? "Send failed." }, { status: 502 });
      }
      msgMetadata = { mediaType: "image", mediaId, wamid: sendPayload.message_id ?? null };

    } else {
      // Messenger / Instagram — multipart attachment send
      const pageId = integration.pageId;
      const sendForm = new FormData();
      sendForm.append("recipient", JSON.stringify({ id: thread.externalThreadId }));
      sendForm.append("message", JSON.stringify({
        attachment: { type: "image", payload: { is_reusable: true } }
      }));
      sendForm.append("filedata", new File([imageBlob], imageFile.name || "image.jpg", { type: imageFile.type || "image/jpeg" }));

      const sendUrl = pageId
        ? `https://graph.facebook.com/v25.0/${pageId}/messages?access_token=${encodeURIComponent(accessToken)}`
        : `https://graph.facebook.com/v25.0/me/messages?access_token=${encodeURIComponent(accessToken)}`;

      const sendRes = await fetch(sendUrl, { method: "POST", body: sendForm });
      const sendPayload = (await sendRes.json().catch(() => ({}))) as { message_id?: string; error?: { message?: string } };
      if (!sendRes.ok) {
        return NextResponse.json({ error: sendPayload.error?.message ?? "Send failed." }, { status: 502 });
      }
      const imageUrl = imageBuffer.byteLength <= 800_000
        ? `data:${imageFile.type || "image/jpeg"};base64,${Buffer.from(imageBuffer).toString("base64")}`
        : undefined;
      msgMetadata = { mediaType: "image", ...(imageUrl ? { imageUrl } : {}), wamid: sendPayload.message_id ?? null };
    }

    const previewText = "🖼 Image";
    const msg = {
      _id: createSocialBotId("sbm"),
      userId,
      threadId: thread._id,
      source: thread.source,
      direction: "OUTBOUND" as const,
      role: "AGENT" as const,
      text: previewText,
      timestamp: now,
      deliveryStatus: "SENT" as const,
      metadata: msgMetadata
    };

    await appendMessage(msg);
    await upsertMongoDocument(
      socialBotCollections.threads,
      { _id: thread._id, userId },
      { lastMessagePreview: previewText, lastMessageAt: now, unreadCount: 0, updatedAt: now }
    );

    return NextResponse.json({ ok: true, messageId: msg._id });
  } catch (error) {
    console.error("image-message send error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send image." },
      { status: 500 }
    );
  }
}
