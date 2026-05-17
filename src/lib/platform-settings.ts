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
  openAiApiKey: string;
  groqApiKey: string;
};

export type TTSConfig = {
  provider: "browser" | "openai" | "elevenlabs" | "voicebox";
  elevenlabsApiKey: string;
  elevenlabsVoiceId: string;
  openaiVoice: string;
  openaiModel: string;
  voiceboxEndpoint: string;
  voiceboxProfileId: string;
  voiceCloneStudioEndpoint: string;
};

export type VoiceProviderConfig = {
  activeProvider: "none" | "twilio" | "vonage" | "plivo" | "telnyx";
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    twimlAppSid: string;
    webhookUrl: string;
  };
  vonage: {
    apiKey: string;
    apiSecret: string;
    applicationId: string;
    phoneNumber: string;
    webhookUrl: string;
  };
  plivo: {
    authId: string;
    authToken: string;
    phoneNumber: string;
    appId: string;
    webhookUrl: string;
  };
  telnyx: {
    apiKey: string;
    phoneNumber: string;
    connectionId: string;
    webhookUrl: string;
  };
};

export type InfobipConfig = {
  enabled: boolean;
  apiKey: string;
  baseUrl: string;
  senderNumber: string;
  webhookSecret: string;
  botUserId: string;
  templateName: string;
  templateLanguage: string;
  templateBodyPlaceholder: string;
  useTemplateForFirstMessage: boolean;
};

export type SocialBotSettings = {
  globalBotInstructions: string;
  metaAppId: string;
  metaAppSecret: string;
  metaConfigId: string;
  metaMessengerConfigId: string;
  metaInstagramConfigId: string;
  webhookVerifyToken: string;
  respondIoWorkspaceUrl: string;
  // System-level Meta Cloud API credentials (admin-owned channels)
  metaBotUserId: string;
  metaWhatsAppPhoneNumberId: string;
  metaWhatsAppSystemToken: string;
  metaMessengerPageId: string;
  metaMessengerPageToken: string;
  metaInstagramAccountId: string;
  metaInstagramPageToken: string;
};

export type MagneticCommerceSettings = {
  enabled: boolean;
  mode: "manual" | "live";
  autoApplyDnsOnAssignment: boolean;
  storefrontRootARecord: string;
  storefrontWwwCnameTarget: string;
  adminCnameTarget: string;
  verificationTxtName: string;
  verificationTxtValue: string;
  adminPath: string;
  defaultStoreCurrency: string;
};

export type AboutSettings = {
  headline: string;
  eyebrow: string;
  parentCompany: string;
  parentCompanyDescription: string;
  missionStatement: string;
  founderNote: string;
  values: Array<{ title: string; description: string }>;
};

export type TrustedPartnerSettings = {
  id: string;
  name: string;
  logoUrl: string;
  enabled: boolean;
};

export type TrustedPartnersSettings = {
  partners: TrustedPartnerSettings[];
};

export type WelcomeEmailSettings = {
  enabled: boolean;
  subject: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
};

export type TransactionalEmailSettings = {
  enabled: boolean;
  activeProvider: "mailgun" | "brevo";
  provider: "mailgun";
  apiBaseUrl: string;
  apiKey: string;
  domain: string;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  testRecipient: string;
  brevo: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
    replyToEmail: string;
    testRecipient: string;
  };
};

export const emailNotificationKeys = [
  "welcomeEmail",
  "passwordReset",
  "newsletterSubscription",
  "orderPlaced",
  "orderConfirmed",
  "orderProcessing",
  "orderCompleted",
  "orderCancelled",
  "ticketCreated",
  "ticketReply",
  "ticketClosed",
  "invoiceGenerated",
  "paymentReceived",
  "serviceExpiring",
  "serviceSuspended"
] as const;

export type EmailNotificationKey = (typeof emailNotificationKeys)[number];

export type EmailNotificationsSettings = Record<EmailNotificationKey, boolean>;

export type BrandingConfig = {
  siteLogoLight: string;
  siteLogoDark: string;
  adminLogoLight: string;
  adminLogoDark: string;
  customerLogoLight: string;
  customerLogoDark: string;
  chatbotLogoLight: string;
  chatbotLogoDark: string;
};

export const BRANDING_LOGO_KEYS = ["siteLogoLight", "siteLogoDark", "adminLogoLight", "adminLogoDark", "customerLogoLight", "customerLogoDark", "chatbotLogoLight", "chatbotLogoDark"] as const;
export type BrandingLogoKey = (typeof BRANDING_LOGO_KEYS)[number];

export const defaultBrandingConfig: BrandingConfig = {
  siteLogoLight: "",
  siteLogoDark: "",
  adminLogoLight: "",
  adminLogoDark: "",
  customerLogoLight: "",
  customerLogoDark: "",
  chatbotLogoLight: "",
  chatbotLogoDark: ""
};

