import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  BRANDING_LOGO_KEYS,
  type BrandingLogoKey,
  getBrandingConfig,
  normalizeBrandingConfig,
  saveBrandingConfig
} from "@/lib/platform-settings";

export const runtime = "nodejs";

const maxUploadBytes = 6 * 1024 * 1024;
const hasDatabase = Boolean(process.env.DATABASE_URL);

const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif", ".bmp", ".tiff", ".ico"];

function isImageFile(file: File) {
  if (file.type.startsWith("image/")) return true;
  const lower = file.name.toLowerCase();
  return imageExtensions.some((ext) => lower.endsWith(ext));
}

function isSvgFile(file: File) {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }
  if (!hasDatabase) {
    return NextResponse.json({ error: "DATABASE_URL must be configured to manage branding." }, { status: 503 });
  }
  return null;
}

async function saveBrandingLogoToPublic(relPath: string, buffer: Buffer) {
  const abs = path.join(process.cwd(), "public", relPath.replace(/^\//, ""));
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, buffer);
}

async function deleteBrandingLogo(url: string | null) {
  if (!url || !url.startsWith("/branding/uploads/")) return;
  const abs = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  await unlink(abs).catch(() => undefined);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ logoKey: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { logoKey } = await params;

  if (!(BRANDING_LOGO_KEYS as readonly string[]).includes(logoKey)) {
    return NextResponse.json({ error: "Invalid logo key." }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get("file");

    if (!(imageFile instanceof File)) {
      return NextResponse.json({ error: "Select a logo file to upload." }, { status: 400 });
    }
    if (!isImageFile(imageFile)) {
      return NextResponse.json({ error: "Only image uploads are supported. (jpg, png, webp, svg, etc.)" }, { status: 400 });
    }
    if (imageFile.size === 0 || imageFile.size > maxUploadBytes) {
      return NextResponse.json({ error: "Use an image up to 6 MB." }, { status: 400 });
    }

    const currentConfig = await getBrandingConfig();
    const oldUrl: string = currentConfig[logoKey as BrandingLogoKey] ?? "";

    const sourceBuffer = Buffer.from(await imageFile.arrayBuffer());
    let fileBuffer: Buffer;
    let ext: string;

    if (isSvgFile(imageFile)) {
      fileBuffer = sourceBuffer;
      ext = "svg";
    } else {
      try {
        fileBuffer = await sharp(sourceBuffer, { failOn: "none" })
          .resize({ width: 600, height: 200, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 90 })
          .toBuffer();
        ext = "webp";
      } catch {
        fileBuffer = sourceBuffer;
        const lower = imageFile.name.toLowerCase();
        ext = lower.endsWith(".png") ? "png" : lower.endsWith(".webp") ? "webp" : lower.endsWith(".jpg") || lower.endsWith(".jpeg") ? "jpg" : "png";
      }
    }

    const relPath = `/branding/uploads/${logoKey}.${ext}`;
    await saveBrandingLogoToPublic(relPath, fileBuffer);
    if (oldUrl && oldUrl !== relPath && !oldUrl.includes(relPath)) await deleteBrandingLogo(oldUrl);

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    const newUrl = appUrl ? `${appUrl}${relPath}` : relPath;
    const nextConfig = normalizeBrandingConfig({ ...currentConfig, [logoKey]: newUrl });
    await saveBrandingConfig(nextConfig);

    return NextResponse.json({ ok: true, logoUrl: newUrl, message: "Logo uploaded successfully." });
  } catch (error) {
    console.error("Branding logo upload failed", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ logoKey: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { logoKey } = await params;

  if (!(BRANDING_LOGO_KEYS as readonly string[]).includes(logoKey)) {
    return NextResponse.json({ error: "Invalid logo key." }, { status: 400 });
  }

  try {
    const currentConfig = await getBrandingConfig();
    const oldUrl: string = currentConfig[logoKey as BrandingLogoKey] ?? "";
    await deleteBrandingLogo(oldUrl);
    const nextConfig = normalizeBrandingConfig({ ...currentConfig, [logoKey]: "" });
    await saveBrandingConfig(nextConfig);
    return NextResponse.json({ ok: true, message: "Logo removed." });
  } catch (error) {
    console.error("Branding logo delete failed", error);
    return NextResponse.json({ error: "Unable to remove logo right now." }, { status: 500 });
  }
}
