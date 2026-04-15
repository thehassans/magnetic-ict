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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function coerceString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function coerceBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
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
  const [activeLanguages, footerDetails, paymentIntegrations, oauthConfig, geminiConfig, socialBotConfig, welcomeEmailConfig] = await Promise.all([
    getSettingValue("active_languages"),
    getSettingValue("footer_details"),
    getSettingValue("payment_integrations"),
    getSettingValue("oauth_config"),
    getSettingValue("gemini_api_key"),
    getSettingValue("social_bot_config"),
    getSettingValue("welcome_email_config")
  ]);

  return {
    activeLanguages: normalizeActiveLanguages(activeLanguages),
    footerDetails: normalizeFooterDetails(footerDetails),
    paymentIntegrations: normalizePaymentIntegrations(paymentIntegrations),
    oauthConfig: normalizeOAuthConfig(oauthConfig),
    geminiConfig: normalizeGeminiConfig(geminiConfig),
    socialBotConfig: normalizeSocialBotConfig(socialBotConfig),
    welcomeEmailConfig: normalizeWelcomeEmailConfig(welcomeEmailConfig)
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
