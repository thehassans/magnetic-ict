import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

const requestSchema = z.object({
  provider: z.enum(["elevenlabs", "openai"]),
  elevenlabsApiKey: z.string().optional(),
  elevenlabsVoiceId: z.string().optional(),
  openaiVoice: z.string().optional(),
  openaiModel: z.string().optional()
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
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { provider } = parsed.data;
    const settings = await getPlatformSettings();

    if (provider === "elevenlabs") {
      const apiKey = parsed.data.elevenlabsApiKey?.trim() || settings.ttsConfig.elevenlabsApiKey.trim();
      const voiceId = parsed.data.elevenlabsVoiceId || settings.ttsConfig.elevenlabsVoiceId;

      if (!apiKey) {
        return NextResponse.json({ error: "Add an ElevenLabs API key before testing." }, { status: 400 });
      }

      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "xi-api-key": apiKey },
        body: JSON.stringify({
          text: "Voice test successful.",
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.8 }
        })
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { detail?: { message?: string } | string };
        const msg = typeof payload.detail === "string" ? payload.detail : payload.detail?.message ?? "ElevenLabs rejected the API key or voice ID.";
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      return NextResponse.json({ ok: true, message: "ElevenLabs connection successful — voice is ready." });
    }

    if (provider === "openai") {
      const apiKey = settings.geminiConfig.openAiApiKey.trim();
      const voice = parsed.data.openaiVoice || settings.ttsConfig.openaiVoice || "nova";
      const model = parsed.data.openaiModel || settings.ttsConfig.openaiModel || "tts-1";

      if (!apiKey) {
        return NextResponse.json({ error: "Add an OpenAI API key in the AI Settings section before testing TTS." }, { status: 400 });
      }

      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, input: "Voice test successful.", voice, response_format: "mp3" })
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        return NextResponse.json({ error: payload.error?.message ?? "OpenAI TTS rejected the request." }, { status: 400 });
      }

      return NextResponse.json({ ok: true, message: `OpenAI TTS connection successful (${voice} / ${model}).` });
    }

    return NextResponse.json({ error: "Invalid provider." }, { status: 400 });
  } catch (error) {
    console.error("TTS test failed", error);
    return NextResponse.json({ error: "Unable to reach TTS provider right now." }, { status: 500 });
  }
}
