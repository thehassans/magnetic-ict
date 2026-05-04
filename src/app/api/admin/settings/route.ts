import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { routing } from "@/i18n/routing";
import { prisma } from "@/lib/prisma";

const hasDatabase = Boolean(process.env.DATABASE_URL);

const localeSchema = z.string().refine(
  (value) => routing.locales.includes(value as (typeof routing.locales)[number]),
  "Unsupported locale"
);

const requestSchema = z.discriminatedUnion("section", [
  z.object({
    section: z.literal("languages"),
    value: z
      .array(
        z.object({
          code: localeSchema,
          label: z.string().min(1),
          direction: z.enum(["ltr", "rtl"]).optional().default("ltr")
        })
      )
      .min(1)
  }),
  z.object({
    section: z.literal("footer"),
    value: z.object({
      supportEmail: z.string().email(),
      supportPhone: z.string().min(3),
      locationLabel: z.string().min(3),
      ctaHref: z.string().startsWith("/")
    })
  }),
  z.object({
    section: z.literal("payments"),
    value: z.object({
      stripe: z.object({ enabled: z.boolean() }),
      paypal: z.object({ enabled: z.boolean() }),
      applePay: z.object({ enabled: z.boolean() }),
      googlePay: z.object({ enabled: z.boolean() })
    })
  }),
  z.object({
    section: z.literal("oauth"),
    value: z.object({
      google: z.object({
        enabled: z.boolean(),
        clientId: z.string(),
        clientSecret: z.string()
      }),
      github: z.object({
        enabled: z.boolean(),
        clientId: z.string(),
        clientSecret: z.string()
      }),
      apple: z.object({
        enabled: z.boolean(),
        clientId: z.string(),
        clientSecret: z.string()
      })
    })
  }),
  z.object({
    section: z.literal("gemini"),
    value: z.object({
      apiKey: z.string()
    })
  }),
  z.object({
    section: z.literal("socialBot"),
    value: z.object({
      globalBotInstructions: z.string(),
      metaAppId: z.string(),
      metaAppSecret: z.string(),
      metaConfigId: z.string(),
      webhookVerifyToken: z.string()
    })
  }),
  z.object({
    section: z.literal("welcomeEmail"),
    value: z.object({
      enabled: z.boolean(),
      subject: z.string().min(1),
      headline: z.string().min(1),
      body: z.string().min(1),
      ctaLabel: z.string().min(1),
      ctaHref: z.string().min(1)
    })
  }),
  z.object({
    section: z.literal("domain"),
    value: z.object({
      enabled: z.boolean(),
      mode: z.enum(["manual", "live"]),
      providerLabel: z.string().min(1),
      automationEndpoint: z.string(),
      automationToken: z.string(),
      checkoutProvider: z.enum(["STRIPE", "PAYPAL"]),
      defaultYears: z.number().min(1).max(10),
      autoRegisterAfterPayment: z.boolean(),
      defaultDnsTtl: z.number().int().min(60).max(86400),
      includePrivacyProtectionByDefault: z.boolean(),
      allowCustomNameservers: z.boolean(),
      priceMarkupPercent: z.number().min(0).max(1000),
      priceMarkupFlat: z.number().min(0).max(100000),
      renewalMarkupPercent: z.number().min(0).max(1000),
      renewalMarkupFlat: z.number().min(0).max(100000),
      defaultNameservers: z.array(z.string().min(1)).min(1).max(8),
      comPrice: z.number().nonnegative(),
      netPrice: z.number().nonnegative(),
      orgPrice: z.number().nonnegative(),
      ioPrice: z.number().nonnegative(),
      defaultPrice: z.number().nonnegative()
    })
  }),
  z.object({
    section: z.literal("hosting"),
    value: z.object({
      enabled: z.boolean(),
      mode: z.enum(["manual", "live"]),
      resellerBaseUrl: z.string().min(1),
      resellerUsername: z.string(),
      resellerPassword: z.string(),
      cloudBaseUrl: z.string().min(1),
      cloudToken: z.string(),
      cloudContractNumber: z.string(),
      defaultLocation: z.string().min(1),
      defaultImageAlias: z.string().min(1),
      createResellerContracts: z.boolean(),
      createContractAdmins: z.boolean(),
      customerPanelLabel: z.string(),
      customerPanelUrlTemplate: z.string(),
      customerPanelHelpText: z.string(),
      operatingSystems: z.array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          description: z.string(),
          imageAlias: z.string().min(1),
          enabled: z.boolean(),
          recommended: z.boolean()
        })
      ),
      controlPanels: z.array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          description: z.string(),
          monthlyPrice: z.number().nonnegative(),
          enabled: z.boolean(),
          recommended: z.boolean()
        })
      ),
      addons: z.array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          description: z.string(),
          monthlyPrice: z.number().nonnegative(),
          enabled: z.boolean(),
          defaultSelected: z.boolean()
        })
      ),
      locations: z.array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          description: z.string(),
          value: z.string().min(1),
          enabled: z.boolean(),
          recommended: z.boolean()
        })
      )
    })
  })
]);

const settingKeyBySection = {
  languages: "active_languages",
  footer: "footer_details",
  payments: "payment_integrations",
  oauth: "oauth_config",
  gemini: "gemini_api_key",
  socialBot: "social_bot_config",
  welcomeEmail: "welcome_email_config",
  domain: "domain_provider_config",
  hosting: "hosting_provider_config"
} as const;

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ error: "DATABASE_URL must be configured before admin settings can be saved." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide valid settings data." }, { status: 400 });
    }

    const key = settingKeyBySection[parsed.data.section];
    const saved = await prisma.setting.upsert({
      where: { key },
      update: { value: parsed.data.value },
      create: { key, value: parsed.data.value }
    });

    return NextResponse.json({ ok: true, key: saved.key, value: saved.value });
  } catch (error) {
    console.error("Admin settings update failed", error);
    return NextResponse.json({ error: "Unable to save settings right now." }, { status: 500 });
  }
}
