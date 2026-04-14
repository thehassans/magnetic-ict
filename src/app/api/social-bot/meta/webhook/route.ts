import { NextResponse } from "next/server";
import { findOneMongoDocument, socialBotCollections } from "@/lib/social-bot-db";
import { getPlatformSettings } from "@/lib/platform-settings";
import { ingestInboundMessage } from "@/lib/social-bot-service";
import type { SocialBotIntegration } from "@/lib/social-bot-types";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const settings = await getPlatformSettings();

  if (mode === "subscribe" && token && token === settings.socialBotConfig.webhookVerifyToken) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      entry?: Array<{
        id?: string;
        changes?: Array<{
          value?: {
            metadata?: { phone_number_id?: string };
            contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
            messages?: Array<{ from?: string; text?: { body?: string } }>;
            messaging?: Array<{
              sender?: { id?: string };
              message?: { text?: string };
            }>;
          };
        }>;
      }>;
    };

    const entries = payload.entry ?? [];

    for (const entry of entries) {
      const entryId = normalizeText(entry.id);

      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value) {
          continue;
        }

        const phoneNumberId = value.metadata?.phone_number_id;
        const whatsappMessage = value.messages?.[0];
        const whatsappContact = value.contacts?.[0];

        if (phoneNumberId && whatsappMessage?.from && whatsappMessage.text?.body) {
          const integration = await findOneMongoDocument<SocialBotIntegration>(socialBotCollections.integrations, {
            channel: "WHATSAPP",
            phoneNumberId
          });

          if (integration?.userId) {
            await ingestInboundMessage({
              userId: integration.userId,
              source: "WHATSAPP",
              externalThreadId: whatsappMessage.from,
              contactName: normalizeText(whatsappContact?.profile?.name) || whatsappMessage.from,
              contactHandle: whatsappMessage.from,
              text: whatsappMessage.text.body,
              metadata: { webhook: "meta" }
            });
          }
        }

        const pageMessage = value.messaging?.[0];
        if (pageMessage?.sender?.id && pageMessage.message?.text) {
          const messengerIntegration = entryId
            ? await findOneMongoDocument<SocialBotIntegration>(socialBotCollections.integrations, {
                channel: "MESSENGER",
                pageId: entryId
              })
            : null;
          const instagramIntegration = entryId
            ? await findOneMongoDocument<SocialBotIntegration>(socialBotCollections.integrations, {
                channel: "INSTAGRAM",
                accountId: entryId
              })
            : null;
          const integration = messengerIntegration ?? instagramIntegration;

          if (integration?.userId) {
            await ingestInboundMessage({
              userId: integration.userId,
              source: integration.channel,
              externalThreadId: pageMessage.sender.id,
              contactName: pageMessage.sender.id,
              contactHandle: pageMessage.sender.id,
              text: pageMessage.message.text,
              metadata: { webhook: "meta" }
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
