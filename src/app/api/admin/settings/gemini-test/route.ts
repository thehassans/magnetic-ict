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

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Reply with the single word: connected"
              }
            ]
          }
        ]
      })
    });

    const payload = (await response.json().catch(() => ({}))) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.error?.message ?? "Gemini rejected the provided API key." },
        { status: 400 }
      );
    }

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "connected";

    return NextResponse.json({ ok: true, message: `Gemini connection successful: ${text}` });
  } catch (error) {
    console.error("Gemini test failed", error);
    return NextResponse.json({ error: "Unable to reach Gemini right now." }, { status: 500 });
  }
}
