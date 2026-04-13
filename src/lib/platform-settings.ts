import { routing } from "@/i18n/routing";
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

export type OAuthSettings = {
  googleClientId: string;
  googleClientSecret: string;
};

export type GeminiSettings = {
  apiKey: string;
};

export type PlatformSettingsBundle = {
  activeLanguages: ActiveLanguage[];
  footerDetails: FooterSettings;
  paymentIntegrations: PaymentIntegrationsSettings;
  oauthConfig: OAuthSettings;
  geminiConfig: GeminiSettings;
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
  googleClientId: "",
  googleClientSecret: ""
};

export const defaultGeminiConfig: GeminiSettings = {
  apiKey: ""
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

export const supportedActiveLanguages = fallbackLanguages.filter((language) =>
  routing.locales.includes(language.code as (typeof routing.locales)[number])
);

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

  return validLanguages.length > 0 ? validLanguages : supportedActiveLanguages;
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
    googleClientId: coerceString(value.googleClientId, defaultOAuthConfig.googleClientId),
    googleClientSecret: coerceString(value.googleClientSecret, defaultOAuthConfig.googleClientSecret)
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
  const [activeLanguages, footerDetails, paymentIntegrations, oauthConfig, geminiConfig] = await Promise.all([
    getSettingValue("active_languages"),
    getSettingValue("footer_details"),
    getSettingValue("payment_integrations"),
    getSettingValue("oauth_config"),
    getSettingValue("gemini_api_key")
  ]);

  return {
    activeLanguages: normalizeActiveLanguages(activeLanguages),
    footerDetails: normalizeFooterDetails(footerDetails),
    paymentIntegrations: normalizePaymentIntegrations(paymentIntegrations),
    oauthConfig: normalizeOAuthConfig(oauthConfig),
    geminiConfig: normalizeGeminiConfig(geminiConfig)
  };
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
