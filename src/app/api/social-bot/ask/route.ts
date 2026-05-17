import { NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { getSocialBotChunks, getSocialBotProfile } from "@/lib/social-bot-db";
import { generateSocialReply } from "@/lib/social-bot-rag";
import type { SocialBotMessage, SocialBotThread } from "@/lib/social-bot-types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getRequiredUserSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);
  if (!hasAccess) return NextResponse.json({ error: "Access denied." }, { status: 403 });

  try {
    const { message, history, documentIds } = (await request.json()) as {
      message?: string;
      history?: { role: "user" | "assistant"; text: string }[];
      documentIds?: string[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const userId = session.user.id;
    const [profile, chunks] = await Promise.all([
      getSocialBotProfile(userId),
      getSocialBotChunks(userId)
    ]);

    const mockThread: SocialBotThread = {
      _id: "ask-magnetic-preview",
      userId,
      source: "WHATSAPP",
      externalThreadId: "ask-magnetic-preview",
      contactName: "Preview User",
      contactHandle: "@preview",
      mode: "AI",
      lastMessagePreview: message.trim(),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const historyMessages: SocialBotMessage[] = (history ?? []).map((h, i) => ({
      _id: `ask-h-${i}`,
      userId,
      threadId: "ask-magnetic-preview",
      source: "WHATSAPP",
      direction: h.role === "user" ? "INBOUND" : "OUTBOUND",
      role: h.role === "user" ? "USER" : "ASSISTANT",
      text: h.text,
      timestamp: new Date(Date.now() - (history!.length - i) * 1000).toISOString(),
      deliveryStatus: "SENT",
      metadata: {}
    }));

    const filteredChunks = documentIds?.length
      ? chunks.filter((c) => documentIds.includes(c.documentId))
      : chunks;

    const reply = await generateSocialReply({
      profile,
      thread: mockThread,
      messages: historyMessages,
      chunks: filteredChunks,
      question: message.trim()
    });

    return NextResponse.json({ ok: true, reply, chunksUsed: chunks.filter((c) => c.embedding.length > 0).length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate reply." },
      { status: 500 }
    );
  }
}
