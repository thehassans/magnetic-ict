import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlatformSettings } from "@/lib/platform-settings";

export const runtime = "nodejs";

type VoiceboxProfile = { id: string; name: string; [key: string]: unknown };

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const settings = await getPlatformSettings();
  const endpoint = settings.ttsConfig.voiceboxEndpoint.replace(/\/$/, "").trim();

  if (!endpoint) {
    return NextResponse.json({ profiles: [], connected: false });
  }

  try {
    const res = await fetch(`${endpoint}/profiles`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return NextResponse.json({ profiles: [], connected: false });
    const data = await res.json() as unknown;
    const profiles: VoiceboxProfile[] = Array.isArray(data)
      ? (data as VoiceboxProfile[]).map((p) => ({ id: String(p.id ?? ""), name: String(p.name ?? p.id ?? "Unknown") }))
      : [];
    return NextResponse.json({ profiles, connected: true });
  } catch {
    return NextResponse.json({ profiles: [], connected: false, error: "Voicebox unreachable" });
  }
}
