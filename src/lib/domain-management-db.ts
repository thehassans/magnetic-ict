import { randomUUID } from "node:crypto";
import { deleteMongoDocuments, findMongoDocuments, findOneMongoDocument, upsertMongoDocument } from "@/lib/social-bot-db";
import type { DomainDnsRecord, DomainPaymentMethod, DomainTransactionType, ManagedDomainStatus, ManagedDomainSummary } from "@/lib/domain-types";

export type ManagedDomainRecord = ManagedDomainSummary & {
  _id: string;
  provider: "ionos" | "manual";
  errorMessage: string | null;
  createdAt: string;
  lastSyncedAt: string | null;
};

export type DomainTransactionStatus = "pending" | "paid" | "active" | "failed" | "cancelled";

export type DomainTransactionRecord = {
  _id: string;
  domainId: string | null;
  orderId: string | null;
  userId: string;
  domain: string;
  type: DomainTransactionType;
  status: DomainTransactionStatus;
  amount: number;
  currency: "USD";
  paymentMethod: DomainPaymentMethod | "MANUAL";
  paymentReference: string | null;
  registrarReference: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
};

export type DomainDnsRecordRecord = DomainDnsRecord & {
  _id: string;
  userId: string;
};

export const domainManagementCollections = {
  domains: "ManagedDomains",
  transactions: "DomainTransactions",
  dnsRecords: "DomainDnsRecords"
} as const;

export function createManagedDomainId() {
  return `managed_domain_${randomUUID()}`;
}

export function createDomainTransactionId() {
  return `domain_txn_${randomUUID()}`;
}

export function createManagedDnsRecordId() {
  return `dns_${randomUUID()}`;
}

export async function getManagedDomainById(userId: string, id: string) {
  return findOneMongoDocument<ManagedDomainRecord>(domainManagementCollections.domains, { _id: id, userId });
}

export async function getManagedDomainByName(domain: string) {
  return findOneMongoDocument<ManagedDomainRecord>(domainManagementCollections.domains, { domain: domain.trim().toLowerCase() });
}

export async function getManagedDomainByOrderId(orderId: string) {
  return findOneMongoDocument<ManagedDomainRecord>(domainManagementCollections.domains, { orderId });
}

export async function getManagedDomainsForUser(userId: string) {
  return findMongoDocuments<ManagedDomainRecord>(domainManagementCollections.domains, { userId }, { sort: { updatedAt: -1 }, limit: 200 });
}

export async function getManagedDomains() {
  return findMongoDocuments<ManagedDomainRecord>(domainManagementCollections.domains, {}, { sort: { updatedAt: -1 }, limit: 500 });
}

export async function upsertManagedDomain(record: ManagedDomainRecord) {
  await upsertMongoDocument(
    domainManagementCollections.domains,
    { _id: record._id },
    {
      id: record.id,
      userId: record.userId,
      orderId: record.orderId,
      domain: record.domain,
      status: record.status,
      years: record.years,
      privacyProtection: record.privacyProtection,
      autoRenew: record.autoRenew,
      purchasePrice: record.purchasePrice,
      renewalPrice: record.renewalPrice,
      currency: record.currency,
      registrarReference: record.registrarReference,
      nameservers: record.nameservers,
      registeredAt: record.registeredAt,
      expiresAt: record.expiresAt,
      updatedAt: record.updatedAt,
      provider: record.provider,
      errorMessage: record.errorMessage,
      lastSyncedAt: record.lastSyncedAt
    },
    {
      _id: record._id,
      createdAt: record.createdAt
    }
  );

  return record;
}

export async function getDomainTransactionsForUser(userId: string) {
  return findMongoDocuments<DomainTransactionRecord>(domainManagementCollections.transactions, { userId }, { sort: { updatedAt: -1 }, limit: 200 });
}

export async function getDomainTransactionByOrderId(orderId: string) {
  return findOneMongoDocument<DomainTransactionRecord>(domainManagementCollections.transactions, { orderId });
}

export async function getDomainTransactionsForDomain(domainId: string) {
  return findMongoDocuments<DomainTransactionRecord>(domainManagementCollections.transactions, { domainId }, { sort: { updatedAt: -1 }, limit: 100 });
}

