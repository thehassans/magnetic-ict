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
      return NextResponse.json({ error: "Please provide a valid Gemini API key." }, { status: 400 });
    }

    const settings = await getPlatformSettings();
    const apiKey = parsed.data.apiKey?.trim() || settings.geminiConfig.apiKey.trim();

    if (!apiKey) {
      return NextResponse.json({ error: "Add a Gemini API key before testing the connection." }, { status: 400 });
    }

    const models = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
    let lastError = "Gemini rejected the provided API key.";

    for (const modelId of models) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Reply with the single word: connected" }] }]
          })
        }
      );

      const payload = (await response.json().catch(() => ({}))) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        error?: { message?: string };
      };

      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (response.ok && text) {
        return NextResponse.json({ ok: true, message: `Gemini connection successful (${modelId}): ${text}` });
      }

      lastError = payload.error?.message ?? lastError;
      const modelGone = ["not found", "no longer available", "not supported", "deprecated"]
        .some((phrase) => lastError.toLowerCase().includes(phrase));
      if (!modelGone) break;
    }

    return NextResponse.json({ error: lastError }, { status: 400 });
  } catch (error) {
    console.error("Gemini test failed", error);
    return NextResponse.json({ error: "Unable to reach Gemini right now." }, { status: 500 });
  }
}
