import { NextResponse } from "next/server";
import { buildDownloadResponse } from "@/lib/video-downloader";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      url?: string;
      outputType?: "mp4" | "mp3";
      quality?: string;
      formatId?: string;
    };

    const url = typeof body.url === "string" ? body.url.trim() : "";
    const outputType = body.outputType === "mp3" ? "mp3" : "mp4";
    const quality = typeof body.quality === "string" ? body.quality.trim() : "";
    const formatId = typeof body.formatId === "string" ? body.formatId.trim() : undefined;

    if (!url || !quality) {
      return NextResponse.json({ error: "Select a valid source URL and quality option." }, { status: 400 });
    }

    const download = await buildDownloadResponse({ url, outputType, quality, formatId });
    const response = new Response(download.stream, {
      status: 200,
      headers: download.headers
    });

    response.headers.set("X-Accel-Buffering", "no");

    return response;
  } catch (error) {
    console.error("Video download failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create this download right now." },
      { status: 500 }
    );
  }
}
