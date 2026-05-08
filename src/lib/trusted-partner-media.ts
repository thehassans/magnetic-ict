import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const trustedPartnerUploadsPrefix = "/partners/";

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
  // Only delete uploaded files — never delete the original SVGs shipped with the repo
  const basename = imageUrl.split("/").pop() ?? "";
  const isOriginalAsset = ["cloudflare.svg", "mastercard.svg", "stripe.svg", "aws.svg", "apple-pay.svg", "visa.svg"].includes(basename);
  if (isOriginalAsset) return;

  const absoluteImagePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  await unlink(absoluteImagePath).catch(() => undefined);
}
