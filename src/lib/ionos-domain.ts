import type { DomainDnsRecordInput, DomainRegistrantContact, DomainSearchResult, DomainWhoisData } from "@/lib/domain-types";
import { getDomainProviderSettings } from "@/lib/platform-settings";

type IonosDomainCredentials = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  resellerId: string;
  enabled: boolean;
};

type DomainAvailabilityPayload = {
  available?: boolean;
  price?: number;
  currency?: string;
  domain?: string;
};

type IonosDnsRecordResponse = {
  id?: string;
  type?: string;
  name?: string;
  value?: string;
  ttl?: number;
  priority?: number | null;
};

type IonosWhoisPayload = {
  registrar?: string;
  status?: string[];
  nameservers?: string[];
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  registrant?: Record<string, unknown>;
  admin?: Record<string, unknown>;
  tech?: Record<string, unknown>;
};

export function getIonosDomainCredentials(): IonosDomainCredentials {
  return {
    baseUrl: (process.env.IONOS_PARTNER_BASE_URL || "https://api.ionos.com/partner/v1").replace(/\/$/, ""),
    apiKey: process.env.IONOS_PARTNER_API_KEY || "",
    apiSecret: process.env.IONOS_PARTNER_API_SECRET || "",
    resellerId: process.env.IONOS_PARTNER_RESELLER_ID || "",
    enabled: Boolean(process.env.IONOS_PARTNER_API_KEY && process.env.IONOS_PARTNER_API_SECRET)
  };
}

function buildHeaders() {
  const credentials = getIonosDomainCredentials();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-API-Key": credentials.apiKey,
    "X-API-Secret": credentials.apiSecret,
    ...(credentials.resellerId ? { "X-Reseller-Id": credentials.resellerId } : {})
  };
}

