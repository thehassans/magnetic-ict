import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ServiceMenuKey } from "@/lib/service-menu";
import { prisma } from "@/lib/prisma";
import { serviceCatalog } from "@/lib/service-catalog";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const serviceImagesSettingKey = "service_images";
const serviceUploadsPrefix = "/uploads/services/";

export type ServiceImageMap = Record<ServiceMenuKey, string | null>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createDefaultServiceImageMap(): ServiceImageMap {
  return serviceCatalog.reduce((map, service) => {
    map[service.id] = null;
    return map;
  }, {} as ServiceImageMap);
}

export function normalizeServiceImageMap(value: unknown): ServiceImageMap {
  const fallback = createDefaultServiceImageMap();

  if (!isObject(value)) {
    return fallback;
  }

  for (const service of serviceCatalog) {
    const entry = value[service.id];
    fallback[service.id] = typeof entry === "string" && entry.length > 0 ? entry : null;
  }

  return fallback;
}

export async function getServiceImageMap(): Promise<ServiceImageMap> {
  if (!hasDatabase) {
    return createDefaultServiceImageMap();
  }

  const setting = await prisma.setting.findUnique({
    where: { key: serviceImagesSettingKey },
    select: { value: true }
  }).catch(() => null);

  return normalizeServiceImageMap(setting?.value ?? null);
}

export async function setServiceImage(serviceId: ServiceMenuKey, imageUrl: string | null) {
  const current = await getServiceImageMap();
  const previousImageUrl = current[serviceId] ?? null;
  const nextMap: ServiceImageMap = {
    ...current,
    [serviceId]: imageUrl
  };

  await prisma.setting.upsert({
    where: { key: serviceImagesSettingKey },
    update: { value: nextMap },
    create: { key: serviceImagesSettingKey, value: nextMap }
  });

  return { previousImageUrl, imageUrl };
}

export function createServiceImageUploadPath(serviceId: ServiceMenuKey) {
  return `${serviceUploadsPrefix}${serviceId}-${Date.now()}.webp`;
}

export async function saveServiceImageToPublic(relativeImagePath: string, fileBuffer: Buffer) {
  const absoluteImagePath = path.join(process.cwd(), "public", relativeImagePath.replace(/^\//, ""));
  await mkdir(path.dirname(absoluteImagePath), { recursive: true });
  await writeFile(absoluteImagePath, fileBuffer);
  return absoluteImagePath;
}

export async function deleteStoredServiceImage(imageUrl: string | null) {
  if (!imageUrl || !imageUrl.startsWith(serviceUploadsPrefix)) {
    return;
  }

  const absoluteImagePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  await unlink(absoluteImagePath).catch(() => undefined);
}