export async function upsertDomainTransaction(record: DomainTransactionRecord) {
  await upsertMongoDocument(
    domainManagementCollections.transactions,
    { _id: record._id },
    {
      domainId: record.domainId,
      orderId: record.orderId,
      userId: record.userId,
      domain: record.domain,
      type: record.type,
      status: record.status,
      amount: record.amount,
      currency: record.currency,
      paymentMethod: record.paymentMethod,
      paymentReference: record.paymentReference,
      registrarReference: record.registrarReference,
      metadata: record.metadata,
      updatedAt: record.updatedAt,
      completedAt: record.completedAt,
      failedAt: record.failedAt,
      errorMessage: record.errorMessage
    },
    {
      _id: record._id,
      createdAt: record.createdAt
    }
  );

  return record;
}

export async function getDomainDnsRecords(domainId: string, userId: string) {
  return findMongoDocuments<DomainDnsRecordRecord>(domainManagementCollections.dnsRecords, { domainId, userId }, { sort: { updatedAt: -1 }, limit: 500 });
}

export async function upsertDomainDnsRecord(record: DomainDnsRecordRecord) {
  await upsertMongoDocument(
    domainManagementCollections.dnsRecords,
    { _id: record._id },
    {
      id: record.id,
      domainId: record.domainId,
      userId: record.userId,
      type: record.type,
      name: record.name,
      value: record.value,
      ttl: record.ttl,
      priority: record.priority ?? null,
      externalId: record.externalId,
      source: record.source,
      updatedAt: record.updatedAt
    },
    {
      _id: record._id,
      createdAt: record.createdAt
    }
  );

  return record;
}

export async function getDomainDnsRecordById(domainId: string, userId: string, recordId: string) {
  return findOneMongoDocument<DomainDnsRecordRecord>(domainManagementCollections.dnsRecords, { _id: recordId, domainId, userId });
}

export async function deleteDomainDnsRecord(domainId: string, userId: string, recordId: string) {
  await deleteMongoDocuments(domainManagementCollections.dnsRecords, { _id: recordId, domainId, userId });
}

export function createManagedDomainRecord(args: {
  userId: string;
  orderId: string | null;
  domain: string;
  status: ManagedDomainStatus;
  years: number;
  privacyProtection: boolean;
  autoRenew: boolean;
  purchasePrice: number;
  renewalPrice: number;
  registrarReference?: string | null;
  nameservers: string[];
  provider: "ionos" | "manual";
  registeredAt?: string | null;
  expiresAt?: string | null;
  errorMessage?: string | null;
}): ManagedDomainRecord {
  const now = new Date().toISOString();
  const id = createManagedDomainId();

  return {
    _id: id,
    id,
    userId: args.userId,
    orderId: args.orderId,
    domain: args.domain.trim().toLowerCase(),
    status: args.status,
    years: args.years,
    privacyProtection: args.privacyProtection,
    autoRenew: args.autoRenew,
    purchasePrice: args.purchasePrice,
    renewalPrice: args.renewalPrice,
    currency: "USD" as const,
    registrarReference: args.registrarReference ?? null,
    nameservers: args.nameservers,
    registeredAt: args.registeredAt ?? null,
    expiresAt: args.expiresAt ?? null,
    updatedAt: now,
    provider: args.provider,
    errorMessage: args.errorMessage ?? null,
    createdAt: now,
    lastSyncedAt: null
  };
}

export function createDomainTransactionRecord(args: {
  userId: string;
  domain: string;
  type: DomainTransactionType;
  amount: number;
  paymentMethod: DomainPaymentMethod | "MANUAL";
  domainId?: string | null;
  orderId?: string | null;
  paymentReference?: string | null;
  registrarReference?: string | null;
  metadata?: Record<string, unknown>;
  status?: DomainTransactionStatus;
}): DomainTransactionRecord {
  const now = new Date().toISOString();
  const id = createDomainTransactionId();

  return {
    _id: id,
    domainId: args.domainId ?? null,
    orderId: args.orderId ?? null,
    userId: args.userId,
    domain: args.domain.trim().toLowerCase(),
    type: args.type,
    status: args.status ?? "pending",
    amount: Number(args.amount.toFixed(2)),
    currency: "USD" as const,
    paymentMethod: args.paymentMethod,
    paymentReference: args.paymentReference ?? null,
    registrarReference: args.registrarReference ?? null,
    metadata: args.metadata ?? {},
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    failedAt: null,
    errorMessage: null
  };
}
