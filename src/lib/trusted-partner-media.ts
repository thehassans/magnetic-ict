import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const trustedPartnerUploadsPrefix = "/partners/";

export function createTrustedPartnerLogoUploadPath(partnerId: string) {
  // Save as partnerId.webp — consistent, overwrites on re-upload, served from /partners/
  return `${trustedPartnerUploadsPrefix}${partnerId}.webp`;
}

export async function saveTrustedPartnerLogoToPublic(relativeImagePath: string, fileBuffer: Buffer) {
  const absoluteImagePath = path.join(process.cwd(), "public", relativeImagePath.replace(/^\//, ""));
  await mkdir(path.dirname(absoluteImagePath), { recursive: true });
  await writeFile(absoluteImagePath, fileBuffer);
  return absoluteImagePath;
}

export async function deleteStoredTrustedPartnerLogo(imageUrl: string | null) {
  if (!imageUrl || !imageUrl.startsWith(trustedPartnerUploadsPrefix)) {
    return;
  }
  // Only delete if it was a previously uploaded WebP (not an original SVG/PNG)
  if (!imageUrl.endsWith(".webp")) return;

  const absoluteImagePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  await unlink(absoluteImagePath).catch(() => undefined);
}