export function normalizeBrandingConfig(value: unknown): BrandingConfig {
  if (!isObject(value)) return defaultBrandingConfig;
  return {
    siteLogoLight: coerceString(value.siteLogoLight, ""),
    siteLogoDark: coerceString(value.siteLogoDark, ""),
    adminLogoLight: coerceString(value.adminLogoLight, ""),
    adminLogoDark: coerceString(value.adminLogoDark, ""),
    customerLogoLight: coerceString(value.customerLogoLight, ""),
    customerLogoDark: coerceString(value.customerLogoDark, ""),
    chatbotLogoLight: coerceString(value.chatbotLogoLight, ""),
    chatbotLogoDark: coerceString(value.chatbotLogoDark, "")
  };
}

export async function getBrandingConfig(): Promise<BrandingConfig> {
  const value = await getSettingValue("branding_config");
  return normalizeBrandingConfig(value);
}

export async function saveBrandingConfig(value: BrandingConfig) {
  if (!hasDatabase) return;
  await prisma.setting.upsert({
    where: { key: "branding_config" },
    update: { value },
    create: { key: "branding_config", value }
  });
}

export type PlatformSettingsBundle = {
  activeLanguages: ActiveLanguage[];
  footerDetails: FooterSettings;
  paymentIntegrations: PaymentIntegrationsSettings;
  oauthConfig: OAuthSettings;
  geminiConfig: GeminiSettings;
  ttsConfig: TTSConfig;
  voiceProviderConfig: VoiceProviderConfig;
  infobipConfig: InfobipConfig;
  socialBotConfig: SocialBotSettings;
  magneticCommerceConfig: MagneticCommerceSettings;
  trustedPartnersConfig: TrustedPartnersSettings;
  welcomeEmailConfig: WelcomeEmailSettings;
  transactionalEmailConfig: TransactionalEmailSettings;
  emailNotificationsConfig: EmailNotificationsSettings;
  domainProviderConfig: DomainProviderSettings;
  hostingProviderConfig: HostingProviderSettings;
  aboutConfig: AboutSettings;
  brandingConfig: BrandingConfig;
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
  apiKey: "",
  openAiApiKey: "",
  groqApiKey: ""
};

export const defaultTTSConfig: TTSConfig = {
  provider: "browser",
  elevenlabsApiKey: "",
  elevenlabsVoiceId: "21m00Tcm4TlvDq8ikWAM",
  openaiVoice: "nova",
  openaiModel: "tts-1",
  voiceboxEndpoint: "http://127.0.0.1:17493",
  voiceboxProfileId: "",
  voiceCloneStudioEndpoint: "http://127.0.0.1:7860"
};

export const defaultInfobipConfig: InfobipConfig = {
  enabled: false,
  apiKey: "",
  baseUrl: "",
  senderNumber: "",
  webhookSecret: "",
  botUserId: "",
  templateName: "test_whatsapp_template_en",
  templateLanguage: "en",
  templateBodyPlaceholder: "",
  useTemplateForFirstMessage: false
};

export const defaultVoiceProviderConfig: VoiceProviderConfig = {
  activeProvider: "none",
  twilio: { accountSid: "", authToken: "", phoneNumber: "", twimlAppSid: "", webhookUrl: "" },
  vonage: { apiKey: "", apiSecret: "", applicationId: "", phoneNumber: "", webhookUrl: "" },
  plivo: { authId: "", authToken: "", phoneNumber: "", appId: "", webhookUrl: "" },
  telnyx: { apiKey: "", phoneNumber: "", connectionId: "", webhookUrl: "" }
};

export const defaultSocialBotConfig: SocialBotSettings = {
  globalBotInstructions: "",
  metaAppId: "",
  metaAppSecret: "",
  respondIoWorkspaceUrl: "",
  metaConfigId: "",
  metaMessengerConfigId: "",
  metaInstagramConfigId: "",
  webhookVerifyToken: "",
  metaBotUserId: "",
  metaWhatsAppPhoneNumberId: "",
  metaWhatsAppSystemToken: "",
  metaMessengerPageId: "",
  metaMessengerPageToken: "",
  metaInstagramAccountId: "",
  metaInstagramPageToken: ""
};

export const defaultAboutConfig: AboutSettings = {
  eyebrow: "Our story",
  headline: "Built at the intersection of technology and infrastructure",
  parentCompany: "Magnetic Infratech Ltd",
  parentCompanyDescription: "Magnetic ICT is the technology sister branch of Magnetic Infratech Ltd — a group with deep roots in trading, construction, infrastructure, and property development. While Magnetic Infratech shapes the physical world, Magnetic ICT powers the digital layer: cloud tools, AI infrastructure, security, and growth systems for ambitious businesses worldwide.",
  missionStatement: "Our mission is to make enterprise-grade digital infrastructure accessible to every business — regardless of size, industry, or geography.",
  founderNote: "We started Magnetic ICT because we saw a gap: most digital tools were either too expensive, too complex, or too fragile for the businesses that needed them most. Magnetic changes that.",
  values: [
    { title: "Infrastructure-first thinking", description: "We engineer for reliability, resilience, and scale from the ground up — never as an afterthought." },
    { title: "White-glove delivery", description: "Premium support, transparent communication, and senior-level technical output on every engagement." },
    { title: "AI-led innovation", description: "From social automation to biometric search, we embed intelligent systems into everything we build." },
    { title: "Global reach, local care", description: "Operations across South Asia, the UK, and beyond — with teams that understand your market." }
  ]
};

