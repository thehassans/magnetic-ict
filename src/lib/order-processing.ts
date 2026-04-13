import { prisma } from "@/lib/prisma";
import { syncServiceCatalog } from "@/lib/catalog-sync";
import { sendOrderStatusEmail } from "@/lib/email";
import { getVisibleServiceCatalogWithOverrides } from "@/lib/service-overrides";

export type CheckoutPaymentMethod = "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY";
export type CheckoutCartItem = {
  serviceId: string;
  tierId: string;
  price: number;
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
  amount: number;
  serviceNameSnapshot: string;
  tierNameSnapshot: string;
  invoiceNumber: string | null;
  user: {
    email: string;
    name: string | null;
  };
};

function createInvoiceNumber(orderId: string) {
  return `INV-${new Date().getUTCFullYear()}-${orderId.slice(-6).toUpperCase()}`;
}

async function createOrderEvents({
  orderIds,
  type,
  statusSnapshot,
  paymentRef,
  metadata
}: {
  orderIds: string[];
  type: "CREATED" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  statusSnapshot: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  paymentRef?: string;
  metadata?: Record<string, unknown>;
}) {
  if (orderIds.length === 0) {
    return;
  }

  const data = orderIds.map((orderId) => ({
    orderId,
    type,
    statusSnapshot,
    paymentRef,
    metadata: metadata ?? undefined
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
      amount: true,
      serviceNameSnapshot: true,
      tierNameSnapshot: true,
      invoiceNumber: true,
      user: {
        select: {
          email: true,
          name: true
        }
      }
    }
  })) as LifecycleOrder[];
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

  const createdOrders = (await prisma.$transaction(
    items.map((item) => {
      const tier = tiersByCatalogKey.get(item.tierId);

      if (!tier) {
        throw new Error(`Missing tier for ${item.tierId}`);
      }

      return prisma.order.create({
        data: {
          userId,
          serviceTierId: tier.id,
          status: "PENDING",
          paymentMethod,
          currency: "USD",
          amount: tier.price,
          serviceNameSnapshot: tier.service.name,
          tierNameSnapshot: tier.name
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
    metadata: {
      paymentMethod,
      itemCount: items.length
    }
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
