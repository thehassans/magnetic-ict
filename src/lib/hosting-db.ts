import { randomUUID } from "node:crypto";
import {
  findMongoDocuments,
  findOneMongoDocument,
  upsertMongoDocument
} from "@/lib/social-bot-db";

export type HostingProvisionStatus =
  | "pending"
  | "contract_created"
  | "admin_created"
  | "datacenter_created"
  | "server_created"
  | "volume_attached"
  | "provisioned"
  | "failed";

export type HostingProvisionRecord = {
  _id: string;
  orderId: string;
  userId: string;
  customerEmail: string;
  customerName: string | null;
  serviceCatalogKey: string;
  tierCatalogKey: string;
  tierName: string;
  provider: "ionos";
  status: HostingProvisionStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  provisionedAt: string | null;
  plan: {
    cores: number;
    ramMb: number;
    storageGb: number;
    imageAlias: string;
    location: string;
  };
  reseller: {
    contractId: string | null;
    adminId: string | null;
    contractReference: string | null;
  };
  cloud: {
    contractNumber: string | null;
    datacenterId: string | null;
    serverId: string | null;
    volumeId: string | null;
    location: string | null;
  };
};

export const hostingCollections = {
  provisions: "HostingProvisions"
} as const;

export function createHostingProvisionId() {
  return `hosting_${randomUUID()}`;
}

export async function getHostingProvisionByOrderId(orderId: string) {
  return findOneMongoDocument<HostingProvisionRecord>(hostingCollections.provisions, { orderId });
}

export async function getHostingProvisions() {
  return findMongoDocuments<HostingProvisionRecord>(hostingCollections.provisions, {}, { sort: { updatedAt: -1 }, limit: 200 });
}

export async function upsertHostingProvision(record: HostingProvisionRecord) {
  await upsertMongoDocument(
    hostingCollections.provisions,
    { orderId: record.orderId },
    {
      orderId: record.orderId,
      userId: record.userId,
      customerEmail: record.customerEmail,
      customerName: record.customerName,
      serviceCatalogKey: record.serviceCatalogKey,
      tierCatalogKey: record.tierCatalogKey,
      tierName: record.tierName,
      provider: record.provider,
      status: record.status,
      errorMessage: record.errorMessage,
      updatedAt: record.updatedAt,
      provisionedAt: record.provisionedAt,
      plan: record.plan,
      reseller: record.reseller,
      cloud: record.cloud
    },
    {
      _id: record._id,
      createdAt: record.createdAt
    }
  );

  return record;
}
