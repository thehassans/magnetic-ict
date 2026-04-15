import { NextResponse } from "next/server";
import { inspectVideoDownload } from "@/lib/video-downloader";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { url?: string };
    const url = typeof body.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "Paste a supported video URL first." }, { status: 400 });
    }

    const result = await inspectVideoDownload(url);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Video inspection failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to inspect this link right now." },
      { status: 500 }
    );
  }
}
