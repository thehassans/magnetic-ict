import { serviceCatalog, type CatalogService } from "@/lib/service-catalog";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

type PersistedServiceTier = {
  catalogKey: string;
  name: string;
  price: number;
  features: unknown;
};

type PersistedService = {
  catalogKey: string;
  name: string;
  description: string;
  image: string | null;
  category: string;
  features: unknown;
  tiers: PersistedServiceTier[];
};

export type ServiceOverride = CatalogService & {
  overrides: {
    title: boolean;
    description: boolean;
    category: boolean;
    imageLabel: boolean;
    tierNames: Record<string, boolean>;
    tierPrices: Record<string, boolean>;
  };
};

export async function getServiceCatalogWithOverrides(): Promise<ServiceOverride[]> {
  if (!hasDatabase) {
    return serviceCatalog.map((service) => ({
      ...service,
      overrides: {
        title: false,
        description: false,
        category: false,
        imageLabel: false,
        tierNames: Object.fromEntries(service.tiers.map((tier) => [tier.id, false])),
        tierPrices: Object.fromEntries(service.tiers.map((tier) => [tier.id, false]))
      }
    })) as ServiceOverride[];
  }

  const persistedServiceRows = await prisma.service.findMany({
    include: {
      tiers: {
        select: {
          catalogKey: true,
          name: true,
          price: true,
          features: true
        }
      }
    }
  }).catch(() => [] as unknown[]);

  const persistedServices = persistedServiceRows as PersistedService[];

  const persistedByKey = new Map<string, PersistedService>(persistedServices.map((service: PersistedService) => [service.catalogKey, service]));

  return serviceCatalog.map((service) => {
    const persisted = persistedByKey.get(service.id);
    const persistedTiersByKey = new Map<string, PersistedServiceTier>((persisted?.tiers ?? []).map((tier: PersistedServiceTier) => [tier.catalogKey, tier]));

    return {
      ...service,
      name: persisted?.name ?? service.name,
      description: persisted?.description ?? service.description,
      category: persisted?.category ?? service.category,
      imageLabel: persisted?.image ?? service.imageLabel,
      highlights: Array.isArray(persisted?.features) ? (persisted?.features as string[]) : service.highlights,
      tiers: service.tiers.map((tier) => {
        const persistedTier = persistedTiersByKey.get(tier.id);

        return {
          ...tier,
          name: persistedTier?.name === "Starter" || persistedTier?.name === "Professional" || persistedTier?.name === "Enterprise"
            ? persistedTier.name
            : tier.name,
          price: persistedTier?.price ?? tier.price,
          features: Array.isArray(persistedTier?.features) ? (persistedTier?.features as string[]) : tier.features
        };
      }),
      overrides: {
        title: Boolean(persisted && persisted.name !== service.name),
        description: Boolean(persisted && persisted.description !== service.description),
        category: Boolean(persisted && persisted.category !== service.category),
        imageLabel: Boolean(persisted && persisted.image !== service.imageLabel),
        tierNames: Object.fromEntries(
          service.tiers.map((tier) => {
            const persistedTier = persistedTiersByKey.get(tier.id);
            return [tier.id, Boolean(persistedTier && persistedTier.name !== tier.name)];
          })
        ),
        tierPrices: Object.fromEntries(
          service.tiers.map((tier) => {
            const persistedTier = persistedTiersByKey.get(tier.id);
            return [tier.id, Boolean(persistedTier && persistedTier.price !== tier.price)];
          })
        )
      }
    } satisfies ServiceOverride;
  });
}

export async function getServiceByIdWithOverrides(serviceId: string) {
  const services = await getServiceCatalogWithOverrides();
  return services.find((service) => service.id === serviceId) ?? null;
}

export function hasServiceCopyOverrides(service: ServiceOverride) {
  return service.overrides.title || service.overrides.description;
}
