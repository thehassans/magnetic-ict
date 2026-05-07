import { saveManagedDomainDnsRecord } from "@/lib/domain-management";
import { getDomainDnsRecords, getManagedDomainById } from "@/lib/domain-management-db";
import {
  createMagneticCommerceInstallationId,
  getMagneticCommerceInstallationByOrderId,
  getMagneticCommerceInstallations,
  getMagneticCommerceInstallationsForUser,
  upsertMagneticCommerceInstallation,
  type MagneticCommerceDnsRecordSummary,
  type MagneticCommerceInstallationConfig,
  type MagneticCommerceInstallationRecord,
  type MagneticCommerceInstallationStatus
} from "@/lib/magnetic-commerce-db";
import { getDomainProviderSettings, getMagneticCommerceSettings } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";

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

type MagneticCommerceConfigInput = Partial<MagneticCommerceInstallationConfig>;

function normalizeAdminPath(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "/admin";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function buildStorefrontUrl(domain: string | null) {
  return domain ? `https://${domain}` : null;
}

function buildAdminUrl(domain: string | null, adminPath: string) {
  return domain ? `https://${domain}${normalizeAdminPath(adminPath)}` : null;
}

function buildDefaultConfiguration(order: MagneticCommerceOrder, defaultCurrency: string): MagneticCommerceInstallationConfig {
  return {
    businessName: order.user.name?.trim() || "Magnetic Commerce Store",
    brandColor: "#7c3aed",
    adminEmail: order.user.email,
    supportEmail: order.user.email,
    currency: defaultCurrency.toUpperCase(),
    logoUrl: "",
    launchNotes: ""
  };
}

function buildDefaultDnsState(): MagneticCommerceInstallationRecord["dns"] {
  return {
    lastAppliedAt: null,
    autoAppliedAt: null,
    records: []
  };
}

function sanitizeConfigurationInput(
  current: MagneticCommerceInstallationConfig,
  input: MagneticCommerceConfigInput
): MagneticCommerceInstallationConfig {
  return {
    businessName: typeof input.businessName === "string" ? input.businessName.trim() : current.businessName,
    brandColor: typeof input.brandColor === "string" ? input.brandColor.trim() : current.brandColor,
    adminEmail: typeof input.adminEmail === "string" ? input.adminEmail.trim() : current.adminEmail,
    supportEmail: typeof input.supportEmail === "string" ? input.supportEmail.trim() : current.supportEmail,
    currency: typeof input.currency === "string" ? input.currency.trim().toUpperCase() : current.currency,
    logoUrl: typeof input.logoUrl === "string" ? input.logoUrl.trim() : current.logoUrl,
    launchNotes: typeof input.launchNotes === "string" ? input.launchNotes.trim() : current.launchNotes
  };
}

function buildVerificationValue(template: string, installation: MagneticCommerceInstallationRecord) {
  return template
    .replaceAll("{{domain}}", installation.assignedDomain ?? "")
    .replaceAll("{{orderId}}", installation.orderId)
    .replaceAll("{{customerEmail}}", installation.customerEmail);
}

function normalizeLegacyInstallation(
  installation: MagneticCommerceInstallationRecord,
  fallbackConfig: MagneticCommerceInstallationConfig
): MagneticCommerceInstallationRecord {
  return {
    ...installation,
    configuration: installation.configuration
      ? sanitizeConfigurationInput(fallbackConfig, installation.configuration)
      : fallbackConfig,
    dns: installation.dns ?? buildDefaultDnsState()
  };
}

async function getMagneticCommerceOrder(orderId: string) {
  return (await prisma.order.findUnique({
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
}

export async function ensureMagneticCommerceInstallationForOrder(orderId: string) {
  const [existing, order, commerceSettings] = await Promise.all([
    getMagneticCommerceInstallationByOrderId(orderId),
    getMagneticCommerceOrder(orderId),
    getMagneticCommerceSettings()
  ]);

  if (!order || order.serviceTier?.service.catalogKey !== "magneticCommerce") {
    return null;
  }

  const fallbackConfig = buildDefaultConfiguration(order, commerceSettings.defaultStoreCurrency);

  if (existing) {
    const normalized = normalizeLegacyInstallation(existing, fallbackConfig);

    if (!existing.configuration || !existing.dns) {
      await upsertMagneticCommerceInstallation(normalized);
    }

    return normalized;
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
    configuration: fallbackConfig,
    dns: buildDefaultDnsState()
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

export async function getAdminMagneticCommerceInstallations() {
  const installations = await getMagneticCommerceInstallations();
  await Promise.all(installations.map((installation) => ensureMagneticCommerceInstallationForOrder(installation.orderId)));
  return getMagneticCommerceInstallations();
}

export async function userHasMagneticCommerceAccess(userId: string) {
  const installations = await syncMagneticCommerceInstallationsForUser(userId);
  return installations.length > 0;
}

export async function updateMagneticCommerceInstallationConfiguration(args: {
  orderId: string;
  userId: string;
  configuration: MagneticCommerceConfigInput;
}) {
  const installation = await ensureMagneticCommerceInstallationForOrder(args.orderId);

  if (!installation || installation.userId !== args.userId) {
    return null;
  }

  const now = new Date().toISOString();
  const nextRecord: MagneticCommerceInstallationRecord = {
    ...installation,
    updatedAt: now,
    configuration: sanitizeConfigurationInput(installation.configuration, args.configuration)
  };

  await upsertMagneticCommerceInstallation(nextRecord);
  return nextRecord;
}

export async function updateMagneticCommerceInstallationManagement(args: {
  orderId: string;
  status?: MagneticCommerceInstallationStatus;
  errorMessage?: string | null;
  storefrontUrl?: string | null;
  adminUrl?: string | null;
  configuration?: MagneticCommerceConfigInput;
}) {
  const installation = await ensureMagneticCommerceInstallationForOrder(args.orderId);

  if (!installation) {
    return null;
  }

  const now = new Date().toISOString();
  const nextRecord: MagneticCommerceInstallationRecord = {
    ...installation,
    status: args.status ?? installation.status,
    errorMessage: args.errorMessage ?? installation.errorMessage,
    storefrontUrl: args.storefrontUrl ?? installation.storefrontUrl,
    adminUrl: args.adminUrl ?? installation.adminUrl,
    updatedAt: now,
    activatedAt: args.status === "active" ? now : installation.activatedAt,
    configuration: args.configuration
      ? sanitizeConfigurationInput(installation.configuration, args.configuration)
      : installation.configuration
  };

  await upsertMagneticCommerceInstallation(nextRecord);
  return nextRecord;
}

export async function applyMagneticCommerceDnsTemplate(args: {
  orderId: string;
  userId: string;
  autoApplied?: boolean;
}) {
  const installation = await ensureMagneticCommerceInstallationForOrder(args.orderId);

  if (!installation || installation.userId !== args.userId) {
    return null;
  }

  if (!installation.assignedDomainId || !installation.assignedDomain) {
    throw new Error("Assign a managed domain before applying the Magnetic Commerce DNS template.");
  }

  const [domain, domainSettings, commerceSettings] = await Promise.all([
    getManagedDomainById(args.userId, installation.assignedDomainId),
    getDomainProviderSettings(),
    getMagneticCommerceSettings()
  ]);

  if (!domain || domain.status !== "active") {
    throw new Error("The selected domain must be active before DNS records can be applied.");
  }

  const existingRecords = await getDomainDnsRecords(domain._id, args.userId);
  const ttl = domainSettings.defaultDnsTtl;
  const templateRecords = [
    ...(commerceSettings.storefrontRootARecord.trim()
      ? [{ type: "A" as const, name: "@", value: commerceSettings.storefrontRootARecord.trim(), ttl, priority: null as number | null }]
      : []),
    ...(commerceSettings.storefrontWwwCnameTarget.trim()
      ? [{ type: "CNAME" as const, name: "www", value: commerceSettings.storefrontWwwCnameTarget.trim().toLowerCase(), ttl, priority: null as number | null }]
      : []),
    ...(commerceSettings.adminCnameTarget.trim()
      ? [{ type: "CNAME" as const, name: "admin", value: commerceSettings.adminCnameTarget.trim().toLowerCase(), ttl, priority: null as number | null }]
      : []),
    ...(commerceSettings.verificationTxtValue.trim()
      ? [{
          type: "TXT" as const,
          name: commerceSettings.verificationTxtName.trim().toLowerCase(),
          value: buildVerificationValue(commerceSettings.verificationTxtValue, installation),
          ttl,
          priority: null as number | null
        }]
      : [])
  ];

  const savedRecords: MagneticCommerceDnsRecordSummary[] = [];

  for (const templateRecord of templateRecords) {
    const existingRecord = existingRecords.find(
      (record) => record.type === templateRecord.type && record.name === templateRecord.name
    );

    const savedRecord = await saveManagedDomainDnsRecord(args.userId, domain._id, {
      recordId: existingRecord?._id,
      type: templateRecord.type,
      name: templateRecord.name,
      value: templateRecord.value,
      ttl: templateRecord.ttl,
      priority: templateRecord.priority
    });

    savedRecords.push({
      recordId: savedRecord._id,
      type: savedRecord.type,
      name: savedRecord.name,
      value: savedRecord.value,
      ttl: savedRecord.ttl,
      priority: savedRecord.priority ?? null
    });
  }

  const now = new Date().toISOString();
  const nextRecord: MagneticCommerceInstallationRecord = {
    ...installation,
    updatedAt: now,
    dns: {
      lastAppliedAt: now,
      autoAppliedAt: args.autoApplied ? now : installation.dns.autoAppliedAt,
      records: savedRecords
    }
  };

  await upsertMagneticCommerceInstallation(nextRecord);
  return nextRecord;
}

export async function assignMagneticCommerceDomain(args: {
  orderId: string;
  userId: string;
  domainId: string;
  domainName: string;
}) {
  const [installation, commerceSettings] = await Promise.all([
    ensureMagneticCommerceInstallationForOrder(args.orderId),
    getMagneticCommerceSettings()
  ]);

  if (!installation || installation.userId !== args.userId) {
    return null;
  }

  const now = new Date().toISOString();
  const nextRecord: MagneticCommerceInstallationRecord = {
    ...installation,
    status: "integration_requested",
    updatedAt: now,
    assignedDomainId: args.domainId,
    assignedDomain: args.domainName.trim().toLowerCase(),
    assignedAt: now,
    storefrontUrl: buildStorefrontUrl(args.domainName),
    adminUrl: buildAdminUrl(args.domainName, commerceSettings.adminPath)
  };

  await upsertMagneticCommerceInstallation(nextRecord);

  if (commerceSettings.autoApplyDnsOnAssignment) {
    return applyMagneticCommerceDnsTemplate({ orderId: args.orderId, userId: args.userId, autoApplied: true });
  }

  return nextRecord;
}

export async function activateMagneticCommerceInstallation(orderId: string) {
  const [installation, commerceSettings] = await Promise.all([
    ensureMagneticCommerceInstallationForOrder(orderId),
    getMagneticCommerceSettings()
  ]);

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
    adminUrl: buildAdminUrl(installation.assignedDomain, commerceSettings.adminPath)
  };

  await upsertMagneticCommerceInstallation(nextRecord);
  return nextRecord;
}
