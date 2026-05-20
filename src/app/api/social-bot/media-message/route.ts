import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import { appendMessage } from "@/lib/social-bot-service";
import { createSocialBotId, socialBotCollections, findOneMongoDocument, findMongoDocuments, upsertMongoDocument } from "@/lib/social-bot-db";
import { decryptSecret } from "@/lib/social-bot-rag";
import type { SocialBotThread, SocialBotIntegration, SocialBotMessage } from "@/lib/social-bot-types";

export const runtime = "nodejs";

type MediaKind = "image" | "video";

function getMediaKind(file: File): MediaKind | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

function defaultMime(kind: MediaKind) {
  return kind === "image" ? "image/jpeg" : "video/mp4";
}

function defaultName(kind: MediaKind) {
  return kind === "image" ? "image.jpg" : "video.mp4";
}

function previewText(kind: MediaKind) {
  return kind === "image" ? "🖼 Image" : "🎥 Video";
}

async function sendOneMedia({
  file,
  thread,
  integration,
  userId
}: {
  file: File;
  thread: SocialBotThread;
  integration: SocialBotIntegration;
  userId: string;
}) {
  const kind = getMediaKind(file);
  if (!kind) throw new Error(`${file.name || "File"} is not a supported image or video.`);

  const accessToken = decryptSecret(integration.accessTokenEncrypted);
  const buffer = await file.arrayBuffer();
  const mimeType = file.type || defaultMime(kind);
  const fileName = file.name || defaultName(kind);
  const blob = new Blob([buffer], { type: mimeType });
  const now = new Date().toISOString();
  let metadata: Record<string, unknown> = { mediaType: kind, mimeType };

  if (thread.source === "WHATSAPP") {
    const phoneId = integration.phoneNumberId;
    const uploadForm = new FormData();
    uploadForm.append("messaging_product", "whatsapp");
    uploadForm.append("type", mimeType);
    uploadForm.append("file", new File([blob], fileName, { type: mimeType }));

    const uploadRes = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: uploadForm
    });

    if (!uploadRes.ok) {
      const err = (await uploadRes.json().catch(() => ({}))) as { error?: { message?: string } };
      throw new Error(err.error?.message ?? `${kind} upload failed.`);
    }

    const { id: mediaId } = (await uploadRes.json()) as { id: string };
    const sendRes = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: thread.externalThreadId,
        type: kind,
        [kind]: { id: mediaId }
      })
    });

    const sendPayload = (await sendRes.json().catch(() => ({}))) as { message_id?: string; messages?: Array<{ id?: string }>; error?: { message?: string } };
    if (!sendRes.ok) throw new Error(sendPayload.error?.message ?? "Send failed.");

    const dataUrl = `data:${mimeType};base64,${Buffer.from(buffer).toString("base64")}`;
    metadata = {
      mediaType: kind,
      mediaId,
      mimeType,
      ...(kind === "image" ? { imageUrl: dataUrl } : { videoUrl: dataUrl }),
      wamid: sendPayload.messages?.[0]?.id ?? sendPayload.message_id ?? null
    };
  } else {
    const pageId = integration.pageId;
    const sendForm = new FormData();
    sendForm.append("recipient", JSON.stringify({ id: thread.externalThreadId }));
    sendForm.append("messaging_type", "RESPONSE");
    sendForm.append("message", JSON.stringify({ attachment: { type: kind, payload: { is_reusable: false } } }));
    sendForm.append("filedata", new File([blob], fileName, { type: mimeType }));

    const sendUrl = pageId
      ? `https://graph.facebook.com/v25.0/${pageId}/messages?access_token=${encodeURIComponent(accessToken)}`
      : `https://graph.facebook.com/v25.0/me/messages?access_token=${encodeURIComponent(accessToken)}`;

    const sendRes = await fetch(sendUrl, { method: "POST", body: sendForm });
    const sendPayload = (await sendRes.json().catch(() => ({}))) as { message_id?: string; error?: { message?: string } };
    if (!sendRes.ok) throw new Error(sendPayload.error?.message ?? "Send failed.");

    const dataUrl = `data:${mimeType};base64,${Buffer.from(buffer).toString("base64")}`;
    metadata = {
      mediaType: kind,
      mimeType,
      ...(kind === "image" ? { imageUrl: dataUrl } : { videoUrl: dataUrl }),
      wamid: sendPayload.message_id ?? null
    };
  }

  const message: SocialBotMessage = {
    _id: createSocialBotId("sbm"),
    userId,
    threadId: thread._id,
    source: thread.source,
    direction: "OUTBOUND",
    role: "AGENT",
    text: previewText(kind),
    timestamp: now,
    deliveryStatus: "SENT",
    metadata
  };

  await appendMessage(message);
  await upsertMongoDocument(
    socialBotCollections.threads,
    { _id: thread._id, userId },
    { lastMessagePreview: previewText(kind), lastMessageAt: now, unreadCount: 0, updatedAt: now }
  );

  return message;
}

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
    const files = formData.getAll("media").filter((item): item is File => item instanceof File && item.size > 0);

    if (!threadId || files.length === 0) {
      return NextResponse.json({ error: "threadId and media files are required." }, { status: 400 });
    }

    const thread = await findOneMongoDocument<SocialBotThread>(socialBotCollections.threads, { _id: threadId, userId });
    if (!thread) return NextResponse.json({ error: "Thread not found." }, { status: 404 });

    const allIntegrations = await findMongoDocuments<SocialBotIntegration>(socialBotCollections.integrations, { userId });
    const integration = allIntegrations.find((item) => item.channel === thread.source && item.status === "CONNECTED");
    if (!integration) return NextResponse.json({ error: `${thread.source} not connected.` }, { status: 400 });

    const results: Array<{ ok: boolean; messageId?: string; name: string; error?: string }> = [];
    for (const file of files) {
      try {
        const message = await sendOneMedia({ file, thread, integration, userId });
        results.push({ ok: true, messageId: message._id, name: file.name });
      } catch (error) {
        results.push({ ok: false, name: file.name, error: error instanceof Error ? error.message : "Send failed." });
      }
    }

    const failed = results.filter((item) => !item.ok);
    return NextResponse.json({ ok: failed.length === 0, results }, { status: failed.length === results.length ? 502 : 200 });
  } catch (error) {
    console.error("media-message send error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send media." },
      { status: 500 }
    );
  }
}
