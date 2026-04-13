import { prisma } from "@/lib/prisma";
import { serviceCatalog } from "@/lib/service-catalog";

export async function syncServiceCatalog() {
  for (const service of serviceCatalog) {
    const persistedService = await prisma.service.upsert({
      where: { catalogKey: service.id },
      update: {
        name: service.name,
        description: service.description,
        image: service.imageLabel,
        features: service.highlights,
        category: service.category
      },
      create: {
        catalogKey: service.id,
        name: service.name,
        description: service.description,
        image: service.imageLabel,
        features: service.highlights,
        category: service.category
      }
    });

    for (const tier of service.tiers) {
      await prisma.serviceTier.upsert({
        where: { catalogKey: tier.id },
        update: {
          serviceId: persistedService.id,
          name: tier.name,
          price: tier.price,
          features: tier.features
        },
        create: {
          catalogKey: tier.id,
          serviceId: persistedService.id,
          name: tier.name,
          price: tier.price,
          features: tier.features
        }
      });
    }
  }
}