export const defaultMagneticCommerceConfig: MagneticCommerceSettings = {
  enabled: true,
  mode: "manual",
  autoApplyDnsOnAssignment: true,
  storefrontRootARecord: "",
  storefrontWwwCnameTarget: "shops.magnetic-ict.com",
  adminCnameTarget: "commerce.magnetic-ict.com",
  verificationTxtName: "_magnetic-commerce",
  verificationTxtValue: "managed-by=magnetic-commerce;domain={{domain}};order={{orderId}}",
  adminPath: "/login",
  defaultStoreCurrency: "USD"
};

export const defaultTrustedPartnersConfig: TrustedPartnersSettings = {
  partners: [
    {
      id: "cloudflare",
      name: "Cloudflare",
      logoUrl: "/partners/cloudflare.svg?v=2026-05-03-aligned",
      enabled: true
    },
    {
      id: "mastercard",
      name: "Mastercard",
      logoUrl: "/partners/mastercard.svg?v=2026-05-03-aligned",
      enabled: true
    },
    {
      id: "stripe",
      name: "Stripe",
      logoUrl: "/partners/stripe.svg?v=2026-05-03-aligned",
      enabled: true
    },
    {
      id: "aws",
      name: "AWS",
      logoUrl: "/partners/aws.svg?v=2026-05-03-aligned",
      enabled: true
    },
    {
      id: "apple-pay",
      name: "Apple Pay",
      logoUrl: "/partners/apple-pay.svg?v=2026-05-03-aligned",
      enabled: true
    },
    {
      id: "visa",
      name: "Visa",
      logoUrl: "/partners/visa.svg?v=2026-05-03-aligned",
      enabled: true
    }
  ]
};

export const defaultTransactionalEmailConfig: TransactionalEmailSettings = {
  enabled: false,
  activeProvider: "mailgun",
  provider: "mailgun",
  apiBaseUrl: "https://api.mailgun.net",
  apiKey: "",
  domain: "",
  fromEmail: "",
  fromName: "MagneticICT",
  replyToEmail: "",
  testRecipient: "",
  brevo: {
    apiKey: "",
    fromEmail: "",
    fromName: "MagneticICT",
    replyToEmail: "",
    testRecipient: ""
  }
};

export const defaultWelcomeEmailConfig: WelcomeEmailSettings = {
  enabled: true,
  subject: "Welcome to MagneticICT",
  headline: "Welcome to MagneticICT",
  body: "Your account is now ready. Explore your dashboard, browse our services, and reach out anytime if you need help getting started.",
  ctaLabel: "Open your dashboard",
  ctaHref: "/dashboard"
};


