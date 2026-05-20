import { NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import { appendMessage } from "@/lib/social-bot-service";
import { createSocialBotId, socialBotCollections, findOneMongoDocument, findMongoDocuments, upsertMongoDocument } from "@/lib/social-bot-db";
import { decryptSecret } from "@/lib/social-bot-rag";
import type { SocialBotThread, SocialBotIntegration } from "@/lib/social-bot-types";

export const runtime = "nodejs";

function audioExt(mimeType: string) {
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "m4a";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

async function transcodeToMp3(buffer: ArrayBuffer, mimeType: string) {
  const bin = ffmpegPath;
  if (!bin) return null;
  const dir = path.join(tmpdir(), `magnetic-voice-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  await mkdir(dir, { recursive: true });
  const input = path.join(dir, `input.${audioExt(mimeType)}`);
  const output = path.join(dir, "voice.mp3");
  try {
    await writeFile(input, Buffer.from(buffer));
    await new Promise<void>((resolve, reject) => {
      const child = spawn(bin, ["-y", "-i", input, "-vn", "-acodec", "libmp3lame", "-ar", "44100", "-ac", "1", "-b:a", "96k", output]);
      let err = "";
      child.stderr.on("data", (chunk: Buffer) => { err += String(chunk); });
      child.on("error", reject);
      child.on("close", (code: number | null) => code === 0 ? resolve() : reject(new Error(err || `ffmpeg exited with ${code}`)));
    });
    return await readFile(output);
  } catch (error) {
    console.warn("voice transcode failed", error);
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => null);
  }
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
    const audioFile = formData.get("audio") as File | null;

    if (!threadId || !audioFile) {
      return NextResponse.json({ error: "threadId and audio are required." }, { status: 400 });
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
    const originalAudioBuffer = await audioFile.arrayBuffer();
    const originalMime = audioFile.type || "audio/webm";
    const mp3Buffer = await transcodeToMp3(originalAudioBuffer, originalMime);
    const audioBuffer = mp3Buffer ?? Buffer.from(originalAudioBuffer);
    const sendMime = mp3Buffer ? "audio/mpeg" : originalMime;
    const sendName = mp3Buffer ? "voice.mp3" : `voice.${audioExt(originalMime)}`;
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: sendMime });
    const now = new Date().toISOString();
    let msgMetadata: Record<string, unknown> = { mediaType: "audio" };

    if (thread.source === "WHATSAPP") {
      const phoneId = integration.phoneNumberId;

      // 1. Upload audio to WhatsApp Media API
      const uploadForm = new FormData();
      uploadForm.append("messaging_product", "whatsapp");
      uploadForm.append("type", sendMime);
      uploadForm.append("file", new File([audioBlob], sendName, { type: sendMime }));

      const uploadRes = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/media`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: uploadForm
      });

      if (!uploadRes.ok) {
        const err = (await uploadRes.json().catch(() => ({}))) as { error?: { message?: string } };
        return NextResponse.json({ error: err.error?.message ?? "Media upload failed." }, { status: 502 });
      }

      const { id: mediaId } = (await uploadRes.json()) as { id: string };

      // 2. Send audio message via WhatsApp
      const sendRes = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: thread.externalThreadId,
          type: "audio",
          audio: { id: mediaId }
        })
      });

      const sendPayload = (await sendRes.json().catch(() => ({}))) as { message_id?: string; messages?: Array<{ id?: string }>; error?: { message?: string } };
      if (!sendRes.ok) {
        return NextResponse.json({ error: sendPayload.error?.message ?? "Send failed." }, { status: 502 });
      }
      const audioUrlWa = `data:${sendMime};base64,${Buffer.from(audioBuffer).toString("base64")}`;
      msgMetadata = { mediaType: "audio", mediaId, audioUrl: audioUrlWa, mimeType: sendMime, wamid: sendPayload.messages?.[0]?.id ?? sendPayload.message_id ?? null };

    } else {
      // Messenger / Instagram — use multipart attachment upload
      const pageId = integration.pageId;
      const sendForm = new FormData();
      sendForm.append("recipient", JSON.stringify({ id: thread.externalThreadId }));
      sendForm.append("messaging_type", "RESPONSE");
      sendForm.append("message", JSON.stringify({
        attachment: { type: "audio", payload: { is_reusable: false } }
      }));
      sendForm.append("filedata", new File([audioBlob], sendName, { type: sendMime }));

      const sendUrl = pageId
        ? `https://graph.facebook.com/v25.0/${pageId}/messages?access_token=${encodeURIComponent(accessToken)}`
        : `https://graph.facebook.com/v25.0/me/messages?access_token=${encodeURIComponent(accessToken)}`;

      const sendRes = await fetch(sendUrl, { method: "POST", body: sendForm });
      const sendPayload = (await sendRes.json().catch(() => ({}))) as { message_id?: string; attachment_id?: string; error?: { message?: string } };
      if (!sendRes.ok) {
        return NextResponse.json({ error: sendPayload.error?.message ?? "Send failed." }, { status: 502 });
      }
      const audioUrl = `data:${sendMime};base64,${Buffer.from(audioBuffer).toString("base64")}`;
      msgMetadata = { mediaType: "audio", audioUrl, mimeType: sendMime, wamid: sendPayload.message_id ?? null };
    }

    const msg = {
      _id: createSocialBotId("sbm"),
      userId,
      threadId: thread._id,
      source: thread.source,
      direction: "OUTBOUND" as const,
      role: "AGENT" as const,
      text: "🎤 Voice message",
      timestamp: now,
      deliveryStatus: "SENT" as const,
      metadata: msgMetadata
    };

    await appendMessage(msg);
    await upsertMongoDocument(
      socialBotCollections.threads,
      { _id: thread._id, userId },
      { lastMessagePreview: "🎤 Voice message", lastMessageAt: now, unreadCount: 0, updatedAt: now }
    );

    return NextResponse.json({ ok: true, messageId: msg._id });
  } catch (error) {
    console.error("voice-message send error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send voice message." },
      { status: 500 }
    );
  }
}
