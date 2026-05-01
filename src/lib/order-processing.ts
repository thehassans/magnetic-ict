import { prisma } from "@/lib/prisma";
import { syncServiceCatalog } from "@/lib/catalog-sync";
import { sendOrderStatusEmail } from "@/lib/email";
import { getHostingConfigurationTotal, resolveHostingConfiguration } from "@/lib/hosting-commerce";
import { createProvisionRequestFromOrder, provisionMagneticVpsHosting } from "@/lib/ionos-hosting";
import type { HostingConfigurationSelection, ResolvedHostingConfiguration } from "@/lib/hosting-types";
import { isMagneticVpsService } from "@/lib/hosting-plans";
import { getHostingProviderSettings } from "@/lib/platform-settings";
import { getVisibleServiceCatalogWithOverrides } from "@/lib/service-overrides";

export type CheckoutPaymentMethod = "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY";
export type CheckoutCartItem = {
  serviceId: string;
  tierId: string;
  price: number;
  hostingConfiguration?: HostingConfigurationSelection;
  hostingSummary?: string[];
};

type PersistedTier = {
  id: string;
  catalogKey: string;
  price: number;
  name: string;
  service: {
    name: string;
  };
};

type CreatedOrder = {
  id: string;
  amount: number;
  serviceNameSnapshot: string;
  tierNameSnapshot: string;
};

type LifecycleOrder = {
  id: string;
  userId: string;
  amount: number;
  serviceNameSnapshot: string;
  tierNameSnapshot: string;
  invoiceNumber: string | null;
  serviceTier: {
    catalogKey: string;
    service: {
      catalogKey: string;
    };
  } | null;
  user: {
    email: string;
    name: string | null;
  };
  events: Array<{
    type: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
    metadata: Record<string, unknown> | null;
  }>;
};

type OrderCreatedMetadata = {
  paymentMethod: CheckoutPaymentMethod;
  itemCount: number;
  hostingConfiguration?: ResolvedHostingConfiguration;
};

function createInvoiceNumber(orderId: string) {
  return `INV-${new Date().getUTCFullYear()}-${orderId.slice(-6).toUpperCase()}`;
}

async function createOrderEvents({
  orderIds,
  type,
  statusSnapshot,
  paymentRef,
  metadata,
  metadataByOrderId
}: {
  orderIds: string[];
  type: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  statusSnapshot: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  paymentRef?: string;
  metadata?: Record<string, unknown>;
  metadataByOrderId?: Record<string, Record<string, unknown>>;
}) {
  if (orderIds.length === 0) {
    return;
  }

  const data = orderIds.map((orderId) => ({
    orderId,
    type,
    statusSnapshot,
    paymentRef,
    metadata: metadataByOrderId?.[orderId] ?? metadata ?? undefined
  }));

  await prisma.orderEvent.createMany({
    data: data as never
  });
}

