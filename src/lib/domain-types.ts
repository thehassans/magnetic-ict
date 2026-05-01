export type DomainPaymentMethod = "STRIPE" | "PAYPAL";

export type DomainProviderSettings = {
  enabled: boolean;
  mode: "manual" | "live";
  providerLabel: string;
  automationEndpoint: string;
  automationToken: string;
  checkoutProvider: DomainPaymentMethod;
  defaultYears: number;
  autoRegisterAfterPayment: boolean;
  defaultDnsTtl: number;
  includePrivacyProtectionByDefault: boolean;
  allowCustomNameservers: boolean;
  priceMarkupPercent: number;
  priceMarkupFlat: number;
  renewalMarkupPercent: number;
  renewalMarkupFlat: number;
  defaultNameservers: string[];
  comPrice: number;
  netPrice: number;
  orgPrice: number;
  ioPrice: number;
  defaultPrice: number;
};

export type DomainAvailabilityStatus = "available" | "taken" | "unknown";
export type DomainSearchSource = "rdap" | "ionos";

export type DomainDnsRecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";

export type DomainDnsRecordInput = {
  type: DomainDnsRecordType;
  name: string;
  value: string;
  ttl: number;
  priority?: number | null;
};

export type DomainDnsRecord = DomainDnsRecordInput & {
  id: string;
  domainId: string;
  externalId: string | null;
  source: "platform" | "ionos";
  createdAt: string;
  updatedAt: string;
};

export type DomainWhoisContact = {
  name: string | null;
  organization: string | null;
  email: string | null;
  country: string | null;
};

export type DomainRegistrantContact = {
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type DomainWhoisData = {
  domain: string;
  registrar: string | null;
  status: string[];
  nameservers: string[];
  createdAt: string | null;
  updatedAt: string | null;
  expiresAt: string | null;
  registrant: DomainWhoisContact;
  admin: DomainWhoisContact;
  tech: DomainWhoisContact;
};

export type ManagedDomainStatus = "pending" | "active" | "expired" | "failed" | "cancelled";

export type DomainTransactionType = "registration" | "renewal" | "dns_change" | "nameserver_update";

export type DomainSearchResult = {
  domain: string;
  available: boolean | null;
  status: DomainAvailabilityStatus;
  basePrice: number;
  markupAmount: number;
  price: number;
  currency: "USD";
  source: DomainSearchSource;
};

export type ManagedDomainSummary = {
  id: string;
  domain: string;
  orderId: string | null;
  userId: string;
  status: ManagedDomainStatus;
  years: number;
  privacyProtection: boolean;
  autoRenew: boolean;
  purchasePrice: number;
  renewalPrice: number;
  currency: "USD";
  registrarReference: string | null;
  nameservers: string[];
  registeredAt: string | null;
  expiresAt: string | null;
  updatedAt: string;
};
