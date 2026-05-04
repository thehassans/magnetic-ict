import { routing } from "@/i18n/routing";
import type { DomainProviderSettings } from "@/lib/domain-types";
import type { HostingProviderSettings } from "@/lib/hosting-types";
import { prisma } from "@/lib/prisma";
import { fallbackLanguages } from "@/lib/settings";
import type { ActiveLanguage } from "@/types/i18n";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export type FooterSettings = {
  supportEmail: string;
  supportPhone: string;
  locationLabel: string;
  ctaHref: string;
};

export type PaymentIntegrationsSettings = {
  stripe: { enabled: boolean };
  paypal: { enabled: boolean };
  applePay: { enabled: boolean };
  googlePay: { enabled: boolean };
};

export type OAuthProviderSettings = {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
};

export type OAuthSettings = {
  google: OAuthProviderSettings;
  github: OAuthProviderSettings;
  apple: OAuthProviderSettings;
};

export type GeminiSettings = {
  apiKey: string;
};

export type SocialBotSettings = {
  globalBotInstructions: string;
  metaAppId: string;
  metaAppSecret: string;
  metaConfigId: string;
  webhookVerifyToken: string;
};

export type WelcomeEmailSettings = {
  enabled: boolean;
  subject: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type PlatformSettingsBundle = {
  activeLanguages: ActiveLanguage[];
  footerDetails: FooterSettings;
  paymentIntegrations: PaymentIntegrationsSettings;
  oauthConfig: OAuthSettings;
  geminiConfig: GeminiSettings;
  socialBotConfig: SocialBotSettings;
  welcomeEmailConfig: WelcomeEmailSettings;
  domainProviderConfig: DomainProviderSettings;
  hostingProviderConfig: HostingProviderSettings;
};

export const defaultFooterDetails: FooterSettings = {
  supportEmail: "support@magnetic-ict.com",
  supportPhone: "+447988525331",
  locationLabel: "Global delivery, always-on support",
  ctaHref: "/support"
};

export const defaultPaymentIntegrations: PaymentIntegrationsSettings = {
  stripe: { enabled: true },
  paypal: { enabled: true },
  applePay: { enabled: true },
  googlePay: { enabled: true }
};

export const defaultOAuthConfig: OAuthSettings = {
  google: {
    enabled: true,
    clientId: "",
    clientSecret: ""
  },
  github: {
    enabled: true,
    clientId: "",
    clientSecret: ""
  },
  apple: {
    enabled: true,
    clientId: "",
    clientSecret: ""
  }
};

export const defaultGeminiConfig: GeminiSettings = {
  apiKey: ""
};

export const defaultSocialBotConfig: SocialBotSettings = {
  globalBotInstructions: "",
  metaAppId: "",
  metaAppSecret: "",
  metaConfigId: "",
  webhookVerifyToken: ""
};

export const defaultWelcomeEmailConfig: WelcomeEmailSettings = {
  enabled: true,
  subject: "Welcome to MagneticICT",
  headline: "Welcome to MagneticICT",
  body: "Your account is now ready. Explore your dashboard, browse our services, and reach out anytime if you need help getting started.",
  ctaLabel: "Open your dashboard",
  ctaHref: "/dashboard"
};

export const defaultDomainProviderConfig: DomainProviderSettings = {
  enabled: true,
  mode: "manual",
  providerLabel: "Registrar automation",
  automationEndpoint: "",
  automationToken: "",
  checkoutProvider: "STRIPE",
  defaultYears: 1,
  autoRegisterAfterPayment: false,
  defaultDnsTtl: 3600,
  includePrivacyProtectionByDefault: true,
  allowCustomNameservers: true,
  priceMarkupPercent: 15,
  priceMarkupFlat: 1,
  renewalMarkupPercent: 12,
  renewalMarkupFlat: 1,
  defaultNameservers: ["ns1045.ui-dns.com", "ns1045.ui-dns.de", "ns1045.ui-dns.org", "ns1045.ui-dns.biz"],
  comPrice: 14.99,
  netPrice: 16.99,
  orgPrice: 15.99,
  ioPrice: 49.99,
  defaultPrice: 19.99
};

export const defaultHostingProviderConfig: HostingProviderSettings = {
  enabled: false,
  mode: "manual",
  resellerBaseUrl: "",
  resellerUsername: "",
  resellerPassword: "",
  cloudBaseUrl: "",
  cloudToken: "",
  cloudContractNumber: "",
  defaultLocation: "de/fra",
  defaultImageAlias: "ubuntu:latest",
  createResellerContracts: true,
  createContractAdmins: false,
  customerPanelLabel: "Plesk login",
  customerPanelUrlTemplate: "",
  customerPanelHelpText: "Use the panel login below to manage websites, mail, databases, and hosting settings.",
  operatingSystems: [
    {
      id: "ubuntu-24-04",
      name: "Ubuntu 24.04",
      description: "Ubuntu LTS server image for modern Linux workloads.",
      imageAlias: "ubuntu:latest",
      enabled: true,
      recommended: true
    },
    {
      id: "rocky-9",
      name: "Rocky Linux 9",
      description: "Enterprise-ready RHEL-compatible distribution.",
      imageAlias: "rockylinux:latest",
      enabled: true,
      recommended: false
    },
    {
      id: "debian-12",
      name: "Debian 12",
      description: "Stable Debian server image for clean VPS deployments.",
      imageAlias: "debian:latest",
      enabled: true,
      recommended: false
    },
    {
      id: "alma-9",
      name: "AlmaLinux 9",
      description: "Enterprise Linux option for managed server stacks.",
      imageAlias: "almalinux:latest",
      enabled: true,
      recommended: false
    }
  ],
  controlPanels: [
    {
      id: "none",
      name: "No control panel",
      description: "Lean server delivery for operators who manage the stack directly.",
      monthlyPrice: 0,
      enabled: true,
      recommended: true
    },
    {
      id: "plesk",
      name: "Plesk",
      description: "Premium website and mail management panel for production hosting.",
      monthlyPrice: 18,
      enabled: true,
      recommended: false
    },
    {
      id: "cpanel",
      name: "cPanel",
      description: "Familiar multi-site hosting panel with account-level management.",
      monthlyPrice: 24,
      enabled: true,
      recommended: false
    },
    {
      id: "directadmin",
      name: "DirectAdmin",
      description: "Lightweight control panel for efficient managed VPS operations.",
      monthlyPrice: 12,
      enabled: true,
      recommended: false
    }
  ],
  addons: [
    {
      id: "managed-backups",
      name: "Managed backups",
      description: "Automated daily snapshots with restore readiness.",
      monthlyPrice: 9,
      enabled: true,
      defaultSelected: true
    },
    {
      id: "advanced-monitoring",
      name: "Advanced monitoring",
      description: "Resource monitoring, alerting, and uptime oversight.",
      monthlyPrice: 14,
      enabled: true,
      defaultSelected: true
    },
    {
      id: "managed-hardening",
      name: "Managed hardening",
      description: "Baseline firewall, access, and OS hardening support.",
      monthlyPrice: 19,
      enabled: true,
      defaultSelected: false
    }
  ],
  locations: [
    {
      id: "de-fra",
      name: "Frankfurt, Germany",
      description: "Low-latency central EU region for business apps.",
      value: "de/fra",
      enabled: true,
      recommended: true
    },
    {
      id: "gb-lhr",
      name: "London, United Kingdom",
      description: "Regional UK placement for audience proximity.",
      value: "gb/lhr",
      enabled: true,
      recommended: false
    },
    {
      id: "us-las",
      name: "Las Vegas, United States",
      description: "US deployment option for North American workloads.",
      value: "us/las",
      enabled: true,
      recommended: false
    }
  ]
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function coerceString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function coerceBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function coerceNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeHostingControlPanels(value: unknown, fallback: HostingProviderSettings["controlPanels"]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((entry) => isObject(entry))
    .map((entry, index) => ({
      id: coerceString(entry.id, fallback[index]?.id ?? `panel-${index + 1}`),
      name: coerceString(entry.name, fallback[index]?.name ?? "Control panel"),
      description: coerceString(entry.description, fallback[index]?.description ?? ""),
      monthlyPrice: Math.max(0, coerceNumber(entry.monthlyPrice, fallback[index]?.monthlyPrice ?? 0)),
      enabled: coerceBoolean(entry.enabled, fallback[index]?.enabled ?? true),
      recommended: coerceBoolean(entry.recommended, fallback[index]?.recommended ?? false)
    }))
    .filter((entry) => entry.id.trim().length > 0 && entry.name.trim().length > 0);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeHostingOperatingSystems(value: unknown, fallback: HostingProviderSettings["operatingSystems"]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((entry) => isObject(entry))
    .map((entry, index) => ({
      id: coerceString(entry.id, fallback[index]?.id ?? `operating-system-${index + 1}`),
      name: coerceString(entry.name, fallback[index]?.name ?? "Operating system"),
      description: coerceString(entry.description, fallback[index]?.description ?? ""),
      imageAlias: coerceString(entry.imageAlias, fallback[index]?.imageAlias ?? defaultHostingProviderConfig.defaultImageAlias),
      enabled: coerceBoolean(entry.enabled, fallback[index]?.enabled ?? true),
      recommended: coerceBoolean(entry.recommended, fallback[index]?.recommended ?? false)
    }))
    .filter((entry) => entry.id.trim().length > 0 && entry.name.trim().length > 0 && entry.imageAlias.trim().length > 0);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeHostingAddons(value: unknown, fallback: HostingProviderSettings["addons"]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((entry) => isObject(entry))
    .map((entry, index) => ({
      id: coerceString(entry.id, fallback[index]?.id ?? `addon-${index + 1}`),
      name: coerceString(entry.name, fallback[index]?.name ?? "Addon"),
      description: coerceString(entry.description, fallback[index]?.description ?? ""),
      monthlyPrice: Math.max(0, coerceNumber(entry.monthlyPrice, fallback[index]?.monthlyPrice ?? 0)),
      enabled: coerceBoolean(entry.enabled, fallback[index]?.enabled ?? true),
      defaultSelected: coerceBoolean(entry.defaultSelected, fallback[index]?.defaultSelected ?? false)
    }))
    .filter((entry) => entry.id.trim().length > 0 && entry.name.trim().length > 0);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeHostingLocations(value: unknown, fallback: HostingProviderSettings["locations"]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((entry) => isObject(entry))
    .map((entry, index) => ({
      id: coerceString(entry.id, fallback[index]?.id ?? `location-${index + 1}`),
      name: coerceString(entry.name, fallback[index]?.name ?? "Region"),
      description: coerceString(entry.description, fallback[index]?.description ?? ""),
      value: coerceString(entry.value, fallback[index]?.value ?? defaultHostingProviderConfig.defaultLocation),
      enabled: coerceBoolean(entry.enabled, fallback[index]?.enabled ?? true),
      recommended: coerceBoolean(entry.recommended, fallback[index]?.recommended ?? false)
    }))
    .filter((entry) => entry.id.trim().length > 0 && entry.name.trim().length > 0 && entry.value.trim().length > 0);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeOAuthProviderSettings(
  value: unknown,
  fallback: OAuthProviderSettings,
  legacyClientId?: unknown,
  legacyClientSecret?: unknown
): OAuthProviderSettings {
  if (!isObject(value)) {
    return {
      enabled: fallback.enabled,
      clientId: coerceString(legacyClientId, fallback.clientId),
      clientSecret: coerceString(legacyClientSecret, fallback.clientSecret)
    };
  }

  return {
    enabled: coerceBoolean(value.enabled, fallback.enabled),
    clientId: coerceString(value.clientId, coerceString(legacyClientId, fallback.clientId)),
    clientSecret: coerceString(value.clientSecret, coerceString(legacyClientSecret, fallback.clientSecret))
  };
}

export const supportedActiveLanguages = fallbackLanguages.filter((language) =>
  routing.locales.includes(language.code as (typeof routing.locales)[number])
);

function ensureBanglaLanguage(languages: ActiveLanguage[]) {
  const bangla = supportedActiveLanguages.find((language) => language.code === "bn");

  if (!bangla || languages.some((language) => language.code === "bn")) {
    return languages;
  }

  return [...languages, bangla];
}

export function normalizeActiveLanguages(value: unknown) {
  if (!Array.isArray(value)) {
    return supportedActiveLanguages;
  }

  const validLanguages = value
    .filter((entry) => isObject(entry) && typeof entry.code === "string" && typeof entry.label === "string")
    .map((entry) => ({
      code: entry.code as string,
      label: entry.label as string,
      direction: (entry.direction === "rtl" ? "rtl" : "ltr") as "rtl" | "ltr"
    }))
    .filter((entry) => routing.locales.includes(entry.code as (typeof routing.locales)[number]));

  return ensureBanglaLanguage(validLanguages.length > 0 ? validLanguages : supportedActiveLanguages);
}

export function normalizeFooterDetails(value: unknown): FooterSettings {
  if (!isObject(value)) {
    return defaultFooterDetails;
  }

  return {
    supportEmail: coerceString(value.supportEmail, defaultFooterDetails.supportEmail),
    supportPhone: coerceString(value.supportPhone, defaultFooterDetails.supportPhone),
    locationLabel: coerceString(value.locationLabel, defaultFooterDetails.locationLabel),
    ctaHref: coerceString(value.ctaHref, defaultFooterDetails.ctaHref)
  };
}

export function normalizePaymentIntegrations(value: unknown): PaymentIntegrationsSettings {
  if (!isObject(value)) {
    return defaultPaymentIntegrations;
  }

  return {
    stripe: { enabled: coerceBoolean(isObject(value.stripe) ? value.stripe.enabled : undefined, defaultPaymentIntegrations.stripe.enabled) },
    paypal: { enabled: coerceBoolean(isObject(value.paypal) ? value.paypal.enabled : undefined, defaultPaymentIntegrations.paypal.enabled) },
    applePay: { enabled: coerceBoolean(isObject(value.applePay) ? value.applePay.enabled : undefined, defaultPaymentIntegrations.applePay.enabled) },
    googlePay: { enabled: coerceBoolean(isObject(value.googlePay) ? value.googlePay.enabled : undefined, defaultPaymentIntegrations.googlePay.enabled) }
  };
}

export function normalizeOAuthConfig(value: unknown): OAuthSettings {
  if (!isObject(value)) {
    return defaultOAuthConfig;
  }

  return {
    google: normalizeOAuthProviderSettings(value.google, defaultOAuthConfig.google, value.googleClientId, value.googleClientSecret),
    github: normalizeOAuthProviderSettings(value.github, defaultOAuthConfig.github, value.githubClientId, value.githubClientSecret),
    apple: normalizeOAuthProviderSettings(value.apple, defaultOAuthConfig.apple, value.appleClientId, value.appleClientSecret)
  };
}

export function normalizeGeminiConfig(value: unknown): GeminiSettings {
  if (!isObject(value)) {
    return defaultGeminiConfig;
  }

  return {
    apiKey: coerceString(value.apiKey, defaultGeminiConfig.apiKey)
  };
}

export function normalizeSocialBotConfig(value: unknown): SocialBotSettings {
  if (!isObject(value)) {
    return defaultSocialBotConfig;
  }

  return {
    globalBotInstructions: coerceString(value.globalBotInstructions, defaultSocialBotConfig.globalBotInstructions),
    metaAppId: coerceString(value.metaAppId, defaultSocialBotConfig.metaAppId),
    metaAppSecret: coerceString(value.metaAppSecret, defaultSocialBotConfig.metaAppSecret),
    metaConfigId: coerceString(value.metaConfigId, defaultSocialBotConfig.metaConfigId),
    webhookVerifyToken: coerceString(value.webhookVerifyToken, defaultSocialBotConfig.webhookVerifyToken)
  };
}

export function normalizeWelcomeEmailConfig(value: unknown): WelcomeEmailSettings {
  if (!isObject(value)) {
    return defaultWelcomeEmailConfig;
  }

  return {
    enabled: coerceBoolean(value.enabled, defaultWelcomeEmailConfig.enabled),
    subject: coerceString(value.subject, defaultWelcomeEmailConfig.subject),
    headline: coerceString(value.headline, defaultWelcomeEmailConfig.headline),
    body: coerceString(value.body, defaultWelcomeEmailConfig.body),
    ctaLabel: coerceString(value.ctaLabel, defaultWelcomeEmailConfig.ctaLabel),
    ctaHref: coerceString(value.ctaHref, defaultWelcomeEmailConfig.ctaHref)
  };
}

export function normalizeDomainProviderConfig(value: unknown): DomainProviderSettings {
  if (!isObject(value)) {
    return defaultDomainProviderConfig;
  }

  const defaultNameservers = Array.isArray(value.defaultNameservers)
    ? value.defaultNameservers
        .map((entry) => coerceString(entry, "").trim())
        .filter((entry) => entry.length > 0)
    : defaultDomainProviderConfig.defaultNameservers;

  return {
    enabled: coerceBoolean(value.enabled, defaultDomainProviderConfig.enabled),
    mode: value.mode === "live" ? "live" : defaultDomainProviderConfig.mode,
    providerLabel: coerceString(value.providerLabel, defaultDomainProviderConfig.providerLabel),
    automationEndpoint: coerceString(value.automationEndpoint, defaultDomainProviderConfig.automationEndpoint),
    automationToken: coerceString(value.automationToken, defaultDomainProviderConfig.automationToken),
    checkoutProvider: value.checkoutProvider === "PAYPAL" ? "PAYPAL" : defaultDomainProviderConfig.checkoutProvider,
    defaultYears: Math.max(1, Number(value.defaultYears) || defaultDomainProviderConfig.defaultYears),
    autoRegisterAfterPayment: coerceBoolean(value.autoRegisterAfterPayment, defaultDomainProviderConfig.autoRegisterAfterPayment),
    defaultDnsTtl: Math.max(60, Number(value.defaultDnsTtl) || defaultDomainProviderConfig.defaultDnsTtl),
    includePrivacyProtectionByDefault: coerceBoolean(value.includePrivacyProtectionByDefault, defaultDomainProviderConfig.includePrivacyProtectionByDefault),
    allowCustomNameservers: coerceBoolean(value.allowCustomNameservers, defaultDomainProviderConfig.allowCustomNameservers),
    priceMarkupPercent: Number(value.priceMarkupPercent) || value.priceMarkupPercent === 0 ? Number(value.priceMarkupPercent) : defaultDomainProviderConfig.priceMarkupPercent,
    priceMarkupFlat: Number(value.priceMarkupFlat) || value.priceMarkupFlat === 0 ? Number(value.priceMarkupFlat) : defaultDomainProviderConfig.priceMarkupFlat,
    renewalMarkupPercent: Number(value.renewalMarkupPercent) || value.renewalMarkupPercent === 0 ? Number(value.renewalMarkupPercent) : defaultDomainProviderConfig.renewalMarkupPercent,
    renewalMarkupFlat: Number(value.renewalMarkupFlat) || value.renewalMarkupFlat === 0 ? Number(value.renewalMarkupFlat) : defaultDomainProviderConfig.renewalMarkupFlat,
    defaultNameservers: defaultNameservers.length > 0 ? defaultNameservers : defaultDomainProviderConfig.defaultNameservers,
    comPrice: Number(value.comPrice) || defaultDomainProviderConfig.comPrice,
    netPrice: Number(value.netPrice) || defaultDomainProviderConfig.netPrice,
    orgPrice: Number(value.orgPrice) || defaultDomainProviderConfig.orgPrice,
    ioPrice: Number(value.ioPrice) || defaultDomainProviderConfig.ioPrice,
    defaultPrice: Number(value.defaultPrice) || defaultDomainProviderConfig.defaultPrice
  };
}

export function normalizeHostingProviderConfig(value: unknown): HostingProviderSettings {
  if (!isObject(value)) {
    return defaultHostingProviderConfig;
  }

  return {
    enabled: coerceBoolean(value.enabled, defaultHostingProviderConfig.enabled),
    mode: value.mode === "live" ? "live" : defaultHostingProviderConfig.mode,
    resellerBaseUrl: coerceString(value.resellerBaseUrl, defaultHostingProviderConfig.resellerBaseUrl),
    resellerUsername: coerceString(value.resellerUsername, defaultHostingProviderConfig.resellerUsername),
    resellerPassword: coerceString(value.resellerPassword, defaultHostingProviderConfig.resellerPassword),
    cloudBaseUrl: coerceString(value.cloudBaseUrl, defaultHostingProviderConfig.cloudBaseUrl),
    cloudToken: coerceString(value.cloudToken, defaultHostingProviderConfig.cloudToken),
    cloudContractNumber: coerceString(value.cloudContractNumber, defaultHostingProviderConfig.cloudContractNumber),
    defaultLocation: coerceString(value.defaultLocation, defaultHostingProviderConfig.defaultLocation),
    defaultImageAlias: coerceString(value.defaultImageAlias, defaultHostingProviderConfig.defaultImageAlias),
    createResellerContracts: coerceBoolean(value.createResellerContracts, defaultHostingProviderConfig.createResellerContracts),
    createContractAdmins: coerceBoolean(value.createContractAdmins, defaultHostingProviderConfig.createContractAdmins),
    customerPanelLabel: coerceString(value.customerPanelLabel, defaultHostingProviderConfig.customerPanelLabel),
    customerPanelUrlTemplate: coerceString(value.customerPanelUrlTemplate, defaultHostingProviderConfig.customerPanelUrlTemplate),
    customerPanelHelpText: coerceString(value.customerPanelHelpText, defaultHostingProviderConfig.customerPanelHelpText),
    operatingSystems: normalizeHostingOperatingSystems(value.operatingSystems, defaultHostingProviderConfig.operatingSystems),
    controlPanels: normalizeHostingControlPanels(value.controlPanels, defaultHostingProviderConfig.controlPanels),
    addons: normalizeHostingAddons(value.addons, defaultHostingProviderConfig.addons),
    locations: normalizeHostingLocations(value.locations, defaultHostingProviderConfig.locations)
  };
}

async function getSettingValue(key: string) {
  if (!hasDatabase) {
    return null;
  }

  const setting = await prisma.setting.findUnique({
    where: { key },
    select: { value: true }
  }).catch(() => null);

  return setting?.value ?? null;
}

export async function getPlatformSettings(): Promise<PlatformSettingsBundle> {
  const [activeLanguages, footerDetails, paymentIntegrations, oauthConfig, geminiConfig, socialBotConfig, welcomeEmailConfig, domainProviderConfig, hostingProviderConfig] = await Promise.all([
    getSettingValue("active_languages"),
    getSettingValue("footer_details"),
    getSettingValue("payment_integrations"),
    getSettingValue("oauth_config"),
    getSettingValue("gemini_api_key"),
    getSettingValue("social_bot_config"),
    getSettingValue("welcome_email_config"),
    getSettingValue("domain_provider_config"),
    getSettingValue("hosting_provider_config")
  ]);

  return {
    activeLanguages: normalizeActiveLanguages(activeLanguages),
    footerDetails: normalizeFooterDetails(footerDetails),
    paymentIntegrations: normalizePaymentIntegrations(paymentIntegrations),
    oauthConfig: normalizeOAuthConfig(oauthConfig),
    geminiConfig: normalizeGeminiConfig(geminiConfig),
    socialBotConfig: normalizeSocialBotConfig(socialBotConfig),
    welcomeEmailConfig: normalizeWelcomeEmailConfig(welcomeEmailConfig),
    domainProviderConfig: normalizeDomainProviderConfig(domainProviderConfig),
    hostingProviderConfig: normalizeHostingProviderConfig(hostingProviderConfig)
  };
}

export async function getOAuthSettings() {
  const value = await getSettingValue("oauth_config");
  return normalizeOAuthConfig(value);
}

export function getResolvedOAuthSettings(settings: OAuthSettings): OAuthSettings {
  return {
    google: {
      enabled: settings.google.enabled,
      clientId: settings.google.clientId || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: settings.google.clientSecret || process.env.GOOGLE_CLIENT_SECRET || ""
    },
    github: {
      enabled: settings.github.enabled,
      clientId: settings.github.clientId || process.env.GITHUB_CLIENT_ID || "",
      clientSecret: settings.github.clientSecret || process.env.GITHUB_CLIENT_SECRET || ""
    },
    apple: {
      enabled: settings.apple.enabled,
      clientId: settings.apple.clientId || process.env.APPLE_CLIENT_ID || "",
      clientSecret: settings.apple.clientSecret || process.env.APPLE_CLIENT_SECRET || ""
    }
  };
}

export async function getWelcomeEmailSettings() {
  const value = await getSettingValue("welcome_email_config");
  return normalizeWelcomeEmailConfig(value);
}

export async function getDomainProviderSettings() {
  const value = await getSettingValue("domain_provider_config");
  return normalizeDomainProviderConfig(value);
}

export async function getHostingProviderSettings() {
  const value = await getSettingValue("hosting_provider_config");
  return normalizeHostingProviderConfig(value);
}

export function getOAuthProviderAvailability(settings: OAuthSettings) {
  const resolved = getResolvedOAuthSettings(settings);

  return {
    google: resolved.google.enabled && Boolean(resolved.google.clientId && resolved.google.clientSecret),
    github: resolved.github.enabled && Boolean(resolved.github.clientId && resolved.github.clientSecret),
    apple: resolved.apple.enabled && Boolean(resolved.apple.clientId && resolved.apple.clientSecret)
  } as const;
}

export async function getPaymentIntegrationsSettings() {
  const value = await getSettingValue("payment_integrations");
  return normalizePaymentIntegrations(value);
}

export async function getFooterDetailsSettings() {
  const value = await getSettingValue("footer_details");
  return normalizeFooterDetails(value);
}

export function getEnabledPaymentMethodIds(settings: PaymentIntegrationsSettings) {
  return {
    STRIPE: settings.stripe.enabled,
    PAYPAL: settings.paypal.enabled,
    APPLE_PAY: settings.applePay.enabled,
    GOOGLE_PAY: settings.googlePay.enabled
  } as const;
}
