import { NextResponse } from "next/server";
import { analyzeUploadedMedia } from "@/lib/ai-detection";

export const runtime = "nodejs";

const maxUploadBytes = 50 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload an image or video to analyze." }, { status: 400 });
    }

    if (file.size === 0 || file.size > maxUploadBytes) {
      return NextResponse.json({ error: "Use a media file up to 50 MB." }, { status: 400 });
    }

    const result = await analyzeUploadedMedia(file);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("AI detection failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to analyze this media right now." },
      { status: 500 }
    );
  }
}