export const defaultEmailNotificationsConfig: EmailNotificationsSettings = {
  welcomeEmail: true,
  passwordReset: true,
  newsletterSubscription: true,
  orderPlaced: true,
  orderConfirmed: true,
  orderProcessing: true,
  orderCompleted: true,
  orderCancelled: true,
  ticketCreated: true,
  ticketReply: true,
  ticketClosed: true,
  invoiceGenerated: true,
  paymentReceived: true,
  serviceExpiring: true,
  serviceSuspended: true
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
  tlds: [
    {
        "tld": "academy",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "ae",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "agency",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "ai",
        "registerPrice": 79.99,
        "renewPrice": 99.99,
        "transferPrice": 79.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "apartments",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "app",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "art",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "at",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "au",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "band",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "bar",
        "registerPrice": 69.99,
        "renewPrice": 79.99,
        "transferPrice": 69.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "bargains",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "bd",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "be",
        "registerPrice": 9.99,
        "renewPrice": 11.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "beer",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "best",
        "registerPrice": 99.99,
        "renewPrice": 109.99,
        "transferPrice": 99.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "bet",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "bio",
        "registerPrice": 59.99,
        "renewPrice": 69.99,
        "transferPrice": 59.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "bitcoin",
        "registerPrice": 39.99,
        "renewPrice": 44.99,
        "transferPrice": 39.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "biz",
        "registerPrice": 12.99,
        "renewPrice": 16.99,
        "transferPrice": 12.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "blog",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "boutique",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "br",
        "registerPrice": 39.99,
        "renewPrice": 44.99,
        "transferPrice": 39.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "business",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "buy",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "ca",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "cafe",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "capital",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "casino",
        "registerPrice": 149.99,
        "renewPrice": 159.99,
        "transferPrice": 149.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "cc",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "center",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "ch",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "charity",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "church",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "city",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "click",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "cloud",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "club",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "cn",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "co",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "codes",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "coffee",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "com",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "community",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "company",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "computer",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "consulting",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "cool",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "courses",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "cruise",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "crypto",
        "registerPrice": 39.99,
        "renewPrice": 44.99,
        "transferPrice": 39.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "dao",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "de",
        "registerPrice": 9.99,
        "renewPrice": 11.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "deals",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "design",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "dev",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "digital",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "discount",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "dk",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "earth",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "education",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "engineering",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "enterprises",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "es",
        "registerPrice": 11.99,
        "renewPrice": 13.99,
        "transferPrice": 11.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "estate",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "eu",
        "registerPrice": 9.99,
        "renewPrice": 11.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "events",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "exchange",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "family",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "fi",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "film",
        "registerPrice": 89.99,
        "renewPrice": 99.99,
        "transferPrice": 89.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "finance",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "fitness",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "flights",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "fm",
        "registerPrice": 99.99,
        "renewPrice": 109.99,
        "transferPrice": 99.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "foundation",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "fr",
        "registerPrice": 11.99,
        "renewPrice": 13.99,
        "transferPrice": 11.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "fun",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "fund",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "gallery",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "game",
        "registerPrice": 39.99,
        "renewPrice": 44.99,
        "transferPrice": 39.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "games",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "global",
        "registerPrice": 59.99,
        "renewPrice": 69.99,
        "transferPrice": 59.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "group",
        "registerPrice": 14.99,
        "renewPrice": 19.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "health",
        "registerPrice": 69.99,
        "renewPrice": 79.99,
        "transferPrice": 69.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "healthcare",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "hk",
        "registerPrice": 34.99,
        "renewPrice": 39.99,
        "transferPrice": 34.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "holdings",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "holiday",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "homes",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "host",
        "registerPrice": 79.99,
        "renewPrice": 89.99,
        "transferPrice": 79.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "hosting",
        "registerPrice": 349.99,
        "renewPrice": 399.99,
        "transferPrice": 349.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "hotel",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "house",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "icu",
        "registerPrice": 4.99,
        "renewPrice": 9.99,
        "transferPrice": 4.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "id",
        "registerPrice": 34.99,
        "renewPrice": 39.99,
        "transferPrice": 34.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "il",
        "registerPrice": 34.99,
        "renewPrice": 39.99,
        "transferPrice": 34.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "in",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "industries",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "info",
        "registerPrice": 11.99,
        "renewPrice": 16.99,
        "transferPrice": 11.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "institute",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "international",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "investments",
        "registerPrice": 99.99,
        "renewPrice": 109.99,
        "transferPrice": 99.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "io",
        "registerPrice": 39.99,
        "renewPrice": 49.99,
        "transferPrice": 39.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "it",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "jp",
        "registerPrice": 39.99,
        "renewPrice": 44.99,
        "transferPrice": 39.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "kitchen",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "kr",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "land",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "life",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "link",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "live",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "lol",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "management",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "market",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "me",
        "registerPrice": 14.99,
        "renewPrice": 19.99,
        "transferPrice": 14.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "media",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "mobi",
        "registerPrice": 14.99,
        "renewPrice": 19.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "money",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "music",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "mx",
        "registerPrice": 34.99,
        "renewPrice": 39.99,
        "transferPrice": 34.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "my",
        "registerPrice": 34.99,
        "renewPrice": 39.99,
        "transferPrice": 34.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "name",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "net",
        "registerPrice": 12.99,
        "renewPrice": 14.99,
        "transferPrice": 12.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "network",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "news",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "nft",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "nl",
        "registerPrice": 9.99,
        "renewPrice": 11.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "no",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "nz",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "one",
        "registerPrice": 9.99,
        "renewPrice": 14.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "online",
        "registerPrice": 29.99,
        "renewPrice": 39.99,
        "transferPrice": 29.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "org",
        "registerPrice": 11.99,
        "renewPrice": 14.99,
        "transferPrice": 11.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "organic",
        "registerPrice": 69.99,
        "renewPrice": 79.99,
        "transferPrice": 69.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "partners",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "ph",
        "registerPrice": 59.99,
        "renewPrice": 64.99,
        "transferPrice": 59.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "photo",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "photography",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "photos",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "pictures",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "pizza",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "pk",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "pl",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "place",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "plus",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "poker",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "press",
        "registerPrice": 69.99,
        "renewPrice": 79.99,
        "transferPrice": 69.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "pro",
        "registerPrice": 14.99,
        "renewPrice": 19.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "properties",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "property",
        "registerPrice": 149.99,
        "renewPrice": 159.99,
        "transferPrice": 149.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "pub",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "realestate",
        "registerPrice": 99.99,
        "renewPrice": 109.99,
        "transferPrice": 99.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "recipes",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "rentals",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "restaurant",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "rocks",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "ru",
        "registerPrice": 14.99,
        "renewPrice": 16.99,
        "transferPrice": 14.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "sa",
        "registerPrice": 99.99,
        "renewPrice": 109.99,
        "transferPrice": 99.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "sale",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "school",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "se",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "services",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "sg",
        "registerPrice": 34.99,
        "renewPrice": 39.99,
        "transferPrice": 34.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "shop",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "shopping",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "site",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "social",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "software",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "solutions",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "space",
        "registerPrice": 9.99,
        "renewPrice": 24.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "store",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "studio",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "systems",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "team",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "tech",
        "registerPrice": 39.99,
        "renewPrice": 49.99,
        "transferPrice": 39.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "technology",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "tel",
        "registerPrice": 12.99,
        "renewPrice": 14.99,
        "transferPrice": 12.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "th",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "tickets",
        "registerPrice": 449.99,
        "renewPrice": 499.99,
        "transferPrice": 449.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "today",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "token",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "top",
        "registerPrice": 4.99,
        "renewPrice": 9.99,
        "transferPrice": 4.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "tours",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "training",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "travel",
        "registerPrice": 99.99,
        "renewPrice": 109.99,
        "transferPrice": 99.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "tv",
        "registerPrice": 34.99,
        "renewPrice": 39.99,
        "transferPrice": 34.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "tw",
        "registerPrice": 34.99,
        "renewPrice": 39.99,
        "transferPrice": 34.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "uk",
        "registerPrice": 8.99,
        "renewPrice": 9.99,
        "transferPrice": 8.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "university",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "us",
        "registerPrice": 9.99,
        "renewPrice": 11.99,
        "transferPrice": 9.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "vacations",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "ventures",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "video",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "vn",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "wallet",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "web",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "website",
        "registerPrice": 19.99,
        "renewPrice": 24.99,
        "transferPrice": 19.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "wine",
        "registerPrice": 49.99,
        "renewPrice": 54.99,
        "transferPrice": 49.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "world",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "ws",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "xyz",
        "registerPrice": 9.99,
        "renewPrice": 12.99,
        "transferPrice": 9.99,
        "isPopular": true,
        "status": "Active"
    },
    {
        "tld": "yoga",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "za",
        "registerPrice": 24.99,
        "renewPrice": 29.99,
        "transferPrice": 24.99,
        "isPopular": false,
        "status": "Active"
    },
    {
        "tld": "zone",
        "registerPrice": 29.99,
        "renewPrice": 34.99,
        "transferPrice": 29.99,
        "isPopular": false,
        "status": "Active"
    }
]
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

function normalizeTrustedPartners(value: unknown, fallback: TrustedPartnersSettings["partners"]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  /** Rewrite legacy /uploads/partners/id-timestamp.webp → /partners/id.webp (or .svg) */
  function fixLogoUrl(url: string): string {
    if (url.startsWith("/uploads/partners/")) {
      const filename = url.replace("/uploads/partners/", "");
      const ext = filename.endsWith(".svg") ? "svg" : "webp";
      const id = filename.replace(/-\d+\.(webp|svg)$/, "").replace(/\.(webp|svg)$/, "");
      return `/partners/${id}.${ext}`;
    }
    return url;
  }

  const normalized = value
    .filter((entry) => isObject(entry))
    .map((entry, index) => ({
      id: coerceString(entry.id, fallback[index]?.id ?? `partner-${index + 1}`),
      name: coerceString(entry.name, fallback[index]?.name ?? "Partner"),
      logoUrl: fixLogoUrl(coerceString(entry.logoUrl, fallback[index]?.logoUrl ?? "")),
      enabled: coerceBoolean(entry.enabled, fallback[index]?.enabled ?? true)
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

export function normalizeTrustedPartnersConfig(value: unknown): TrustedPartnersSettings {
  if (!isObject(value)) {
    return defaultTrustedPartnersConfig;
  }

  return {
    partners: normalizeTrustedPartners(value.partners, defaultTrustedPartnersConfig.partners)
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
    apiKey: coerceString(value.apiKey, defaultGeminiConfig.apiKey),
    openAiApiKey: coerceString(value.openAiApiKey, defaultGeminiConfig.openAiApiKey),
    groqApiKey: coerceString(value.groqApiKey, defaultGeminiConfig.groqApiKey)
  };
}

export function normalizeInfobipConfig(value: unknown): InfobipConfig {
  if (!isObject(value)) return defaultInfobipConfig;
  const d = defaultInfobipConfig;
  return {
    enabled: value.enabled === true,
    apiKey: coerceString(value.apiKey, d.apiKey),
    baseUrl: coerceString(value.baseUrl, d.baseUrl),
    senderNumber: coerceString(value.senderNumber, d.senderNumber),
    webhookSecret: coerceString(value.webhookSecret, d.webhookSecret),
    botUserId: coerceString(value.botUserId, d.botUserId),
    templateName: coerceString(value.templateName, d.templateName),
    templateLanguage: coerceString(value.templateLanguage, d.templateLanguage),
    templateBodyPlaceholder: coerceString(value.templateBodyPlaceholder, d.templateBodyPlaceholder),
    useTemplateForFirstMessage: value.useTemplateForFirstMessage === true
  };
}

export function normalizeVoiceProviderConfig(value: unknown): VoiceProviderConfig {
  if (!isObject(value)) return defaultVoiceProviderConfig;
  const activeProviders = ["none", "twilio", "vonage", "plivo", "telnyx"];
  const d = defaultVoiceProviderConfig;
  const tw = isObject(value.twilio) ? value.twilio : {};
  const vo = isObject(value.vonage) ? value.vonage : {};
  const pl = isObject(value.plivo) ? value.plivo : {};
  const te = isObject(value.telnyx) ? value.telnyx : {};
  return {
    activeProvider: activeProviders.includes(value.activeProvider as string)
      ? (value.activeProvider as VoiceProviderConfig["activeProvider"])
      : d.activeProvider,
    twilio: {
      accountSid: coerceString(tw.accountSid, d.twilio.accountSid),
      authToken: coerceString(tw.authToken, d.twilio.authToken),
      phoneNumber: coerceString(tw.phoneNumber, d.twilio.phoneNumber),
      twimlAppSid: coerceString(tw.twimlAppSid, d.twilio.twimlAppSid),
      webhookUrl: coerceString(tw.webhookUrl, d.twilio.webhookUrl)
    },
    vonage: {
      apiKey: coerceString(vo.apiKey, d.vonage.apiKey),
      apiSecret: coerceString(vo.apiSecret, d.vonage.apiSecret),
      applicationId: coerceString(vo.applicationId, d.vonage.applicationId),
      phoneNumber: coerceString(vo.phoneNumber, d.vonage.phoneNumber),
      webhookUrl: coerceString(vo.webhookUrl, d.vonage.webhookUrl)
    },
    plivo: {
      authId: coerceString(pl.authId, d.plivo.authId),
      authToken: coerceString(pl.authToken, d.plivo.authToken),
      phoneNumber: coerceString(pl.phoneNumber, d.plivo.phoneNumber),
      appId: coerceString(pl.appId, d.plivo.appId),
      webhookUrl: coerceString(pl.webhookUrl, d.plivo.webhookUrl)
    },
    telnyx: {
      apiKey: coerceString(te.apiKey, d.telnyx.apiKey),
      phoneNumber: coerceString(te.phoneNumber, d.telnyx.phoneNumber),
      connectionId: coerceString(te.connectionId, d.telnyx.connectionId),
      webhookUrl: coerceString(te.webhookUrl, d.telnyx.webhookUrl)
    }
  };
}

export function normalizeTTSConfig(value: unknown): TTSConfig {
  if (!isObject(value)) return defaultTTSConfig;
  const providers = ["browser", "openai", "elevenlabs", "voicebox"];
  return {
    provider: providers.includes(value.provider as string) ? (value.provider as TTSConfig["provider"]) : defaultTTSConfig.provider,
    elevenlabsApiKey: coerceString(value.elevenlabsApiKey, defaultTTSConfig.elevenlabsApiKey),
    elevenlabsVoiceId: coerceString(value.elevenlabsVoiceId, defaultTTSConfig.elevenlabsVoiceId),
    openaiVoice: coerceString(value.openaiVoice, defaultTTSConfig.openaiVoice),
    openaiModel: coerceString(value.openaiModel, defaultTTSConfig.openaiModel),
    voiceboxEndpoint: coerceString(value.voiceboxEndpoint, defaultTTSConfig.voiceboxEndpoint),
    voiceboxProfileId: coerceString(value.voiceboxProfileId, defaultTTSConfig.voiceboxProfileId),
    voiceCloneStudioEndpoint: coerceString(value.voiceCloneStudioEndpoint, defaultTTSConfig.voiceCloneStudioEndpoint)
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
    metaMessengerConfigId: coerceString(value.metaMessengerConfigId, defaultSocialBotConfig.metaMessengerConfigId),
    metaInstagramConfigId: coerceString(value.metaInstagramConfigId, defaultSocialBotConfig.metaInstagramConfigId),
    webhookVerifyToken: coerceString(value.webhookVerifyToken, defaultSocialBotConfig.webhookVerifyToken),
    respondIoWorkspaceUrl: coerceString(value.respondIoWorkspaceUrl, defaultSocialBotConfig.respondIoWorkspaceUrl),
    metaBotUserId: coerceString(value.metaBotUserId, defaultSocialBotConfig.metaBotUserId),
    metaWhatsAppPhoneNumberId: coerceString(value.metaWhatsAppPhoneNumberId, defaultSocialBotConfig.metaWhatsAppPhoneNumberId),
    metaWhatsAppSystemToken: coerceString(value.metaWhatsAppSystemToken, defaultSocialBotConfig.metaWhatsAppSystemToken),
    metaMessengerPageId: coerceString(value.metaMessengerPageId, defaultSocialBotConfig.metaMessengerPageId),
    metaMessengerPageToken: coerceString(value.metaMessengerPageToken, defaultSocialBotConfig.metaMessengerPageToken),
    metaInstagramAccountId: coerceString(value.metaInstagramAccountId, defaultSocialBotConfig.metaInstagramAccountId),
    metaInstagramPageToken: coerceString(value.metaInstagramPageToken, defaultSocialBotConfig.metaInstagramPageToken)
  };
}

export function normalizeMagneticCommerceConfig(value: unknown): MagneticCommerceSettings {
  if (!isObject(value)) {
    return defaultMagneticCommerceConfig;
  }

  const normalizedAdminTarget = coerceString(value.adminCnameTarget, defaultMagneticCommerceConfig.adminCnameTarget);
  const normalizedAdminPath = coerceString(value.adminPath, defaultMagneticCommerceConfig.adminPath);
  const isLegacyAdminTarget = normalizedAdminTarget.trim().toLowerCase() === "commerce-admin.magnetic-ict.com";
  const isLegacyAdminPath = normalizedAdminPath.trim() === "/admin";

  return {
    enabled: coerceBoolean(value.enabled, defaultMagneticCommerceConfig.enabled),
    mode: value.mode === "live" ? "live" : defaultMagneticCommerceConfig.mode,
    autoApplyDnsOnAssignment: coerceBoolean(value.autoApplyDnsOnAssignment, defaultMagneticCommerceConfig.autoApplyDnsOnAssignment),
    storefrontRootARecord: coerceString(value.storefrontRootARecord, defaultMagneticCommerceConfig.storefrontRootARecord),
    storefrontWwwCnameTarget: coerceString(value.storefrontWwwCnameTarget, defaultMagneticCommerceConfig.storefrontWwwCnameTarget),
    adminCnameTarget: isLegacyAdminTarget ? defaultMagneticCommerceConfig.adminCnameTarget : normalizedAdminTarget,
    verificationTxtName: coerceString(value.verificationTxtName, defaultMagneticCommerceConfig.verificationTxtName),
    verificationTxtValue: coerceString(value.verificationTxtValue, defaultMagneticCommerceConfig.verificationTxtValue),
    adminPath: isLegacyAdminTarget && isLegacyAdminPath ? defaultMagneticCommerceConfig.adminPath : normalizedAdminPath,
    defaultStoreCurrency: coerceString(value.defaultStoreCurrency, defaultMagneticCommerceConfig.defaultStoreCurrency).toUpperCase()
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

export function normalizeTransactionalEmailConfig(value: unknown): TransactionalEmailSettings {
  if (!isObject(value)) {
    return defaultTransactionalEmailConfig;
  }

  const brevoRaw = isObject(value.brevo) ? value.brevo : {};
  return {
    enabled: coerceBoolean(value.enabled, defaultTransactionalEmailConfig.enabled),
    activeProvider: (value.activeProvider === "brevo" ? "brevo" : "mailgun") as "mailgun" | "brevo",
    provider: "mailgun",
    apiBaseUrl: coerceString(value.apiBaseUrl, defaultTransactionalEmailConfig.apiBaseUrl),
    apiKey: coerceString(value.apiKey, defaultTransactionalEmailConfig.apiKey),
    domain: coerceString(value.domain, defaultTransactionalEmailConfig.domain),
    fromEmail: coerceString(value.fromEmail, defaultTransactionalEmailConfig.fromEmail),
    fromName: coerceString(value.fromName, defaultTransactionalEmailConfig.fromName),
    replyToEmail: coerceString(value.replyToEmail, defaultTransactionalEmailConfig.replyToEmail),
    testRecipient: coerceString(value.testRecipient, defaultTransactionalEmailConfig.testRecipient),
    brevo: {
      apiKey: coerceString(brevoRaw.apiKey, ""),
      fromEmail: coerceString(brevoRaw.fromEmail, ""),
      fromName: coerceString(brevoRaw.fromName, "MagneticICT"),
      replyToEmail: coerceString(brevoRaw.replyToEmail, ""),
      testRecipient: coerceString(brevoRaw.testRecipient, "")
    }
  };
}

export function normalizeEmailNotificationsConfig(value: unknown): EmailNotificationsSettings {
  if (!isObject(value)) {
    return defaultEmailNotificationsConfig;
  }

  return Object.fromEntries(
    emailNotificationKeys.map((key) => [key, coerceBoolean(value[key], defaultEmailNotificationsConfig[key])])
  ) as EmailNotificationsSettings;
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
    tlds: Array.isArray(value.tlds) ? value.tlds : defaultDomainProviderConfig.tlds
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

export function normalizeAboutConfig(value: unknown): AboutSettings {
  if (!value || typeof value !== "object") {
    return defaultAboutConfig;
  }

  const v = value as Record<string, unknown>;

  const rawValues = Array.isArray(v.values) ? v.values : defaultAboutConfig.values;
  const values = rawValues
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : "",
      description: typeof item.description === "string" ? item.description : ""
    }));

  return {
    eyebrow: typeof v.eyebrow === "string" ? v.eyebrow : defaultAboutConfig.eyebrow,
    headline: typeof v.headline === "string" ? v.headline : defaultAboutConfig.headline,
    parentCompany: typeof v.parentCompany === "string" ? v.parentCompany : defaultAboutConfig.parentCompany,
    parentCompanyDescription: typeof v.parentCompanyDescription === "string" ? v.parentCompanyDescription : defaultAboutConfig.parentCompanyDescription,
    missionStatement: typeof v.missionStatement === "string" ? v.missionStatement : defaultAboutConfig.missionStatement,
    founderNote: typeof v.founderNote === "string" ? v.founderNote : defaultAboutConfig.founderNote,
    values: values.length > 0 ? values : defaultAboutConfig.values
  };
}

export async function getAboutSettings(): Promise<AboutSettings> {
  const value = await getSettingValue("about_config");
  return normalizeAboutConfig(value);
}

export async function getPlatformSettings(): Promise<PlatformSettingsBundle> {
  const [
    activeLanguages,
    footerDetails,
    paymentIntegrations,
    oauthConfig,
    geminiConfig,
    ttsConfig,
    voiceProviderConfig,
    infobipConfig,
    socialBotConfig,
    magneticCommerceConfig,
    trustedPartnersConfig,
    welcomeEmailConfig,
    transactionalEmailConfig,
    emailNotificationsConfig,
    domainProviderConfig,
    hostingProviderConfig,
    aboutConfig,
    brandingConfig
  ] = await Promise.all([
    getSettingValue("active_languages"),
    getSettingValue("footer_details"),
    getSettingValue("payment_integrations"),
    getSettingValue("oauth_config"),
    getSettingValue("gemini_api_key"),
    getSettingValue("tts_config"),
    getSettingValue("voice_provider_config"),
    getSettingValue("infobip_config"),
    getSettingValue("social_bot_config"),
    getSettingValue("magnetic_commerce_config"),
    getSettingValue("trusted_partners_config"),
    getSettingValue("welcome_email_config"),
    getSettingValue("transactional_email_config"),
    getSettingValue("email_notifications_config"),
    getSettingValue("domain_provider_config"),
    getSettingValue("hosting_provider_config"),
    getSettingValue("about_config"),
    getSettingValue("branding_config")
  ]);

  return {
    activeLanguages: normalizeActiveLanguages(activeLanguages),
    footerDetails: normalizeFooterDetails(footerDetails),
    paymentIntegrations: normalizePaymentIntegrations(paymentIntegrations),
    oauthConfig: normalizeOAuthConfig(oauthConfig),
    geminiConfig: normalizeGeminiConfig(geminiConfig),
    ttsConfig: normalizeTTSConfig(ttsConfig),
    voiceProviderConfig: normalizeVoiceProviderConfig(voiceProviderConfig),
    infobipConfig: normalizeInfobipConfig(infobipConfig),
    socialBotConfig: normalizeSocialBotConfig(socialBotConfig),
    magneticCommerceConfig: normalizeMagneticCommerceConfig(magneticCommerceConfig),
    trustedPartnersConfig: normalizeTrustedPartnersConfig(trustedPartnersConfig),
    welcomeEmailConfig: normalizeWelcomeEmailConfig(welcomeEmailConfig),
    transactionalEmailConfig: normalizeTransactionalEmailConfig(transactionalEmailConfig),
    emailNotificationsConfig: normalizeEmailNotificationsConfig(emailNotificationsConfig),
    domainProviderConfig: normalizeDomainProviderConfig(domainProviderConfig),
    hostingProviderConfig: normalizeHostingProviderConfig(hostingProviderConfig),
    aboutConfig: normalizeAboutConfig(aboutConfig),
    brandingConfig: normalizeBrandingConfig(brandingConfig)
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

export async function getTransactionalEmailSettings() {
  const value = await getSettingValue("transactional_email_config");
  return normalizeTransactionalEmailConfig(value);
}

export async function getEmailNotificationsSettings() {
  const value = await getSettingValue("email_notifications_config");
  return normalizeEmailNotificationsConfig(value);
}

export async function getTrustedPartnersSettings() {
  const value = await getSettingValue("trusted_partners_config");
  return normalizeTrustedPartnersConfig(value);
}

export async function saveTrustedPartnersSettings(value: TrustedPartnersSettings) {
  if (!hasDatabase) {
    return;
  }

  await prisma.setting.upsert({
    where: { key: "trusted_partners_config" },
    update: { value },
    create: { key: "trusted_partners_config", value }
  });
}

export async function getDomainProviderSettings() {
  const value = await getSettingValue("domain_provider_config");
  return normalizeDomainProviderConfig(value);
}

export async function getHostingProviderSettings() {
  const value = await getSettingValue("hosting_provider_config");
  return normalizeHostingProviderConfig(value);
}

export async function getMagneticCommerceSettings() {
  const value = await getSettingValue("magnetic_commerce_config");
  return normalizeMagneticCommerceConfig(value);
}

export function getOAuthProviderAvailability(settings: OAuthSettings) {
  const resolved = getResolvedOAuthSettings(settings);

  return {
    google: Boolean(resolved.google.clientId && resolved.google.clientSecret),
    github: Boolean(resolved.github.clientId && resolved.github.clientSecret),
    apple: Boolean(resolved.apple.clientId && resolved.apple.clientSecret)
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