async function requestIonos<T>(path: string, init?: RequestInit) {
  const credentials = getIonosDomainCredentials();

  if (!credentials.enabled) {
    throw new Error("IONOS Partner API credentials are not configured.");
  }

  const response = await fetch(`${credentials.baseUrl}${path}`, {
    ...init,
    headers: {
      ...buildHeaders(),
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as T | { error?: string; message?: string } | null;

  if (!response.ok) {
    const errorMessage = typeof payload === "object" && payload && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : typeof payload === "object" && payload && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : `IONOS request failed with status ${response.status}.`;
    throw new Error(errorMessage);
  }

  return payload as T;
}

function normalizeContact(value: Record<string, unknown> | undefined) {
  return {
    name: typeof value?.name === "string" ? value.name : null,
    organization: typeof value?.organization === "string" ? value.organization : null,
    email: typeof value?.email === "string" ? value.email : null,
    country: typeof value?.country === "string" ? value.country : null
  };
}

export function applyDomainMarkup(basePrice: number, percent: number, flat: number) {
  const markupAmount = Number(((basePrice * (percent / 100)) + flat).toFixed(2));
  const price = Number((basePrice + markupAmount).toFixed(2));
  return { markupAmount, price };
}

export async function checkIonosDomainAvailability(domain: string): Promise<DomainSearchResult> {
  const normalizedDomain = domain.trim().toLowerCase();
  const settings = await getDomainProviderSettings();
  const payload = await requestIonos<DomainAvailabilityPayload | DomainAvailabilityPayload[]>(`/domains/available?domain=${encodeURIComponent(normalizedDomain)}`);
  const resolved = Array.isArray(payload)
    ? payload.find((entry) => entry.domain?.toLowerCase() === normalizedDomain) ?? payload[0] ?? null
    : payload;
  const basePrice = Number((resolved?.price ?? resolveFallbackBasePrice(normalizedDomain, settings)).toFixed(2));
  const { markupAmount, price } = applyDomainMarkup(basePrice, settings.priceMarkupPercent, settings.priceMarkupFlat);
  const available = typeof resolved?.available === "boolean" ? resolved.available : null;

  return {
    domain: normalizedDomain,
    available,
    status: available === null ? "unknown" : available ? "available" : "taken",
    basePrice,
    markupAmount,
    price,
    currency: (resolved?.currency === "USD" ? "USD" : "USD"),
    source: "ionos"
  };
}

function resolveFallbackBasePrice(domain: string, settings: Awaited<ReturnType<typeof getDomainProviderSettings>>) {
  const tld = domain.split(".").at(-1)?.toLowerCase();

  switch (tld) {
    case "com":
      return settings.comPrice;
    case "net":
      return settings.netPrice;
    case "org":
      return settings.orgPrice;
    case "io":
      return settings.ioPrice;
    default:
      return settings.defaultPrice;
  }
}

export async function registerIonosDomain(args: {
  domain: string;
  years: number;
  privacyProtection: boolean;
  registrantContact?: DomainRegistrantContact;
  customerEmail?: string;
  customerName?: string | null;
  nameservers: string[];
}) {
  const settings = await getDomainProviderSettings();
  const fallbackNameParts = (args.customerName ?? args.customerEmail?.split("@")[0] ?? "Domain Customer").trim().split(/\s+/).filter(Boolean);
  const registrant = args.registrantContact ?? {
    firstName: fallbackNameParts[0] ?? "Domain",
    lastName: fallbackNameParts.slice(1).join(" ") || "Customer",
    organization: "",
    email: args.customerEmail ?? "",
    phone: process.env.IONOS_DOMAIN_FALLBACK_PHONE || "+10000000000",
    addressLine1: process.env.IONOS_DOMAIN_FALLBACK_ADDRESS_LINE1 || "Customer profile pending",
    addressLine2: process.env.IONOS_DOMAIN_FALLBACK_ADDRESS_LINE2 || "",
    city: process.env.IONOS_DOMAIN_FALLBACK_CITY || "Wilmington",
    state: process.env.IONOS_DOMAIN_FALLBACK_STATE || "Delaware",
    postalCode: process.env.IONOS_DOMAIN_FALLBACK_POSTAL_CODE || "19801",
    country: process.env.IONOS_DOMAIN_FALLBACK_COUNTRY || "US"
  };

  const payload = await requestIonos<{ id?: string; reference?: string; nameservers?: string[]; expiresAt?: string; status?: string }>("/domains", {
    method: "POST",
    body: JSON.stringify({
      domain: args.domain,
      years: args.years,
      privacyProtection: args.privacyProtection,
      nameservers: args.nameservers.length > 0 ? args.nameservers : settings.defaultNameservers,
      registrant: {
        firstName: registrant.firstName,
        lastName: registrant.lastName,
        organization: registrant.organization,
        email: registrant.email,
        phone: registrant.phone,
        addressLine1: registrant.addressLine1,
        addressLine2: registrant.addressLine2,
        city: registrant.city,
        state: registrant.state,
        postalCode: registrant.postalCode,
        country: registrant.country
      }
    })
  });

  return {
    registrarReference: payload.reference ?? payload.id ?? null,
    nameservers: payload.nameservers ?? args.nameservers,
    expiresAt: payload.expiresAt ?? null,
    status: payload.status ?? null
  };
}

export async function getIonosDnsRecords(domain: string) {
  const payload = await requestIonos<{ records?: IonosDnsRecordResponse[] } | IonosDnsRecordResponse[]>(`/domains/${encodeURIComponent(domain)}/dns`);
  const records = Array.isArray(payload) ? payload : payload.records ?? [];

  return records.map((record) => ({
    externalId: record.id ?? null,
    type: (record.type ?? "A") as DomainDnsRecordInput["type"],
    name: record.name ?? "@",
    value: record.value ?? "",
    ttl: typeof record.ttl === "number" ? record.ttl : 3600,
    priority: typeof record.priority === "number" ? record.priority : null
  }));
}

export async function upsertIonosDnsRecord(domain: string, record: DomainDnsRecordInput & { externalId?: string | null }) {
  const path = record.externalId
    ? `/domains/${encodeURIComponent(domain)}/dns/${encodeURIComponent(record.externalId)}`
    : `/domains/${encodeURIComponent(domain)}/dns`;
  const method = record.externalId ? "PUT" : "POST";
  const payload = await requestIonos<IonosDnsRecordResponse>(path, {
    method,
    body: JSON.stringify({
      type: record.type,
      name: record.name,
      value: record.value,
      ttl: record.ttl,
      priority: record.priority ?? undefined
    })
  });

  return {
    externalId: payload.id ?? record.externalId ?? null,
    type: (payload.type ?? record.type) as DomainDnsRecordInput["type"],
    name: payload.name ?? record.name,
    value: payload.value ?? record.value,
    ttl: typeof payload.ttl === "number" ? payload.ttl : record.ttl,
    priority: typeof payload.priority === "number" ? payload.priority : record.priority ?? null
  };
}

export async function deleteIonosDnsRecord(domain: string, externalId: string) {
  await requestIonos(`/domains/${encodeURIComponent(domain)}/dns/${encodeURIComponent(externalId)}`, {
    method: "DELETE"
  });
}

export async function getIonosWhoisData(domain: string): Promise<DomainWhoisData> {
  const payload = await requestIonos<IonosWhoisPayload>(`/domains/${encodeURIComponent(domain)}/whois`);

  return {
    domain,
    registrar: payload.registrar ?? null,
    status: Array.isArray(payload.status) ? payload.status.filter((entry): entry is string => typeof entry === "string") : [],
    nameservers: Array.isArray(payload.nameservers) ? payload.nameservers.filter((entry): entry is string => typeof entry === "string") : [],
    createdAt: payload.createdAt ?? null,
    updatedAt: payload.updatedAt ?? null,
    expiresAt: payload.expiresAt ?? null,
    registrant: normalizeContact(payload.registrant),
    admin: normalizeContact(payload.admin),
    tech: normalizeContact(payload.tech)
  };
}

export async function updateIonosNameservers(domain: string, nameservers: string[]) {
  const payload = await requestIonos<{ nameservers?: string[] }>(`/domains/${encodeURIComponent(domain)}/nameservers`, {
    method: "PUT",
    body: JSON.stringify({ nameservers })
  });

  return payload.nameservers ?? nameservers;
}

export async function isIonosDomainApiAvailable() {
  return getIonosDomainCredentials().enabled;
}
