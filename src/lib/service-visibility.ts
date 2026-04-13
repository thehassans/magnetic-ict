import type { ServiceMenuKey } from "@/lib/service-menu";
import { prisma } from "@/lib/prisma";
import { serviceCatalog } from "@/lib/service-catalog";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const serviceVisibilitySettingKey = "service_visibility";

export type ServiceVisibilityState = {
  enabled: boolean;
  deleted: boolean;
};

export type ServiceVisibilityMap = Record<ServiceMenuKey, ServiceVisibilityState>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function createDefaultServiceVisibilityMap(): ServiceVisibilityMap {
  return serviceCatalog.reduce((map, service) => {
    map[service.id] = { enabled: true, deleted: false };
    return map;
  }, {} as ServiceVisibilityMap);
}

export function normalizeServiceVisibilityMap(value: unknown): ServiceVisibilityMap {
  const fallback = createDefaultServiceVisibilityMap();

  if (!isObject(value)) {
    return fallback;
  }

  for (const service of serviceCatalog) {
    const entry = value[service.id];

    if (!isObject(entry)) {
      continue;
    }

    fallback[service.id] = {
      enabled: typeof entry.enabled === "boolean" ? entry.enabled : true,
      deleted: typeof entry.deleted === "boolean" ? entry.deleted : false
    };
  }

  return fallback;
}

export async function getServiceVisibilityMap(): Promise<ServiceVisibilityMap> {
  if (!hasDatabase) {
    return createDefaultServiceVisibilityMap();
  }

  const setting = await prisma.setting.findUnique({
    where: { key: serviceVisibilitySettingKey },
    select: { value: true }
  }).catch(() => null);

  return normalizeServiceVisibilityMap(setting?.value ?? null);
}

export async function updateServiceVisibility(serviceId: ServiceMenuKey, nextState: Partial<ServiceVisibilityState>) {
  const current = await getServiceVisibilityMap();
  const currentState = current[serviceId] ?? { enabled: true, deleted: false };

  const mergedState: ServiceVisibilityState = {
    enabled: nextState.deleted === true ? false : nextState.enabled ?? currentState.enabled,
    deleted: nextState.deleted ?? currentState.deleted
  };

  const nextMap: ServiceVisibilityMap = {
    ...current,
    [serviceId]: mergedState
  };

  await prisma.setting.upsert({
    where: { key: serviceVisibilitySettingKey },
    update: { value: nextMap },
    create: { key: serviceVisibilitySettingKey, value: nextMap }
  });

  return mergedState;
}
