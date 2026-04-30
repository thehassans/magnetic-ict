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
  comPrice: number;
  netPrice: number;
  orgPrice: number;
  ioPrice: number;
  defaultPrice: number;
};

export type DomainAvailabilityStatus = "available" | "taken" | "unknown";

export type DomainSearchResult = {
  domain: string;
  available: boolean | null;
  status: DomainAvailabilityStatus;
  price: number;
  currency: "USD";
  source: "rdap";
};
