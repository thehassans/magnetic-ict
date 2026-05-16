import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getPlatformSettings } from "@/lib/platform-settings";
import { ingestInboundMessage } from "@/lib/social-bot-service";
import { sendInfobipReply } from "@/lib/social-bot-rag";

export const runtime = "nodejs";

function verifyHmac(rawBody: string, signature: string | null, secret: string): boolean {
  if (!secret || !signature) return !secret; // if no secret configured, skip validation
  try {
    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const left = Buffer.from(signature, "utf8");
    const right = Buffer.from(expected, "utf8");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

type InfobipMessage = {
  type?: string;
  text?: string;
};

type InfobipResult = {
  from?: string;
  to?: string;
  integrationType?: string;
  receivedAt?: string;
  messageId?: string;
  message?: InfobipMessage;
};

type InfobipPayload = {
  results?: InfobipResult[];
  messageCount?: number;
};

export async function POST(request: Request) {
  try {
    const settings = await getPlatformSettings();
    const cfg = settings.infobipConfig;

    if (!cfg.enabled) {
      return NextResponse.json({ error: "Infobip integration is not enabled." }, { status: 503 });
    }

    if (!cfg.botUserId) {
      return NextResponse.json({ error: "No bot user configured for Infobip." }, { status: 503 });
    }

    const rawBody = await request.text();

    // HMAC signature validation (optional — only enforced when webhookSecret is set)
    const signature = request.headers.get("x-hub-signature-256") ?? request.headers.get("x-infobip-signature");
    if (cfg.webhookSecret && !verifyHmac(rawBody, signature, cfg.webhookSecret)) {
      console.warn("[Infobip] Invalid webhook signature — rejected.");
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 403 });
    }

    const payload = JSON.parse(rawBody) as InfobipPayload;
    const results = payload.results ?? [];

    for (const result of results) {
      if (result.integrationType !== "WHATSAPP") continue;
      const from = result.from?.trim();
      const text = result.message?.text?.trim();
      if (!from || !text || result.message?.type !== "TEXT") continue;

      await ingestInboundMessage({
        userId: cfg.botUserId,
        source: "WHATSAPP",
        externalThreadId: from,
        contactName: from,
        contactHandle: from,
        text,
        metadata: { webhook: "infobip", messageId: result.messageId, receivedAt: result.receivedAt },
        overrideSend: async (replyText) => {
          await sendInfobipReply({
            to: from,
            messageText: replyText,
            apiKey: cfg.apiKey,
            baseUrl: cfg.baseUrl,
            senderNumber: cfg.senderNumber
          });
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Infobip] Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
