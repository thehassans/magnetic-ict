import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let text = "";
  let language = "en-US";
  let voiceId: string | undefined;

  try {
    const body = (await request.json()) as { text?: string; language?: string; voiceId?: string };
    text = (body.text ?? "").trim().slice(0, 4000);
    language = body.language ?? "en-US";
    voiceId = body.voiceId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!text) {
    return NextResponse.json({ error: "text is required." }, { status: 400 });
  }

  const settings = await getPlatformSettings();
  const tts = settings.ttsConfig;

  // ── 0. Voicebox (local-first, cloned voices) ────────────────────────────────
  if (tts.provider === "voicebox" && tts.voiceboxEndpoint.trim()) {
    const endpoint = tts.voiceboxEndpoint.replace(/\/$/, "");
    const profile = voiceId ?? tts.voiceboxProfileId;
    try {
      const body: Record<string, unknown> = { text, language };
      if (profile) body.profile_id = profile;
      const res = await fetch(`${endpoint}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000)
      });
      if (res.ok) {
        const audio = await res.arrayBuffer();
        const ct = res.headers.get("content-type") ?? "audio/webm";
        return new Response(audio, {
          headers: { "Content-Type": ct, "Cache-Control": "no-store", "X-TTS-Provider": "voicebox" }
        });
      }
    } catch { /* Voicebox offline — fall through */ }
  }

  // ── 1. ElevenLabs ──────────────────────────────────────────────────────────
  if (tts.provider === "elevenlabs" && tts.elevenlabsApiKey.trim()) {
    const useVoice = voiceId || tts.elevenlabsVoiceId;

    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${useVoice}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": tts.elevenlabsApiKey.trim()
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.80,
            style: 0.20,
            use_speaker_boost: true
          }
        })
      });

      if (res.ok) {
        const audio = await res.arrayBuffer();
        return new Response(audio, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
            "X-TTS-Provider": "elevenlabs"
          }
        });
      }
    } catch { /* fall through */ }
  }

  // ── 2. OpenAI TTS ──────────────────────────────────────────────────────────
  const openAiKey = settings.geminiConfig.openAiApiKey.trim();
  if ((tts.provider === "openai" || openAiKey) && openAiKey) {
    const voice = tts.openaiVoice || "nova";
    const model = tts.openaiModel || "tts-1";

    try {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          model,
          input: text,
          voice,
          response_format: "mp3",
          speed: 1.0
        })
      });

      if (res.ok) {
        const audio = await res.arrayBuffer();
        return new Response(audio, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
            "X-TTS-Provider": "openai"
          }
        });
      }
    } catch { /* fall through */ }
  }

  // No provider configured or all failed — client should fall back to browser TTS
  return NextResponse.json(
    { error: "No TTS provider is configured. Enable ElevenLabs or OpenAI in Admin › AI / Voice Settings." },
    { status: 503 }
  );
}
