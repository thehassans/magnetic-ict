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
    const { message, history } = (await request.json()) as {
      message?: string;
      history?: Array<{ role: "user" | "assistant"; text: string }>;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const userId = session.user.id;
    const [profile, chunks] = await Promise.all([
      getSocialBotProfile(userId),
      getSocialBotChunks(userId)
    ]);

    const dummyThread: SocialBotThread = {
      _id: "ask_playground",
      userId,
      source: "WHATSAPP",
      externalThreadId: "ask_playground",
      contactName: "Test User",
      contactHandle: "@playground",
      mode: "AI",
      lastMessagePreview: message.trim(),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const now = new Date().toISOString();
    const historyMessages: SocialBotMessage[] = (history ?? []).map((h, i) => ({
      _id: `ask_hist_${i}`,
      userId,
      threadId: "ask_playground",
      source: "WHATSAPP" as const,
      direction: h.role === "user" ? ("INBOUND" as const) : ("OUTBOUND" as const),
      role: h.role === "user" ? ("USER" as const) : ("ASSISTANT" as const),
      text: h.text,
      timestamp: now,
      deliveryStatus: "SENT" as const,
      metadata: {}
    }));

    const reply = await generateSocialReply({
      profile,
      thread: dummyThread,
      messages: historyMessages,
      chunks,
      question: message.trim()
    });

    return NextResponse.json({ reply, chunkCount: chunks.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate reply." },
      { status: 500 }
    );
  }
}