async function getLifecycleOrders(orderIds: string[]) {
  if (orderIds.length === 0) {
    return [] as LifecycleOrder[];
  }

  return (await prisma.order.findMany({
    where: {
      id: {
        in: orderIds
      }
    },
    select: {
      id: true,
      userId: true,
      amount: true,
      serviceNameSnapshot: true,
      tierNameSnapshot: true,
      invoiceNumber: true,
      serviceTier: {
        select: {
          catalogKey: true,
          service: {
            select: {
              catalogKey: true
            }
          }
        }
      },
      user: {
        select: {
          email: true,
          name: true
        }
      },
      events: {
        where: {
          type: "CREATED"
        },
        select: {
          type: true,
          metadata: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    }
  })) as LifecycleOrder[];
}

function getCreatedMetadata(order: LifecycleOrder): OrderCreatedMetadata | null {
  const metadata = order.events[0]?.metadata;

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return metadata as OrderCreatedMetadata;
}

async function notifyOrders(
  orders: LifecycleOrder[],
  status: "PAID" | "FAILED" | "CANCELLED" | "FULFILLED"
) {
  await Promise.allSettled(
    orders.map((order) =>
      sendOrderStatusEmail({
        email: order.user.email,
        customerName: order.user.name,
        serviceName: order.serviceNameSnapshot,
        tierName: order.tierNameSnapshot,
        amount: order.amount,
        status,
        invoiceNumber: order.invoiceNumber
      })
    )
  );
}

export async function createPendingOrders({
  userId,
  paymentMethod,
  items
}: {
  userId: string;
  paymentMethod: CheckoutPaymentMethod;
  items: CheckoutCartItem[];
}) {
  await syncServiceCatalog();

  const visibleServices = await getVisibleServiceCatalogWithOverrides();
  const visibleServiceIds = new Set<string>(visibleServices.map((service) => service.id));
  const tierToServiceId = new Map<string, string>(visibleServices.flatMap((service) => service.tiers.map((tier) => [tier.id, service.id] as const)));

  for (const item of items) {
    if (!visibleServiceIds.has(item.serviceId) || tierToServiceId.get(item.tierId) !== item.serviceId) {
      throw new Error("One or more selected services are unavailable.");
    }
  }

  const uniqueTierKeys = [...new Set(items.map((item) => item.tierId))];
  const tiers = (await prisma.serviceTier.findMany({
    where: {
      catalogKey: {
        in: uniqueTierKeys
      }
    },
    include: {
      service: true
    }
  })) as PersistedTier[];

  if (tiers.length !== uniqueTierKeys.length) {
    throw new Error("One or more selected tiers are unavailable.");
  }

  const tiersByCatalogKey = new Map(tiers.map((tier) => [tier.catalogKey, tier] as const));
  const hostingSettings = await getHostingProviderSettings();
  const resolvedHostingConfigurations = items.map((item) =>
    isMagneticVpsService(item.serviceId) ? resolveHostingConfiguration(item.hostingConfiguration, hostingSettings) : null
  );

  const createdOrders = (await prisma.$transaction(
    items.map((item, index) => {
      const tier = tiersByCatalogKey.get(item.tierId);
      const hostingConfiguration = resolvedHostingConfigurations[index];

      if (!tier) {
        throw new Error(`Missing tier for ${item.tierId}`);
      }

      const amount = hostingConfiguration ? getHostingConfigurationTotal(tier.price, hostingConfiguration) : tier.price;
      const tierNameSnapshot = hostingConfiguration?.controlPanel
        ? `${tier.name} · ${hostingConfiguration.controlPanel.name}`
        : tier.name;

      return prisma.order.create({
        data: {
          userId,
          serviceTierId: tier.id,
          status: "PENDING",
          paymentMethod,
          currency: "USD",
          amount,
          serviceNameSnapshot: tier.service.name,
          tierNameSnapshot
        },
        select: {
          id: true,
          amount: true,
          serviceNameSnapshot: true,
          tierNameSnapshot: true
        }
      });
    })
  )) as CreatedOrder[];

  await createOrderEvents({
    orderIds: createdOrders.map((order) => order.id),
    type: "CREATED",
    statusSnapshot: "PENDING",
    metadataByOrderId: Object.fromEntries(
      createdOrders.map((order, index) => [
        order.id,
        {
          paymentMethod,
          itemCount: items.length,
          ...(resolvedHostingConfigurations[index]
            ? {
                hostingConfiguration: resolvedHostingConfigurations[index]
              }
            : {})
        }
      ])
    )
  });

  return createdOrders;
}

export async function setPaymentReferenceForOrders(orderIds: string[], paymentReference: string) {
  if (orderIds.length === 0) {
    return;
  }

  await prisma.order.updateMany({
    where: {
      id: {
        in: orderIds
      }
    },
    data: {
      paymentReference
    }
  });
}

export async function getOrdersByPaymentReference(paymentReference: string) {
  if (!paymentReference) {
    return [];
  }

  return prisma.order.findMany({
    where: { paymentReference },
    select: { id: true }
  });
}

export async function markOrdersPaid(orderIds: string[], paymentReference: string) {
  if (orderIds.length === 0) {
    return;
  }

  const existingOrders = await getLifecycleOrders(orderIds);
  const now = new Date();

  await prisma.$transaction(
    existingOrders.map((order) =>
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentReference,
          paidAt: now,
          invoiceNumber: order.invoiceNumber ?? createInvoiceNumber(order.id)
        }
      })
    )
  );

  await createOrderEvents({
    orderIds,
    type: "PAID",
    statusSnapshot: "PAID",
    paymentRef: paymentReference
  });

  const paidOrders = await getLifecycleOrders(orderIds);
  await notifyOrders(paidOrders, "PAID");
}

export async function markOrdersCancelled(orderIds: string[]) {
  if (orderIds.length === 0) {
    return;
  }

  const cancellableOrders = await getLifecycleOrders(orderIds);

  await prisma.order.updateMany({
    where: {
      id: {
        in: orderIds
      },
      status: "PENDING"
    },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date()
    }
  });

  await createOrderEvents({
    orderIds,
    type: "CANCELLED",
    statusSnapshot: "CANCELLED"
  });

  await notifyOrders(cancellableOrders, "CANCELLED");
}

export async function markOrdersFailed(orderIds: string[]) {
  if (orderIds.length === 0) {
    return;
  }

  const failedOrders = await getLifecycleOrders(orderIds);

  await prisma.order.updateMany({
    where: {
      id: {
        in: orderIds
      },
      status: "PENDING"
    },
    data: {
      status: "FAILED",
      failedAt: new Date()
    }
  });

  await createOrderEvents({
    orderIds,
    type: "FAILED",
    statusSnapshot: "FAILED"
  });

  await notifyOrders(failedOrders, "FAILED");
}

export async function markOrdersFulfilled(orderIds: string[]) {
  if (orderIds.length === 0) {
    return;
  }

  const fulfilledOrders = await getLifecycleOrders(orderIds);
  const paidOrders = fulfilledOrders.filter((order) => order.serviceTier && orderIds.includes(order.id));
  const hostingSettings = await getHostingProviderSettings();

  for (const order of paidOrders) {
    const serviceCatalogKey = order.serviceTier?.service.catalogKey;
    const tierCatalogKey = order.serviceTier?.catalogKey;
    const createdMetadata = getCreatedMetadata(order);

    if (!serviceCatalogKey || !tierCatalogKey || !isMagneticVpsService(serviceCatalogKey)) {
      continue;
    }

    const provisionRequest = createProvisionRequestFromOrder({
      orderId: order.id,
      userId: order.userId,
      customerEmail: order.user.email,
      customerName: order.user.name,
      serviceCatalogKey,
      tierCatalogKey,
      tierName: order.tierNameSnapshot,
      configuration: createdMetadata?.hostingConfiguration ?? resolveHostingConfiguration(undefined, hostingSettings)
    });

    await provisionMagneticVpsHosting(provisionRequest);
  }

  await prisma.order.updateMany({
    where: {
      id: {
        in: orderIds
      },
      status: "PAID"
    },
    data: {
      status: "FULFILLED",
      fulfilledAt: new Date()
    }
  });

  await createOrderEvents({
    orderIds,
    type: "FULFILLED",
    statusSnapshot: "FULFILLED"
  });

  await notifyOrders(fulfilledOrders, "FULFILLED");
}
