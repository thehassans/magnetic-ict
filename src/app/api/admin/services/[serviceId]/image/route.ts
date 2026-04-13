import sharp from "sharp";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { serviceCatalog } from "@/lib/service-catalog";
import {
  createServiceImageUploadPath,
  deleteStoredServiceImage,
  saveServiceImageToPublic,
  setServiceImage
} from "@/lib/service-media";

export const runtime = "nodejs";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const maxUploadBytes = 6 * 1024 * 1024;

function isValidServiceId(serviceId: string): serviceId is (typeof serviceCatalog)[number]["id"] {
  return serviceCatalog.some((service) => service.id === serviceId);
}

async function requireAdminSession() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ error: "DATABASE_URL must be configured before editing services." }, { status: 503 });
  }

  return null;
}

export async function POST(request: Request, { params }: { params: Promise<{ serviceId: string }> }) {
  const authError = await requireAdminSession();

  if (authError) {
    return authError;
  }

  try {
    const [{ serviceId }, formData] = await Promise.all([params, request.formData()]);

    if (!isValidServiceId(serviceId)) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    const imageFile = formData.get("file");

    if (!(imageFile instanceof File)) {
      return NextResponse.json({ error: "Select an image to upload." }, { status: 400 });
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    if (imageFile.size === 0 || imageFile.size > maxUploadBytes) {
      return NextResponse.json({ error: "Use an image up to 6 MB." }, { status: 400 });
    }

    const sourceBuffer = Buffer.from(await imageFile.arrayBuffer());
    const webpBuffer = await sharp(sourceBuffer)
      .resize({ width: 1800, height: 1200, fit: "cover", withoutEnlargement: true })
      .webp({ quality: 88, effort: 6 })
      .toBuffer();

    const nextImageUrl = createServiceImageUploadPath(serviceId);
    await saveServiceImageToPublic(nextImageUrl, webpBuffer);
    const result = await setServiceImage(serviceId, nextImageUrl);
    await deleteStoredServiceImage(result.previousImageUrl !== nextImageUrl ? result.previousImageUrl : null);

    return NextResponse.json({ ok: true, imageUrl: nextImageUrl, message: "Service image uploaded." });
  } catch (error) {
    console.error("Service image upload failed", error);
    return NextResponse.json({ error: "Unable to upload this image right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ serviceId: string }> }) {
  const authError = await requireAdminSession();

  if (authError) {
    return authError;
  }

  try {
    const { serviceId } = await params;

    if (!isValidServiceId(serviceId)) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    const result = await setServiceImage(serviceId, null);
    await deleteStoredServiceImage(result.previousImageUrl);

    return NextResponse.json({ ok: true, imageUrl: null, message: "Service image removed." });
  } catch (error) {
    console.error("Service image removal failed", error);
    return NextResponse.json({ error: "Unable to remove this image right now." }, { status: 500 });
  }
}
