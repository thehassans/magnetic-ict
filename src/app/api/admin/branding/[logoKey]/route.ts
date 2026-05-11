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

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
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
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }
    if (imageFile.size === 0 || imageFile.size > maxUploadBytes) {
      return NextResponse.json({ error: "Use an image up to 6 MB." }, { status: 400 });
    }

    const currentConfig = await getBrandingConfig();
    const oldUrl: string = currentConfig[logoKey as BrandingLogoKey] ?? "";

    const sourceBuffer = Buffer.from(await imageFile.arrayBuffer());
    const isSvg = imageFile.type === "image/svg+xml";

    let fileBuffer: Buffer;
    let ext: string;

    if (isSvg) {
      fileBuffer = sourceBuffer;
      ext = "svg";
    } else {
      fileBuffer = await sharp(sourceBuffer, { failOn: "none" })
        .resize({ width: 600, height: 200, fit: "contain", withoutEnlargement: true, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 90, effort: 4 })
        .toBuffer();
      ext = "webp";
    }

    const newUrl = `/branding/uploads/${logoKey}.${ext}`;
    await saveBrandingLogoToPublic(newUrl, fileBuffer);
    if (oldUrl && oldUrl !== newUrl) await deleteBrandingLogo(oldUrl);

    const nextConfig = normalizeBrandingConfig({ ...currentConfig, [logoKey]: newUrl });
    await saveBrandingConfig(nextConfig);

    return NextResponse.json({ ok: true, logoUrl: newUrl, message: "Logo uploaded successfully." });
  } catch (error) {
    console.error("Branding logo upload failed", error);
    return NextResponse.json({ error: "Unable to upload logo right now." }, { status: 500 });
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
