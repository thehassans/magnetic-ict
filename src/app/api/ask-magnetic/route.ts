import { NextRequest, NextResponse } from "next/server";
import { getRequiredUserSession, userHasMagneticSocialBotAccess } from "@/lib/social-bot-access";
import { getSocialBotChunks } from "@/lib/social-bot-db";
import { getSocialBotProfile } from "@/lib/social-bot-db";
import { retrieveRelevantKnowledge } from "@/lib/social-bot-rag";
import { getPlatformSettings } from "@/lib/platform-settings";

export const runtime = "nodejs";

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const defaultInstructions =
  "You are the personal AI assistant for this business, trained only on their uploaded knowledge base. " +
  "Answer questions using ONLY the knowledge context provided. " +
  "If the answer is not in the context, say: \"I don't have that information in the knowledge base yet. You can add more documents in your Social Bot workspace.\" " +
  "Be concise, warm, and professional. Never invent facts, prices, or policies.";

export async function POST(req: NextRequest) {
  // ── 1. Auth check ──
  const session = await getRequiredUserSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to use Ask Magnetic." }, { status: 401 });
  }

  // ── 2. Social Bot access check ──
  const hasAccess = await userHasMagneticSocialBotAccess(session.user.id);

  if (!hasAccess) {
    return NextResponse.json(
      { error: "Ask Magnetic is only available for Magnetic Social Bot subscribers." },
      { status: 403 }
    );
  }

  // ── 3. Parse request ──
  const body = (await req.json().catch(() => ({}))) as {
    message?: string;
    history?: HistoryMessage[];
  };

  const message = body.message?.trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    const userId = session.user.id;

    // ── 4. Load user's knowledge chunks + profile ──
    const [chunks, profile, settings] = await Promise.all([
      getSocialBotChunks(userId),
      getSocialBotProfile(userId),
      getPlatformSettings(),
    ]);

    const apiKey = settings.geminiConfig.apiKey.trim();

    // ── 5. If no documents yet, return helpful message ──
    if (chunks.length === 0) {
      return NextResponse.json({
        reply:
          "Your knowledge base is empty. To get started, go to your **Social Bot workspace** → Step 1 → upload PDF, DOCX, or TXT files. Once trained, I can answer questions from your documents.",
      });
    }

    // ── 6. RAG — retrieve relevant chunks by cosine similarity ──
    const relevantChunks = await retrieveRelevantKnowledge(chunks, message);
    const context = relevantChunks
      .map((chunk) => `[Source: ${chunk.fileName}]\n${chunk.content}`)
      .join("\n\n");

    const businessContext = profile
      ? `Business: ${profile.businessName || "Unknown"}\nIndustry: ${profile.industry || "Unknown"}`
      : "";

    const systemPrompt = `${defaultInstructions}\n\n${businessContext}`;

    // ── 7. Build conversation history (last 8 messages) ──
    const history = (body.history ?? []).slice(-8);

    // ── 8. Call Gemini with the user's RAG context ──
    if (!apiKey) {
      // Fallback: return best chunk text if no Gemini key
      const fallbackContent = relevantChunks[0]?.content ?? "No relevant information found.";
      return NextResponse.json({
        reply: `Based on your knowledge base:\n\n${fallbackContent}`,
      });
    }

    const contents = [
      ...history.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      {
        role: "user",
        parts: [
          {
            text: `Knowledge Base Context:\n${context}\n\nUser Question:\n${message}`,
          },
        ],
      },
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600,
          },
        }),
      }
    );

    const geminiData = (await geminiRes.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      error?: { message?: string };
    };

    if (!geminiRes.ok) {
      throw new Error(geminiData.error?.message ?? "Gemini could not generate a response.");
    }

    const reply = geminiData.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();

    if (!reply) {
      throw new Error("No response generated.");
    }

    return NextResponse.json({ reply });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
