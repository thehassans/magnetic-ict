import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

const requestSchema = z.object({
  apiKey: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide a valid Groq API key." }, { status: 400 });
    }

    const settings = await getPlatformSettings();
    const apiKey = parsed.data.apiKey?.trim() || settings.geminiConfig.groqApiKey.trim();

    if (!apiKey) {
      return NextResponse.json({ error: "Add a Groq API key before testing the connection." }, { status: 400 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Reply with the single word: connected" }],
        max_tokens: 10
      })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.error?.message ?? "Groq rejected the provided API key." },
        { status: 400 }
      );
    }

    const text = payload.choices?.[0]?.message?.content?.trim() ?? "connected";

    return NextResponse.json({ ok: true, message: `Groq connection successful: ${text}` });
  } catch (error) {
    console.error("Groq test failed", error);
    return NextResponse.json({ error: "Unable to reach Groq right now." }, { status: 500 });
  }
}
