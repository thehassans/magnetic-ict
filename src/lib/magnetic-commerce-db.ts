import { randomUUID } from "node:crypto";
import { findMongoDocuments, findOneMongoDocument, upsertMongoDocument } from "@/lib/social-bot-db";

export type MagneticCommerceInstallationStatus =
  | "pending_domain_assignment"
  | "integration_requested"
  | "active"
  | "failed";

export type MagneticCommerceInstallationConfig = {
  businessName: string;
  brandColor: string;
  adminEmail: string;
  supportEmail: string;
  currency: string;
  logoUrl: string;
  launchNotes: string;
};

export type MagneticCommerceDnsRecordSummary = {
  recordId: string | null;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
  name: string;
  value: string;
  ttl: number;
  priority: number | null;
};

export type MagneticCommerceDnsState = {
  lastAppliedAt: string | null;
  autoAppliedAt: string | null;
  records: MagneticCommerceDnsRecordSummary[];
};

export type MagneticCommerceInstallationRecord = {
  _id: string;
  orderId: string;
  userId: string;
  customerEmail: string;
  customerName: string | null;
  serviceCatalogKey: "magneticCommerce";
  tierCatalogKey: string;
  tierName: string;
  status: MagneticCommerceInstallationStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
  assignedDomainId: string | null;
  assignedDomain: string | null;
  assignedAt: string | null;
  storefrontUrl: string | null;
  adminUrl: string | null;
  surfaces: {
    web: boolean;
    ios: boolean;
    android: boolean;
  };
  configuration: MagneticCommerceInstallationConfig;
  dns: MagneticCommerceDnsState;
};

export const magneticCommerceCollections = {
  installations: "MagneticCommerceInstallations"
} as const;

export function createMagneticCommerceInstallationId() {
  return `magnetic_commerce_${randomUUID()}`;
}

export async function getMagneticCommerceInstallationByOrderId(orderId: string) {
  return findOneMongoDocument<MagneticCommerceInstallationRecord>(magneticCommerceCollections.installations, { orderId });
}

export async function getMagneticCommerceInstallationsForUser(userId: string) {
  return findMongoDocuments<MagneticCommerceInstallationRecord>(
    magneticCommerceCollections.installations,
    { userId },
    { sort: { updatedAt: -1 }, limit: 100 }
  );
}

export async function getMagneticCommerceInstallations() {
  return findMongoDocuments<MagneticCommerceInstallationRecord>(
    magneticCommerceCollections.installations,
    {},
    { sort: { updatedAt: -1 }, limit: 500 }
  );
}

export async function upsertMagneticCommerceInstallation(record: MagneticCommerceInstallationRecord) {
  await upsertMongoDocument(
    magneticCommerceCollections.installations,
    { orderId: record.orderId },
    {
      orderId: record.orderId,
      userId: record.userId,
      customerEmail: record.customerEmail,
      customerName: record.customerName,
      serviceCatalogKey: record.serviceCatalogKey,
      tierCatalogKey: record.tierCatalogKey,
      tierName: record.tierName,
      status: record.status,
      errorMessage: record.errorMessage,
      updatedAt: record.updatedAt,
      activatedAt: record.activatedAt,
      assignedDomainId: record.assignedDomainId,
      assignedDomain: record.assignedDomain,
      assignedAt: record.assignedAt,
      storefrontUrl: record.storefrontUrl,
      adminUrl: record.adminUrl,
      surfaces: record.surfaces,
      configuration: record.configuration,
      dns: record.dns
    },
    {
      _id: record._id,
      createdAt: record.createdAt
    }
  );

  return record;
}
