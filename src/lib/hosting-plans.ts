import type { HostingPlanDefinition } from "@/lib/hosting-types";

const hostingPlans: Record<string, HostingPlanDefinition> = {
  "magneticVpsHosting-starter": {
    tierCatalogKey: "magneticVpsHosting-starter",
    name: "Starter",
    cores: 2,
    ramMb: 2048,
    storageGb: 60
  },
  "magneticVpsHosting-professional": {
    tierCatalogKey: "magneticVpsHosting-professional",
    name: "Professional",
    cores: 4,
    ramMb: 8192,
    storageGb: 120
  },
  "magneticVpsHosting-enterprise": {
    tierCatalogKey: "magneticVpsHosting-enterprise",
    name: "Enterprise",
    cores: 8,
    ramMb: 16384,
    storageGb: 240
  }
};

export function isMagneticVpsService(serviceCatalogKey: string) {
  return serviceCatalogKey === "magneticVpsHosting";
}

export function getHostingPlanForTier(tierCatalogKey: string) {
  return hostingPlans[tierCatalogKey] ?? null;
}
