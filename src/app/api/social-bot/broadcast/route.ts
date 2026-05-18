import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext } from "@/lib/social-bot-access";
import { createSocialBotId, getSocialBotIntegrations, getSocialBotThreadById } from "@/lib/social-bot-db";
import { appendMessage } from "@/lib/social-bot-service";
import { sendMetaReply } from "@/lib/social-bot-rag";
import type { SocialBotIntegration } from "@/lib/social-bot-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  const workspace = await getWorkspaceContext(session.user.id);

  try {
    const { threadIds, message } = (await request.json()) as {
      threadIds?: string[];
      message?: string;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (!threadIds?.length) {
      return NextResponse.json({ error: "Select at least one contact." }, { status: 400 });
    }

    const userId = workspace.ownerId;
    const integrations = await getSocialBotIntegrations(userId);
    const integrationMap = new Map<string, SocialBotIntegration>(
      integrations.map((i) => [i.channel, i])
    );

    const now = new Date().toISOString();
    const results: { threadId: string; status: "sent" | "failed"; error?: string }[] = [];

    for (const threadId of threadIds) {
      const thread = await getSocialBotThreadById(userId, threadId);
      if (!thread) { results.push({ threadId, status: "failed", error: "Thread not found" }); continue; }

      const integration = integrationMap.get(thread.source);
      let deliveryStatus: "SENT" | "FAILED" | "PENDING" = "PENDING";
      const metadata: Record<string, unknown> = { broadcast: true };

      if (integration?.status === "CONNECTED" && !thread.externalThreadId.startsWith("demo_")) {
        try {
          await sendMetaReply({ integration, thread, messageText: message.trim() });
          deliveryStatus = "SENT";
          results.push({ threadId, status: "sent" });
        } catch (err) {
          deliveryStatus = "FAILED";
          metadata.error = err instanceof Error ? err.message : "Send failed";
          results.push({ threadId, status: "failed", error: metadata.error as string });
        }
      } else {
        deliveryStatus = "SENT";
        results.push({ threadId, status: "sent" });
      }

      await appendMessage({
        _id: createSocialBotId("sbm"),
        userId,
        threadId: thread._id,
        source: thread.source,
        direction: "OUTBOUND",
        role: "AGENT",
        text: message.trim(),
        timestamp: now,
        deliveryStatus,
        metadata
      });
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      results,
      message: `Broadcast sent to ${sent} contact${sent !== 1 ? "s" : ""}${failed > 0 ? `, ${failed} failed` : ""}.`
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Broadcast failed." },
      { status: 500 }
    );
  }
}
