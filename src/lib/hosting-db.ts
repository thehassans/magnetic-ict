import { randomUUID } from "node:crypto";
import {
  findMongoDocuments,
  findOneMongoDocument,
  upsertMongoDocument
} from "@/lib/social-bot-db";
import type { HostingProvisionAccess } from "@/lib/hosting-types";

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
  configuration: {
    operatingSystemName: string | null;
    controlPanelName: string | null;
    addonNames: string[];
    locationName: string | null;
    extraMonthlyPrice: number;
    summaryLines: string[];
  };
  domain: {
    mode: "none" | "register";
    name: string | null;
    years: number;
    privacyProtection: boolean;
    unitPrice: number;
    totalPrice: number;
    status: "not_requested" | "pending" | "registered" | "failed";
    registrarReference: string | null;
    errorMessage: string | null;
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
  access: HostingProvisionAccess;
};

export const hostingCollections = {
  provisions: "HostingProvisions"
} as const;

const defaultHostingProvisionAccess: HostingProvisionAccess = {
  panel: "none",
  panelLabel: null,
  loginUrl: null,
  username: null,
  isReady: false,
  notes: null
};

function normalizeHostingProvisionAccess(value: Partial<HostingProvisionAccess> | null | undefined): HostingProvisionAccess {
  return {
    panel: value?.panel === "plesk" || value?.panel === "cpanel" || value?.panel === "directadmin" || value?.panel === "custom" ? value.panel : defaultHostingProvisionAccess.panel,
    panelLabel: typeof value?.panelLabel === "string" ? value.panelLabel : defaultHostingProvisionAccess.panelLabel,
    loginUrl: typeof value?.loginUrl === "string" ? value.loginUrl : defaultHostingProvisionAccess.loginUrl,
    username: typeof value?.username === "string" ? value.username : defaultHostingProvisionAccess.username,
    isReady: typeof value?.isReady === "boolean" ? value.isReady : defaultHostingProvisionAccess.isReady,
    notes: typeof value?.notes === "string" ? value.notes : defaultHostingProvisionAccess.notes
  };
}

function normalizeHostingProvisionRecord(record: HostingProvisionRecord | null) {
  if (!record) {
    return null;
  }

  const legacyRecord = record as HostingProvisionRecord & {
    access?: Partial<HostingProvisionAccess>;
  };

  return {
    ...record,
    access: normalizeHostingProvisionAccess(legacyRecord.access)
  } satisfies HostingProvisionRecord;
}

export function createHostingProvisionId() {
  return `hosting_${randomUUID()}`;
}

export async function getHostingProvisionByOrderId(orderId: string) {
  return normalizeHostingProvisionRecord(await findOneMongoDocument<HostingProvisionRecord>(hostingCollections.provisions, { orderId }));
}

export async function getHostingProvisions() {
  const records = await findMongoDocuments<HostingProvisionRecord>(hostingCollections.provisions, {}, { sort: { updatedAt: -1 }, limit: 200 });
  return records.map((record) => normalizeHostingProvisionRecord(record)).filter((record): record is HostingProvisionRecord => Boolean(record));
}

export async function getHostingProvisionsForUser(userId: string) {
  const records = await findMongoDocuments<HostingProvisionRecord>(hostingCollections.provisions, { userId }, { sort: { updatedAt: -1 }, limit: 100 });
  return records.map((record) => normalizeHostingProvisionRecord(record)).filter((record): record is HostingProvisionRecord => Boolean(record));
}

export async function updateHostingProvisionAccess(orderId: string, access: HostingProvisionAccess) {
  const current = await getHostingProvisionByOrderId(orderId);

  if (!current) {
    return null;
  }

  const nextRecord: HostingProvisionRecord = {
    ...current,
    access: normalizeHostingProvisionAccess(access),
    updatedAt: new Date().toISOString()
  };

  await upsertHostingProvision(nextRecord);
  return nextRecord;
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
      configuration: record.configuration,
      domain: record.domain,
      reseller: record.reseller,
      cloud: record.cloud,
      access: normalizeHostingProvisionAccess(record.access)
    },
    {
      _id: record._id,
      createdAt: record.createdAt
    }
  );

  return record;
}
