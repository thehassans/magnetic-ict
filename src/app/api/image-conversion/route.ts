import sharp from "sharp";
import { NextResponse } from "next/server";
import { getImageOutputFormatConfig, isImageOutputFormat, isImageResizeMode } from "@/lib/image-conversion";

export const runtime = "nodejs";

const maxUploadBytes = 15 * 1024 * 1024;
const maxDimension = 4096;

function parseDimension(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > maxDimension) {
    return Number.NaN;
  }

  return parsed;
}

function parseQuality(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return 90;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 40 || parsed > 100) {
    return Number.NaN;
  }

  return parsed;
}

function sanitizeBaseName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "converted-image";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("file");
    const outputFormatValue = formData.get("outputFormat");
    const resizeModeValue = formData.get("resizeMode");
    const width = parseDimension(formData.get("width"));
    const height = parseDimension(formData.get("height"));
    const quality = parseQuality(formData.get("quality"));

    if (!(imageFile instanceof File)) {
      return NextResponse.json({ error: "Select an image to convert." }, { status: 400 });
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    if (imageFile.size === 0 || imageFile.size > maxUploadBytes) {
      return NextResponse.json({ error: "Use an image up to 15 MB." }, { status: 400 });
    }

    if (typeof outputFormatValue !== "string" || !isImageOutputFormat(outputFormatValue)) {
      return NextResponse.json({ error: "Choose a valid output format." }, { status: 400 });
    }

    if (typeof resizeModeValue !== "string" || !isImageResizeMode(resizeModeValue)) {
      return NextResponse.json({ error: "Choose a valid resize mode." }, { status: 400 });
    }

    if (Number.isNaN(width) || Number.isNaN(height)) {
      return NextResponse.json({ error: `Width and height must be between 1 and ${maxDimension}px.` }, { status: 400 });
    }

    if (Number.isNaN(quality)) {
      return NextResponse.json({ error: "Quality must be between 40 and 100." }, { status: 400 });
    }

    const sourceBuffer = Buffer.from(await imageFile.arrayBuffer());
    const pipeline = sharp(sourceBuffer, { failOn: "none" }).rotate();
    const metadata = await pipeline.metadata();

    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: "Unable to read this image." }, { status: 400 });
    }

    let transformed = pipeline.clone();

    if (width || height) {
      transformed = transformed.resize({
        width: width ?? undefined,
        height: height ?? undefined,
        fit: resizeModeValue,
        withoutEnlargement: false
      });
    }

    if (outputFormatValue === "jpeg") {
      transformed = transformed.flatten({ background: "#ffffff" }).jpeg({ quality, mozjpeg: true });
    }

    if (outputFormatValue === "png") {
      transformed = transformed.png({ quality, compressionLevel: 9, adaptiveFiltering: true });
    }

    if (outputFormatValue === "webp") {
      transformed = transformed.webp({ quality, effort: 6 });
    }

    const outputBuffer = await transformed.toBuffer();
    const outputMetadata = await sharp(outputBuffer).metadata();
    const formatConfig = getImageOutputFormatConfig(outputFormatValue);
    const fileName = `${sanitizeBaseName(imageFile.name)}-${outputMetadata.width ?? metadata.width}x${outputMetadata.height ?? metadata.height}.${formatConfig.extension}`;

    return new Response(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": formatConfig.mimeType,
        "Content-Length": String(outputBuffer.length),
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
        "X-Output-Format": outputFormatValue,
        "X-Output-Width": String(outputMetadata.width ?? metadata.width),
        "X-Output-Height": String(outputMetadata.height ?? metadata.height),
        "X-Output-File-Name": encodeURIComponent(fileName)
      }
    });
  } catch (error) {
    console.error("Image conversion failed", error);
    return NextResponse.json({ error: "Unable to process this image right now." }, { status: 500 });
  }
}
