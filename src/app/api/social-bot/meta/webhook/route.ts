import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { findOneMongoDocument, socialBotCollections } from "@/lib/social-bot-db";
import { getPlatformSettings } from "@/lib/platform-settings";
import { ingestInboundMessage, updateMessageDeliveryStatus } from "@/lib/social-bot-service";
import { sendMetaReply, decryptSecret } from "@/lib/social-bot-rag";
import type { SocialBotIntegration } from "@/lib/social-bot-types";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

async function fetchPageScopedName(psid: string, accessToken: string): Promise<string> {
  if (!accessToken || !psid) return psid;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v25.0/${psid}?fields=name&access_token=${encodeURIComponent(accessToken)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = (await res.json()) as { name?: string };
      return data.name?.trim() || psid;
    }
  } catch { /* ignore - fall back to psid */ }
  return psid;
}

function isValidMetaSignature(signature: string | null, rawBody: string, appSecret: string) {
  if (!signature || !appSecret) return false;
  const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex")}`;
  const left = Buffer.from(signature, "utf8");
  const right = Buffer.from(expected, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token")?.trim();
  const challenge = searchParams.get("hub.challenge");
  const settings = await getPlatformSettings();
  const expectedToken = settings.socialBotConfig.webhookVerifyToken.trim();

  if (mode === "subscribe" && token && token === expectedToken) {
    return new Response(challenge ?? "", { status: 200 });
  }

  console.warn(
    `[webhook] verify-token mismatch. received=${token?.slice(0, 8) ?? "(none)"}... expected=${expectedToken ? expectedToken.slice(0, 8) + "..." : "(empty — not saved?)"}`,
  );
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const settings = await getPlatformSettings();
    const cfg = settings.socialBotConfig;
    const rawBody = await request.text();

    if (cfg.metaAppSecret && !isValidMetaSignature(request.headers.get("x-hub-signature-256"), rawBody, cfg.metaAppSecret)) {
      return NextResponse.json({ error: "Invalid Meta webhook signature." }, { status: 403 });
    }

    const payload = JSON.parse(rawBody) as {
      entry?: Array<{
        id?: string;
        changes?: Array<{
          field?: string;
          value?: {
            // WhatsApp Cloud API
            metadata?: { phone_number_id?: string };
            contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
            messages?: Array<{
              from?: string;
              type?: string;
              id?: string;
              text?: { body?: string };
              audio?: { id?: string; mime_type?: string };
              image?: { id?: string; mime_type?: string; caption?: string };
              document?: { id?: string; filename?: string; mime_type?: string };
            }>;
            statuses?: Array<{ id?: string; status?: string; recipient_id?: string }>;
            // Instagram comments
            media?: { id?: string };
            id?: string;
            text?: string;
            from?: { id?: string; username?: string };
            // Messenger / Instagram DM changes
            messaging?: Array<{
              sender?: { id?: string };
              message?: {
                text?: string;
                is_echo?: boolean;
                attachments?: Array<{ type?: string; payload?: { url?: string; sticker_id?: number } }>;
              };
            }>;
          };
        }>;
        messaging?: Array<{
          sender?: { id?: string };
          message?: {
            text?: string;
            is_echo?: boolean;
            attachments?: Array<{ type?: string; payload?: { url?: string; sticker_id?: number } }>;
          };
        }>;
      }>;
    };

    const entries = payload.entry ?? [];

    for (const entry of entries) {
      const entryId = normalizeText(entry.id);

      // ── WhatsApp Cloud API messages ────────────────────────────────────
      for (const change of entry.changes ?? []) {
        const val = change.value;
        if (!val) continue;

        const phoneNumberId = val.metadata?.phone_number_id?.trim() ?? "";
        const waMsg = val.messages?.[0];
        const waContact = val.contacts?.[0];

        // ── Handle WhatsApp delivery status receipts ─────────────────────
        for (const status of val.statuses ?? []) {
          const wamid = status.id?.trim() ?? "";
          const st = status.status?.trim() ?? "";
          if (!wamid || (st !== "delivered" && st !== "read")) continue;

          const integration = await findOneMongoDocument<SocialBotIntegration>(
            socialBotCollections.integrations,
            { channel: "WHATSAPP", phoneNumberId }
          );
          if (integration?.userId) {
            await updateMessageDeliveryStatus(
              integration.userId,
              wamid,
              st === "read" ? "READ" : "DELIVERED"
            );
          } else if (cfg.metaBotUserId) {
            await updateMessageDeliveryStatus(cfg.metaBotUserId, wamid, st === "read" ? "READ" : "DELIVERED");
          }
        }

        if (!waMsg?.from) continue;

        const contactName = normalizeText(waContact?.profile?.name) || waMsg.from;
        const contactHandle = waMsg.from;
        const msgType = waMsg.type ?? "";

        let ingestText = "";
        let ingestMeta: Record<string, unknown> = { webhook: "meta", phoneNumberId };

        if (msgType === "text" && waMsg.text?.body) {
          ingestText = waMsg.text.body;
        } else if (msgType === "audio" && waMsg.audio?.id) {
          ingestText = "🎤 Voice message";
          ingestMeta = { ...ingestMeta, mediaType: "audio", mediaId: waMsg.audio.id, mimeType: waMsg.audio.mime_type ?? "audio/ogg" };
        } else if (msgType === "image" && waMsg.image?.id) {
          ingestText = waMsg.image.caption ? `🖼 ${waMsg.image.caption}` : "🖼 Image";
          ingestMeta = { ...ingestMeta, mediaType: "image", mediaId: waMsg.image.id };
        } else if (msgType === "document" && waMsg.document?.id) {
          ingestText = `📎 ${waMsg.document.filename ?? "Document"}`;
          ingestMeta = { ...ingestMeta, mediaType: "document", mediaId: waMsg.document.id };
        }

        if (ingestText) {
          // 1. Try per-user integration
          const integration = await findOneMongoDocument<SocialBotIntegration>(
            socialBotCollections.integrations,
            { channel: "WHATSAPP", phoneNumberId }
          );

          if (integration?.userId) {
            await ingestInboundMessage({
              userId: integration.userId,
              source: "WHATSAPP",
              externalThreadId: waMsg.from,
              contactName,
              contactHandle,
              text: ingestText,
              metadata: ingestMeta
            });
          } else if (
            cfg.metaBotUserId &&
            cfg.metaWhatsAppSystemToken &&
            cfg.metaWhatsAppPhoneNumberId &&
            phoneNumberId === cfg.metaWhatsAppPhoneNumberId
          ) {
            // 2. Fall back to system-level admin credentials
            const systemToken = cfg.metaWhatsAppSystemToken;
            await ingestInboundMessage({
              userId: cfg.metaBotUserId,
              source: "WHATSAPP",
              externalThreadId: waMsg.from,
              contactName,
              contactHandle,
              text: ingestText,
              metadata: { ...ingestMeta, system: true },
              overrideSend: msgType === "text" ? async (replyText) => {
                await sendMetaReply({
                  integration: null,
                  thread: { externalThreadId: waMsg.from!, source: "WHATSAPP" } as never,
                  messageText: replyText,
                  systemToken,
                  systemPhoneNumberId: phoneNumberId
                });
              } : undefined
            });
          }
        }

        // ── Instagram Comments (field: "comments") ─────────────────────────
        if (change.field === "comments" && val) {
          const commentId = normalizeText(val.id);
          const commentText = normalizeText(val.text);
          const commenterId = normalizeText(val.from?.id);
          const commenterUsername = normalizeText(val.from?.username) || commenterId;
          const mediaId = normalizeText(val.media?.id);

          if (commentId && commentText && commenterId) {
            // 1. Try per-user integration (Instagram account linked to this entry page)
            const instagramInt = entryId
              ? await findOneMongoDocument<SocialBotIntegration>(
                  socialBotCollections.integrations,
                  { channel: "INSTAGRAM", accountId: entryId }
                )
              : null;

            if (instagramInt?.userId) {
              await ingestInboundMessage({
                userId: instagramInt.userId,
                source: "INSTAGRAM",
                externalThreadId: commenterId,
                contactName: commenterUsername,
                contactHandle: commenterUsername,
                text: commentText,
                metadata: { webhook: "meta", commentId, mediaId, type: "comment" }
              });
            } else if (cfg.metaBotUserId && cfg.metaInstagramAccountId && entryId === cfg.metaInstagramAccountId) {
              // 2. Fall back to system-level Instagram credentials
              const systemToken = cfg.metaInstagramPageToken;
              await ingestInboundMessage({
                userId: cfg.metaBotUserId,
                source: "INSTAGRAM",
                externalThreadId: commenterId,
                contactName: commenterUsername,
                contactHandle: commenterUsername,
                text: commentText,
                metadata: { webhook: "meta", commentId, mediaId, type: "comment", system: true },
                overrideSend: systemToken
                  ? async (replyText) => {
                      await sendMetaReply({
                        integration: null,
                        thread: { externalThreadId: commenterId, source: "INSTAGRAM" } as never,
                        messageText: replyText,
                        systemToken
                      });
                    }
                  : undefined
              });
            }
          }
        }
      }

      // ── Messenger & Instagram messages (page-level) ───────────────────
      for (const msg of entry.messaging ?? []) {
        if (!msg.sender?.id || msg.message?.is_echo) continue;

        const hasText = !!msg.message?.text;
        const audioAttachment = msg.message?.attachments?.find((a) => a.type === "audio");
        if (!hasText && !audioAttachment) continue;

        const senderId = msg.sender.id;

        // 1. Try per-user integration (Messenger)
        const messengerInt = entryId
          ? await findOneMongoDocument<SocialBotIntegration>(socialBotCollections.integrations, { channel: "MESSENGER", pageId: entryId })
          : null;
        // 2. Try per-user integration (Instagram)
        const instagramInt = entryId
          ? await findOneMongoDocument<SocialBotIntegration>(socialBotCollections.integrations, { channel: "INSTAGRAM", accountId: entryId })
          : null;

        const perUserInt = messengerInt ?? instagramInt;
        const perUserToken = perUserInt ? decryptSecret(perUserInt.accessTokenEncrypted) : "";
        const systemToken2 = perUserInt
          ? ""
          : (cfg.metaMessengerPageId && entryId === cfg.metaMessengerPageId ? cfg.metaMessengerPageToken : cfg.metaInstagramPageToken) ?? "";
        const contactName = await fetchPageScopedName(senderId, perUserToken || systemToken2);

        const ingestText = hasText ? msg.message!.text! : "\uD83C\uDF99 Voice message";
        const ingestMeta: Record<string, unknown> = audioAttachment
          ? { webhook: "meta", mediaType: "audio", audioUrl: audioAttachment.payload?.url ?? "" }
          : { webhook: "meta" };

        if (perUserInt?.userId) {
          await ingestInboundMessage({
            userId: perUserInt.userId,
            source: perUserInt.channel,
            externalThreadId: senderId,
            contactName,
            contactHandle: senderId,
            text: ingestText,
            metadata: ingestMeta
          });
        } else if (cfg.metaBotUserId) {
          // 3. Fall back to system-level admin credentials
          const isMessenger = cfg.metaMessengerPageId && entryId === cfg.metaMessengerPageId;
          const isInstagram = cfg.metaInstagramAccountId && entryId === cfg.metaInstagramAccountId;
          const channel = isMessenger ? "MESSENGER" : isInstagram ? "INSTAGRAM" : null;
          const systemToken = isMessenger ? cfg.metaMessengerPageToken : isInstagram ? cfg.metaInstagramPageToken : "";

          if (channel && systemToken) {
            await ingestInboundMessage({
              userId: cfg.metaBotUserId,
              source: channel,
              externalThreadId: senderId,
              contactName,
              contactHandle: senderId,
              text: ingestText,
              metadata: { ...ingestMeta, system: true },
              overrideSend: hasText ? async (replyText) => {
                await sendMetaReply({
                  integration: null,
                  thread: { externalThreadId: senderId, source: channel } as never,
                  messageText: replyText,
                  systemToken
                });
              } : undefined
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Meta webhook failed", error);
    return NextResponse.json({ error: "Unable to process webhook." }, { status: 500 });
  }
}
