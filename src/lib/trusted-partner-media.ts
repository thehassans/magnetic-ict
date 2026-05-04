import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const trustedPartnerUploadsPrefix = "/uploads/partners/";

export function createTrustedPartnerLogoUploadPath(partnerId: string) {
  return `${trustedPartnerUploadsPrefix}${partnerId}-${Date.now()}.webp`;
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

  const absoluteImagePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  await unlink(absoluteImagePath).catch(() => undefined);
}
