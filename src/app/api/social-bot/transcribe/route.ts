import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const settings = await getPlatformSettings();
  const endpoint = settings.ttsConfig.voiceboxEndpoint.replace(/\/$/, "").trim();

  if (!endpoint) {
    return NextResponse.json({ error: "Voicebox not configured." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const audioField = formData.get("audio");
  if (!audioField || !(audioField instanceof Blob)) {
    return NextResponse.json({ error: "audio field is required." }, { status: 400 });
  }

  const model = (formData.get("model") as string | null) ?? "whisper-turbo";

  const outForm = new FormData();
  outForm.append("audio", audioField, "recording.webm");
  outForm.append("model", model);

  try {
    const res = await fetch(`${endpoint}/transcribe`, {
      method: "POST",
      body: outForm,
      signal: AbortSignal.timeout(30000)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json({ error: `Voicebox transcription failed: ${errText}` }, { status: 502 });
    }

    const data = await res.json() as { text?: string; transcript?: string };
    const transcript = (data.text ?? data.transcript ?? "").trim();
    return NextResponse.json({ transcript });
  } catch {
    return NextResponse.json({ error: "Voicebox unreachable." }, { status: 503 });
  }
}
