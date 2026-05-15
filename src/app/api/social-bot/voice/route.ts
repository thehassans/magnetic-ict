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
    const { message, history, language } = (await request.json()) as {
      message?: string;
      history?: { role: "user" | "assistant"; text: string }[];
      language?: string;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const userId = session.user.id;
    const [profile, chunks] = await Promise.all([
      getSocialBotProfile(userId),
      getSocialBotChunks(userId)
    ]);

    const detectedLang = language?.trim() || "auto";
    const langInstruction = detectedLang !== "auto"
      ? `\n\nIMPORTANT: The customer is speaking in ${detectedLang}. You MUST reply in the SAME language: ${detectedLang}. Keep your reply natural for spoken voice — short sentences, no markdown, no bullet points, no special characters. Sound like a helpful human assistant speaking out loud.`
      : "\n\nIMPORTANT: Detect the customer's language and reply in the EXACT same language. Keep your reply natural for spoken voice — short sentences, no markdown, no bullet points, no special characters. Sound like a helpful human assistant speaking out loud.";

    const mockThread: SocialBotThread = {
      _id: "voice-agent-preview",
      userId,
      source: "WHATSAPP",
      externalThreadId: "voice-agent-preview",
      contactName: "Voice Customer",
      contactHandle: "@voice",
      mode: "AI",
      lastMessagePreview: message.trim(),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const historyMessages: SocialBotMessage[] = (history ?? []).map((h, i) => ({
      _id: `voice-h-${i}`,
      userId,
      threadId: "voice-agent-preview",
      source: "WHATSAPP",
      direction: h.role === "user" ? "INBOUND" : "OUTBOUND",
      role: h.role === "user" ? "USER" : "ASSISTANT",
      text: h.text,
      timestamp: new Date(Date.now() - ((history ?? []).length - i) * 1000).toISOString(),
      deliveryStatus: "SENT",
      metadata: {}
    }));

    const reply = await generateSocialReply({
      profile: profile ? {
        ...profile,
        businessName: profile.businessName,
        industry: `${profile.industry}${langInstruction}`
      } : null,
      thread: mockThread,
      messages: historyMessages,
      chunks,
      question: message.trim()
    });

    return NextResponse.json({
      ok: true,
      reply,
      detectedLanguage: detectedLang,
      chunksUsed: chunks.filter((c) => c.embedding.length > 0).length
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate voice reply." },
      { status: 500 }
    );
  }
}
