import { z } from "zod";
import {
  createDomainTransactionRecord,
  createManagedDnsRecordId,
  deleteDomainDnsRecord,
  getDomainDnsRecordById,
  getDomainDnsRecords,
  getDomainTransactionsForDomain,
  getManagedDomainById,
  upsertDomainDnsRecord,
  upsertDomainTransaction,
  upsertManagedDomain,
  type DomainDnsRecordRecord,
  type ManagedDomainRecord
} from "@/lib/domain-management-db";
import { deleteIonosDnsRecord, getIonosWhoisData, updateIonosNameservers, upsertIonosDnsRecord } from "@/lib/ionos-domain";
import { getDomainProviderSettings } from "@/lib/platform-settings";
import type { DomainDnsRecordInput } from "@/lib/domain-types";

const hostnamePattern = /^(?:@|[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*)$/i;
const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const ipv6Pattern = /^[0-9a-f:]+$/i;

function isValidHostname(value: string) {
  return hostnamePattern.test(value.trim());
}

function normalizeDnsName(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.length === 0 ? "@" : trimmed;
}

function normalizeRecordValue(type: DomainDnsRecordInput["type"], value: string) {
  const trimmed = value.trim();
  return type === "TXT" ? trimmed : trimmed.toLowerCase();
}

const dnsInputSchema = z.object({
  recordId: z.string().optional(),
  type: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS"]),
  name: z.string().min(1).max(255),
  value: z.string().min(1).max(2048),
  ttl: z.number().int().min(60).max(86400),
  priority: z.number().int().min(0).max(65535).nullable().optional()
}).superRefine((value, ctx) => {
  const normalizedName = normalizeDnsName(value.name);
  const normalizedValue = normalizeRecordValue(value.type, value.value);

  if (!isValidHostname(normalizedName)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Record name is invalid.", path: ["name"] });
  }

  if (value.type === "A" && !ipv4Pattern.test(normalizedValue)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A record must contain a valid IPv4 address.", path: ["value"] });
  }

  if (value.type === "AAAA" && !ipv6Pattern.test(normalizedValue)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "AAAA record must contain a valid IPv6 address.", path: ["value"] });
  }

  if ((value.type === "CNAME" || value.type === "MX" || value.type === "NS") && !isValidHostname(normalizedValue)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${value.type} record target is invalid.`, path: ["value"] });
  }

  if (value.type === "TXT" && normalizedValue.length > 512) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "TXT record is too long.", path: ["value"] });
  }

  if (value.type === "MX" && (value.priority === null || value.priority === undefined)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "MX records require a priority.", path: ["priority"] });
  }

  if (value.type !== "MX" && value.priority !== null && value.priority !== undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Priority is only allowed for MX records.", path: ["priority"] });
  }
});

const nameserverSchema = z.object({
  nameservers: z.array(z.string().min(1).max(255)).min(2).max(8)
}).superRefine((value, ctx) => {
  value.nameservers.forEach((nameserver, index) => {
    if (!isValidHostname(nameserver.trim().toLowerCase())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nameserver is invalid.", path: ["nameservers", index] });
    }
  });
});

const autoRenewSchema = z.object({
  autoRenew: z.boolean()
});

async function getOwnedManagedDomain(userId: string, domainId: string) {
  const domain = await getManagedDomainById(userId, domainId);

  if (!domain) {
    throw new Error("Domain not found.");
  }

  return domain;
}

function canCallRegistrar(domain: ManagedDomainRecord, mode: "manual" | "live") {
  return mode === "live" && domain.status === "active";
}

export async function getManagedDomainSnapshot(userId: string, domainId: string) {
  const [domain, dnsRecords, transactions, settings] = await Promise.all([
    getOwnedManagedDomain(userId, domainId),
    getDomainDnsRecords(domainId, userId),
    getDomainTransactionsForDomain(domainId),
    getDomainProviderSettings()
  ]);

  let whois = null;

  if (canCallRegistrar(domain, settings.mode)) {
    try {
      whois = await getIonosWhoisData(domain.domain);
      domain.lastSyncedAt = new Date().toISOString();
      domain.updatedAt = domain.lastSyncedAt;
      domain.nameservers = whois.nameservers.length > 0 ? whois.nameservers : domain.nameservers;
      await upsertManagedDomain(domain);
    } catch {
      whois = null;
    }
  }

  return {
    domain,
    dnsRecords,
    transactions,
    whois
  };
}

export async function saveManagedDomainDnsRecord(userId: string, domainId: string, rawInput: unknown) {
  const input = dnsInputSchema.parse(rawInput);
  const [domain, settings] = await Promise.all([
    getOwnedManagedDomain(userId, domainId),
    getDomainProviderSettings()
  ]);

  const currentRecord = input.recordId ? await getDomainDnsRecordById(domainId, userId, input.recordId) : null;
  const normalizedInput: DomainDnsRecordInput = {
    type: input.type,
    name: normalizeDnsName(input.name),
    value: normalizeRecordValue(input.type, input.value),
    ttl: input.ttl,
    priority: input.type === "MX" ? input.priority ?? 10 : null
  };

  let externalId = currentRecord?.externalId ?? null;

  if (canCallRegistrar(domain, settings.mode)) {
    const synced = await upsertIonosDnsRecord(domain.domain, { ...normalizedInput, externalId });
    externalId = synced.externalId ?? null;
  }

  const now = new Date().toISOString();
  const nextRecordId = currentRecord?._id ?? createManagedDnsRecordId();
  const record: DomainDnsRecordRecord = {
    _id: nextRecordId,
    id: currentRecord?.id ?? nextRecordId,
    domainId,
    userId,
    type: normalizedInput.type,
    name: normalizedInput.name,
    value: normalizedInput.value,
    ttl: normalizedInput.ttl,
    priority: normalizedInput.priority ?? null,
    externalId,
    source: canCallRegistrar(domain, settings.mode) ? "ionos" : "platform",
    createdAt: currentRecord?.createdAt ?? now,
    updatedAt: now
  };

  await upsertDomainDnsRecord(record);

  const transaction = createDomainTransactionRecord({
    userId,
    domainId,
    domain: domain.domain,
    type: "dns_change",
    amount: 0,
    paymentMethod: "MANUAL",
    metadata: {
      recordId: record._id,
      type: record.type,
      name: record.name,
      action: currentRecord ? "update" : "create"
    },
    status: "active"
  });
  transaction.completedAt = now;
  transaction.updatedAt = now;
  await upsertDomainTransaction(transaction);

  domain.lastSyncedAt = now;
  domain.updatedAt = now;
  await upsertManagedDomain(domain);

  return record;
}

export async function removeManagedDomainDnsRecord(userId: string, domainId: string, recordId: string) {
  const [domain, settings, record] = await Promise.all([
    getOwnedManagedDomain(userId, domainId),
    getDomainProviderSettings(),
    getDomainDnsRecordById(domainId, userId, recordId)
  ]);

  if (!record) {
    throw new Error("DNS record not found.");
  }

  if (canCallRegistrar(domain, settings.mode) && record.externalId) {
    await deleteIonosDnsRecord(domain.domain, record.externalId);
  }

  await deleteDomainDnsRecord(domainId, userId, recordId);

  const now = new Date().toISOString();
  const transaction = createDomainTransactionRecord({
    userId,
    domainId,
    domain: domain.domain,
    type: "dns_change",
    amount: 0,
    paymentMethod: "MANUAL",
    metadata: {
      recordId,
      type: record.type,
      name: record.name,
      action: "delete"
    },
    status: "active"
  });
  transaction.completedAt = now;
  transaction.updatedAt = now;
  await upsertDomainTransaction(transaction);

  domain.lastSyncedAt = now;
  domain.updatedAt = now;
  await upsertManagedDomain(domain);
}

export async function updateManagedDomainNameserverSet(userId: string, domainId: string, rawInput: unknown) {
  const input = nameserverSchema.parse(rawInput);
  const [domain, settings] = await Promise.all([
    getOwnedManagedDomain(userId, domainId),
    getDomainProviderSettings()
  ]);

  if (!settings.allowCustomNameservers) {
    throw new Error("Custom nameservers are disabled in platform settings.");
  }

  const nameservers = input.nameservers.map((entry) => entry.trim().toLowerCase());

  if (canCallRegistrar(domain, settings.mode)) {
    domain.nameservers = await updateIonosNameservers(domain.domain, nameservers);
  } else {
    domain.nameservers = nameservers;
  }

  const now = new Date().toISOString();
  domain.updatedAt = now;
  domain.lastSyncedAt = now;
  await upsertManagedDomain(domain);

  const transaction = createDomainTransactionRecord({
    userId,
    domainId,
    domain: domain.domain,
    type: "nameserver_update",
    amount: 0,
    paymentMethod: "MANUAL",
    metadata: { nameservers: domain.nameservers },
    status: "active"
  });
  transaction.completedAt = now;
  transaction.updatedAt = now;
  await upsertDomainTransaction(transaction);

  return domain;
}

export async function updateManagedDomainAutoRenew(userId: string, domainId: string, rawInput: unknown) {
  const input = autoRenewSchema.parse(rawInput);
  const domain = await getOwnedManagedDomain(userId, domainId);
  domain.autoRenew = input.autoRenew;
  domain.updatedAt = new Date().toISOString();
  await upsertManagedDomain(domain);
  return domain;
}

export async function requestManagedDomainRenewal(userId: string, domainId: string) {
  const domain = await getOwnedManagedDomain(userId, domainId);
  const transaction = createDomainTransactionRecord({
    userId,
    domainId,
    domain: domain.domain,
    type: "renewal",
    amount: domain.renewalPrice,
    paymentMethod: "MANUAL",
    metadata: {
      years: 1,
      currentExpiry: domain.expiresAt,
      autoRenew: domain.autoRenew
    },
    status: "pending"
  });

  await upsertDomainTransaction(transaction);
  return transaction;
}
