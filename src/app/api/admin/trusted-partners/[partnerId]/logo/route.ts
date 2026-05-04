import sharp from "sharp";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteStoredTrustedPartnerLogo,
  createTrustedPartnerLogoUploadPath,
  saveTrustedPartnerLogoToPublic
} from "@/lib/trusted-partner-media";
import { getTrustedPartnersSettings, saveTrustedPartnersSettings } from "@/lib/platform-settings";

export const runtime = "nodejs";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const maxUploadBytes = 6 * 1024 * 1024;

async function requireAdminSession() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ error: "DATABASE_URL must be configured before editing trusted partners." }, { status: 503 });
  }

  return null;
}

export async function POST(request: Request, { params }: { params: Promise<{ partnerId: string }> }) {
  const authError = await requireAdminSession();

  if (authError) {
    return authError;
  }

  try {
    const [{ partnerId }, formData] = await Promise.all([params, request.formData()]);
    const imageFile = formData.get("file");

    if (!(imageFile instanceof File)) {
      return NextResponse.json({ error: "Select a logo to upload." }, { status: 400 });
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    if (imageFile.size === 0 || imageFile.size > maxUploadBytes) {
      return NextResponse.json({ error: "Use an image up to 6 MB." }, { status: 400 });
    }

    const settings = await getTrustedPartnersSettings();
    const partner = settings.partners.find((entry) => entry.id === partnerId);

    if (!partner) {
      return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    }

    const sourceBuffer = Buffer.from(await imageFile.arrayBuffer());
    const webpBuffer = await sharp(sourceBuffer, { failOn: "none" })
      .resize({ width: 1200, height: 500, fit: "contain", withoutEnlargement: true, background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 90, effort: 6 })
      .toBuffer();

    const nextLogoUrl = createTrustedPartnerLogoUploadPath(partnerId);
    await saveTrustedPartnerLogoToPublic(nextLogoUrl, webpBuffer);
    await deleteStoredTrustedPartnerLogo(partner.logoUrl !== nextLogoUrl ? partner.logoUrl : null);

    const nextSettings = {
      ...settings,
      partners: settings.partners.map((entry) => (entry.id === partnerId ? { ...entry, logoUrl: nextLogoUrl } : entry))
    };

    await saveTrustedPartnersSettings(nextSettings);

    return NextResponse.json({ ok: true, logoUrl: nextLogoUrl, message: "Partner logo uploaded." });
  } catch (error) {
    console.error("Trusted partner logo upload failed", error);
    return NextResponse.json({ error: "Unable to upload this logo right now." }, { status: 500 });
  }
}
