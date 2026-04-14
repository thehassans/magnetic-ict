import { NextResponse } from "next/server";
import { searchApprovedFaces } from "@/lib/face-search-demo";

export const runtime = "nodejs";

const maxUploadBytes = 6 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("file");

    if (!(imageFile instanceof File)) {
      return NextResponse.json({ error: "Select an approved portrait or upload an image to search." }, { status: 400 });
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    if (imageFile.size === 0 || imageFile.size > maxUploadBytes) {
      return NextResponse.json({ error: "Use an image up to 6 MB." }, { status: 400 });
    }

    const sourceBuffer = Buffer.from(await imageFile.arrayBuffer());
    const startedAt = Date.now();
    const matches = await searchApprovedFaces(sourceBuffer);

    return NextResponse.json({
      ok: true,
      matches,
      searchedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      registryScope: "approved-demo-registry"
    });
  } catch (error) {
    console.error("Face search request failed", error);
    return NextResponse.json({ error: "Unable to scan this image right now." }, { status: 500 });
  }
}
