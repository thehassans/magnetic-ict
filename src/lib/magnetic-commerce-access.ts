import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  createMagneticCommerceInstallationId,
  getMagneticCommerceInstallationByOrderId,
  getMagneticCommerceInstallationsForUser,
  upsertMagneticCommerceInstallation,
  type MagneticCommerceInstallationRecord
} from "@/lib/magnetic-commerce-db";
import { upsertDomainDnsRecord, type DomainDnsRecordRecord } from "@/lib/domain-management-db";

type MagneticCommerceOrder = {
  id: string;
  userId: string;
  tierNameSnapshot: string;
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
};

function buildStorefrontUrl(domain: string | null) {
  return domain ? `https://${domain}` : null;
}

function buildAdminUrl(domain: string | null) {
  return domain ? `https://${domain}/admin` : null;
}

export async function ensureMagneticCommerceInstallationForOrder(orderId: string) {
  const existing = await getMagneticCommerceInstallationByOrderId(orderId);

  if (existing) {
    return existing;
  }

  const order = (await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          email: true,
          name: true
        }
      },
      serviceTier: {
        select: {
          catalogKey: true,
          service: {
            select: {
              catalogKey: true
            }
          }
        }
      }
    }
  })) as MagneticCommerceOrder | null;

  if (!order || order.serviceTier?.service.catalogKey !== "magneticCommerce") {
    return null;
  }

  const now = new Date().toISOString();
  const record: MagneticCommerceInstallationRecord = {
    _id: createMagneticCommerceInstallationId(),
    orderId: order.id,
    userId: order.userId,
    customerEmail: order.user.email,
    customerName: order.user.name,
    serviceCatalogKey: "magneticCommerce",
    tierCatalogKey: order.serviceTier.catalogKey,
    tierName: order.tierNameSnapshot,
    status: "pending_domain_assignment",
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
    activatedAt: null,
    assignedDomainId: null,
    assignedDomain: null,
    assignedAt: null,
    storefrontUrl: null,
    adminUrl: null,
    surfaces: {
      web: true,
      ios: true,
      android: true
    },
    businessName: null,
    logoUrl: null,
    primaryColor: null,
    adminEmail: null,
    storeCurrency: null,
    appStatus: "pending",
    storefrontStatus: "pending",
    notes: null
  };

  await upsertMagneticCommerceInstallation(record);
  return record;
}

export async function syncMagneticCommerceInstallationsForUser(userId: string) {
  const orders = (await prisma.order.findMany({
    where: {
      userId,
      status: {
        in: ["PAID", "FULFILLED"]
      }
    },
    include: {
      user: {
        select: {
          email: true,
          name: true
        }
      },
      serviceTier: {
        select: {
          catalogKey: true,
          service: {
            select: {
              catalogKey: true
            }
          }
        }
      }
    }
  })) as MagneticCommerceOrder[];

  const relevantOrders = orders.filter((order) => order.serviceTier?.service.catalogKey === "magneticCommerce");

  await Promise.all(relevantOrders.map((order) => ensureMagneticCommerceInstallationForOrder(order.id)));

  return getMagneticCommerceInstallationsForUser(userId);
}

export async function userHasMagneticCommerceAccess(userId: string) {
  const installations = await syncMagneticCommerceInstallationsForUser(userId);
  return installations.length > 0;
}

export async function assignMagneticCommerceDomain(args: {
  orderId: string;
  userId: string;
  domainId: string;
  domainName: string;
}) {
  const installation = await ensureMagneticCommerceInstallationForOrder(args.orderId);

  if (!installation || installation.userId !== args.userId) {
    return null;
  }

  const now = new Date().toISOString();
  const domain = args.domainName.trim().toLowerCase();
  const nextRecord: MagneticCommerceInstallationRecord = {
    ...installation,
    status: "integration_requested",
    updatedAt: now,
    assignedDomainId: args.domainId,
    assignedDomain: domain,
    assignedAt: now,
    storefrontUrl: buildStorefrontUrl(domain),
    adminUrl: buildAdminUrl(domain)
  };

  await upsertMagneticCommerceInstallation(nextRecord);

  const dnsRecords: DomainDnsRecordRecord[] = [
    {
      _id: `dns_${randomUUID()}`,
      id: `dns_${randomUUID()}`,
      domainId: args.domainId,
      userId: args.userId,
      type: "A",
      name: "@",
      value: "192.168.1.1",
      ttl: 3600,
      priority: null,
      externalId: null,
      source: "platform",
      updatedAt: now,
      createdAt: now
    },
    {
      _id: `dns_${randomUUID()}`,
      id: `dns_${randomUUID()}`,
      domainId: args.domainId,
      userId: args.userId,
      type: "CNAME",
      name: "www",
      value: domain,
      ttl: 3600,
      priority: null,
      externalId: null,
      source: "platform",
      updatedAt: now,
      createdAt: now
    },
    {
      _id: `dns_${randomUUID()}`,
      id: `dns_${randomUUID()}`,
      domainId: args.domainId,
      userId: args.userId,
      type: "CNAME",
      name: "admin",
      value: domain,
      ttl: 3600,
      priority: null,
      externalId: null,
      source: "platform",
      updatedAt: now,
      createdAt: now
    }
  ];

  await Promise.all(dnsRecords.map((record) => upsertDomainDnsRecord(record)));

  return nextRecord;
}

export async function activateMagneticCommerceInstallation(orderId: string) {
  const installation = await ensureMagneticCommerceInstallationForOrder(orderId);

  if (!installation) {
    return null;
  }

  const now = new Date().toISOString();
  const nextRecord: MagneticCommerceInstallationRecord = {
    ...installation,
    status: installation.assignedDomain ? "active" : installation.status,
    updatedAt: now,
    activatedAt: installation.assignedDomain ? now : installation.activatedAt,
    storefrontUrl: buildStorefrontUrl(installation.assignedDomain),
    adminUrl: buildAdminUrl(installation.assignedDomain)
  };

  await upsertMagneticCommerceInstallation(nextRecord);
  return nextRecord;
}

export async function updateMagneticCommerceInstallationConfig(args: {
  orderId: string;
  userId: string;
  businessName?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  adminEmail?: string | null;
  storeCurrency?: string | null;
  notes?: string | null;
  appStatus?: "pending" | "deploying" | "live" | "maintenance" | "offline";
  storefrontStatus?: "pending" | "deploying" | "live" | "maintenance" | "offline";
}) {
  const installation = await ensureMagneticCommerceInstallationForOrder(args.orderId);

  if (!installation || installation.userId !== args.userId) {
    return null;
  }

  const now = new Date().toISOString();
  const nextRecord: MagneticCommerceInstallationRecord = {
    ...installation,
    businessName: args.businessName ?? installation.businessName,
    logoUrl: args.logoUrl ?? installation.logoUrl,
    primaryColor: args.primaryColor ?? installation.primaryColor,
    adminEmail: args.adminEmail ?? installation.adminEmail,
    storeCurrency: args.storeCurrency ?? installation.storeCurrency,
    notes: args.notes ?? installation.notes,
    appStatus: args.appStatus ?? installation.appStatus,
    storefrontStatus: args.storefrontStatus ?? installation.storefrontStatus,
    updatedAt: now
  };

  await upsertMagneticCommerceInstallation(nextRecord);
  return nextRecord;
}

