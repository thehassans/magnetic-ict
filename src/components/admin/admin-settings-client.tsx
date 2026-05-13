"use client";

import { type ReactNode, useMemo, useState } from "react";
import { Bell, BookOpen, Check, Code2, CreditCard, Globe2, Key, Languages, Loader2, Mail, MailOpen, MessageSquare, Palette, Server, Settings2, Sparkles, ToggleLeft, Users } from "lucide-react";
import { BrandingEditor } from "@/components/admin/branding-editor";
import { HostingConfigEditor } from "@/components/admin/hosting-config-editor";
import { TrustedPartnersEditor } from "@/components/admin/trusted-partners-editor";
import { DomainTldEditor } from "@/components/admin/domain-tld-editor";
import type { DomainProviderSettings } from "@/lib/domain-types";
import type { EmailLogRecord } from "@/lib/email-logs";
import type { HostingProviderSettings } from "@/lib/hosting-types";
import type { ActiveLanguage } from "@/types/i18n";
import type {
  AboutSettings,
  BrandingConfig,
  EmailNotificationsSettings,
  FooterSettings,
  GeminiSettings,
  MagneticCommerceSettings,
  OAuthSettings,
  PaymentIntegrationsSettings,
  SocialBotSettings,
  TransactionalEmailSettings,
  TrustedPartnersSettings,
  WelcomeEmailSettings
} from "@/lib/platform-settings";

type AdminSettingsClientProps = {
  activeLanguages: ActiveLanguage[];
  availableLanguages: ActiveLanguage[];
  footerDetails: FooterSettings;
  paymentIntegrations: PaymentIntegrationsSettings;
  oauthConfig: OAuthSettings;
  geminiConfig: GeminiSettings;
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
  emailLogs: EmailLogRecord[];
  appBaseUrl: string;
  canPersist: boolean;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const settingsSectionLabel: Record<"languages" | "footer" | "payments" | "oauth" | "gemini" | "socialBot" | "magneticCommerce" | "trustedPartners" | "welcomeEmail" | "transactionalEmail" | "emailNotifications" | "domain" | "hosting" | "about", string> = {
  languages: "Language",
  footer: "Footer",
  payments: "Payment",
  oauth: "OAuth",
  gemini: "Gemini",
  socialBot: "Chatbot",
  magneticCommerce: "Magnetic Commerce",
  trustedPartners: "Trusted partners",
  welcomeEmail: "Welcome email",
  transactionalEmail: "Transactional email",
  emailNotifications: "Email notification",
  domain: "Domain",
  hosting: "Hosting",
  about: "About page"
};

type TabKey = "about" | "languages" | "footer" | "trustedPartners" | "payments" | "oauth" | "gemini" | "domain" | "hosting" | "socialBot" | "magneticCommerce" | "welcomeEmail" | "transactionalEmail" | "emailNotifications" | "emailLogs" | "branding";

const tabs: { key: TabKey; label: string; icon: ReactNode }[] = [
  { key: "about",               label: "About",          icon: <BookOpen className="h-3.5 w-3.5" /> },
  { key: "languages",           label: "Languages",      icon: <Languages className="h-3.5 w-3.5" /> },
  { key: "footer",              label: "Footer",         icon: <Settings2 className="h-3.5 w-3.5" /> },
  { key: "trustedPartners",     label: "Partners",       icon: <Users className="h-3.5 w-3.5" /> },
  { key: "payments",            label: "Payments",       icon: <CreditCard className="h-3.5 w-3.5" /> },
  { key: "oauth",               label: "OAuth",          icon: <Key className="h-3.5 w-3.5" /> },
  { key: "gemini",              label: "AI / Gemini",    icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: "domain",              label: "Domains",        icon: <Globe2 className="h-3.5 w-3.5" /> },
  { key: "hosting",             label: "Hosting",        icon: <Server className="h-3.5 w-3.5" /> },
  { key: "socialBot",           label: "Chatbot",        icon: <MessageSquare className="h-3.5 w-3.5" /> },
  { key: "magneticCommerce",    label: "Commerce",       icon: <Code2 className="h-3.5 w-3.5" /> },
  { key: "welcomeEmail",        label: "Welcome Email",  icon: <MailOpen className="h-3.5 w-3.5" /> },
  { key: "transactionalEmail",  label: "Email Provider", icon: <Mail className="h-3.5 w-3.5" /> },
  { key: "emailNotifications",  label: "Notifications",  icon: <Bell className="h-3.5 w-3.5" /> },
  { key: "emailLogs",           label: "Email Logs",     icon: <ToggleLeft className="h-3.5 w-3.5" /> },
  { key: "branding",            label: "Branding",       icon: <Palette className="h-3.5 w-3.5" /> },
];

function createVerifyToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

const PROMPT_TEMPLATES: { label: string; description: string; prompt: string }[] = [
  {
    label: "Master AI Agent (A–Z Lead Capture)",
    description: "Full lead qualification workflow with discovery, budget, timeline, pain-point capture, and human handoff.",
    prompt: `## Identity & Role
You are the Lead Qualification Specialist for [Company Name]. Your goal is to provide helpful information to inbound leads and qualify them for our sales team.
Tone: Professional, helpful, and concise. Use emojis sparingly to remain friendly but business-oriented.
Language: Respond in the same language the user uses.

## Knowledge Base & Context
You have access to company documentation regarding [Products/Services]. Always prioritise information found in the Knowledge Base. If a user asks something not covered, do not hallucinate — politely inform them that a human specialist will provide those specific details shortly.

## Operational Workflow

### Phase A — Greeting & Discovery
1. Acknowledge the user's initial query immediately.
2. If the user is new, ask for their Name and Company Name.

### Phase B — Lead Qualification (Core)
Before transferring to a human, identify the following:
- **Budget**: Are they looking for an entry-level or enterprise solution?
- **Timeline**: How soon do they need to implement a solution?
- **Pain Point**: What is the primary problem they are trying to solve today?

### Phase C — Value Delivery
- Answer up to 3 technical or product-related questions using the Knowledge Base.
- If they ask about pricing, provide the general range and mention that "Custom quotes are handled by our account managers."

## Guardrails & Constraints
- **No Legal Advice**: Do not provide legal or binding contractual guarantees.
- **No Competitor Comparison**: If asked about competitors, focus on [Company Name]'s strengths rather than disparaging others.
- **Handoff Trigger**: If the user asks to "Speak to a human," "Talk to sales," or if all qualification info is gathered, trigger a handoff response.

## Closing & Handoff
Once qualified, say: "Thank you for that information. I am now connecting you with one of our specialists who will take it from here. They usually respond within [Timeframe]."`,
  },
  {
    label: "Simple Support Assistant",
    description: "Concise, helpful assistant that answers product questions and escalates when needed.",
    prompt: `You are a friendly customer support assistant for [Company Name]. Answer questions clearly and concisely using the knowledge base. If the answer is not in the knowledge base, say "Let me connect you with a specialist for that." Never invent facts, pricing, or policies. Keep replies short and natural — 2 to 4 sentences maximum.`,
  },
  {
    label: "E-commerce Product Assistant",
    description: "Helps customers find the right product, check pricing, and proceed to checkout.",
    prompt: `You are a helpful product advisor for [Company Name]'s online store. Help customers find the right product for their needs using the knowledge base. Always mention current pricing if available. If they are ready to buy, direct them to the checkout or provide the product link. Never make up stock levels or delivery dates — ask a specialist if unsure.`,
  },
];

export function AdminSettingsClient({
  activeLanguages,
  availableLanguages,
  footerDetails,
  paymentIntegrations,
  oauthConfig,
  geminiConfig,
  socialBotConfig,
  magneticCommerceConfig,
  trustedPartnersConfig,
  welcomeEmailConfig,
  transactionalEmailConfig,
  emailNotificationsConfig,
  domainProviderConfig,
  hostingProviderConfig,
  aboutConfig,
  brandingConfig,
  emailLogs,
  appBaseUrl,
  canPersist
}: AdminSettingsClientProps) {
  const [selectedLanguageCodes, setSelectedLanguageCodes] = useState(activeLanguages.map((language) => language.code));
  const [footerState, setFooterState] = useState(footerDetails);
  const [paymentState, setPaymentState] = useState(paymentIntegrations);
  const [oauthState, setOAuthState] = useState(oauthConfig);
  const [geminiState, setGeminiState] = useState(geminiConfig);
  const [socialBotState, setSocialBotState] = useState(socialBotConfig);
  const [magneticCommerceState, setMagneticCommerceState] = useState(magneticCommerceConfig);
  const [trustedPartnersState, setTrustedPartnersState] = useState(trustedPartnersConfig);
  const [welcomeEmailState, setWelcomeEmailState] = useState(welcomeEmailConfig);
  const [transactionalEmailState, setTransactionalEmailState] = useState(transactionalEmailConfig);
  const [emailNotificationsState, setEmailNotificationsState] = useState(emailNotificationsConfig);
  const [domainState, setDomainState] = useState(domainProviderConfig);
  const [hostingState, setHostingState] = useState(hostingProviderConfig);
  const [aboutState, setAboutState] = useState(aboutConfig);
  const [brandingState, setBrandingState] = useState(brandingConfig);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("about");

  const selectedLanguages = useMemo(
    () => availableLanguages.filter((language) => selectedLanguageCodes.includes(language.code)),
    [availableLanguages, selectedLanguageCodes]
  );
  const metaWebhookUrl = useMemo(() => (appBaseUrl ? `${appBaseUrl}/api/social-bot/meta/webhook` : ""), [appBaseUrl]);

  async function saveSection(section: "languages" | "footer" | "payments" | "oauth" | "gemini" | "socialBot" | "magneticCommerce" | "trustedPartners" | "welcomeEmail" | "transactionalEmail" | "emailNotifications" | "domain" | "hosting" | "about", value: unknown) {
    setLoadingSection(section);
    setToast(null);

    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ section, value })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setToast({ type: "error", message: payload.error ?? "Unable to save settings right now." });
      setLoadingSection(null);
      return;
    }

    setToast({ type: "success", message: `${settingsSectionLabel[section]} settings saved.` });
    setLoadingSection(null);
  }

  async function handleEmailTest() {
    setLoadingSection("email-test");
    setToast(null);

    const response = await fetch("/api/admin/settings/email-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...transactionalEmailState,
        activeProvider: transactionalEmailState.activeProvider,
        recipient: transactionalEmailState.activeProvider === "brevo"
          ? transactionalEmailState.brevo.testRecipient
          : transactionalEmailState.testRecipient
      })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

    if (!response.ok) {
      setToast({ type: "error", message: payload.error ?? "Unable to send the test email right now." });
      setLoadingSection(null);
      return;
    }

    setToast({ type: "success", message: payload.message ?? "Test email sent successfully." });
    setLoadingSection(null);
  }

  async function copyValue(label: string, value: string) {
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) {
      setToast({ type: "error", message: `Unable to copy ${label.toLowerCase()} right now.` });
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setToast({ type: "success", message: `${label} copied.` });
    } catch {
      setToast({ type: "error", message: `Unable to copy ${label.toLowerCase()} right now.` });
    }
  }

  async function handleGenerateVerifyToken() {
    const nextState = { ...socialBotState, webhookVerifyToken: createVerifyToken() };
    setSocialBotState(nextState);
    await saveSection("socialBot", nextState);
  }

  async function handleSaveSocialBot() {
    const nextState = socialBotState.webhookVerifyToken.trim()
      ? socialBotState
      : { ...socialBotState, webhookVerifyToken: createVerifyToken() };

    if (nextState.webhookVerifyToken !== socialBotState.webhookVerifyToken) {
      setSocialBotState(nextState);
    }

    await saveSection("socialBot", nextState);
  }

  async function handleGeminiTest() {
    setLoadingSection("gemini-test");
    setToast(null);

    const response = await fetch("/api/admin/settings/gemini-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ apiKey: geminiState.apiKey })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

    if (!response.ok) {
      setToast({ type: "error", message: payload.error ?? "Gemini connection failed." });
      setLoadingSection(null);
      return;
    }

    setToast({ type: "success", message: payload.message ?? "Gemini connection successful." });
    setLoadingSection(null);
  }

  return (
    <div className="space-y-0">
      {toast ? (
        <div className={`fixed right-6 top-6 z-[120] flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-md ${
          toast.type === "success"
            ? "border-emerald-200/60 bg-emerald-50/95 text-emerald-800"
            : "border-rose-200/60 bg-rose-50/95 text-rose-800"
        }`}>
          <span className={`h-2 w-2 rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
          {toast.message}
        </div>
      ) : null}

      {!canPersist ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          DATABASE_URL is not configured — forms are preview-only.
        </div>
      ) : null}

      {/* ── Tab bar ── */}
      <div className="relative mb-6">
        <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-white text-slate-950 shadow-md shadow-slate-200/80 dark:bg-slate-800 dark:text-white dark:shadow-slate-900/50"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.06]"
              }`}
            >
              <span className={activeTab === tab.key ? "text-violet-600 dark:text-violet-400" : ""}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "about" && <SettingsCard
        title="About page"
        description="Edit the content shown on the public /about page. Changes take effect immediately on the next page load."
        action={<Button label="Save about page" loading={loadingSection === "about"} onClick={() => saveSection("about", aboutState)} />}
      >{/* about */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Input label="Eyebrow" value={aboutState.eyebrow} onChange={(value) => setAboutState((current) => ({ ...current, eyebrow: value }))} />
          <Input label="Headline" value={aboutState.headline} onChange={(value) => setAboutState((current) => ({ ...current, headline: value }))} />
          <Input label="Parent company name" value={aboutState.parentCompany} onChange={(value) => setAboutState((current) => ({ ...current, parentCompany: value }))} />
        </div>
        <div className="mt-4 space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-slate-700">Parent company description</span>
            <textarea
              value={aboutState.parentCompanyDescription}
              onChange={(event) => setAboutState((current) => ({ ...current, parentCompanyDescription: event.target.value }))}
              rows={4}
              className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-slate-700">Mission statement</span>
            <textarea
              value={aboutState.missionStatement}
              onChange={(event) => setAboutState((current) => ({ ...current, missionStatement: event.target.value }))}
              rows={3}
              className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-slate-700">Founder note</span>
            <textarea
              value={aboutState.founderNote}
              onChange={(event) => setAboutState((current) => ({ ...current, founderNote: event.target.value }))}
              rows={3}
              className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
            />
          </label>
        </div>
        <div className="mt-6">
          <div className="mb-3 text-sm font-semibold text-slate-700">Values</div>
          <div className="space-y-3">
            {aboutState.values.map((val, index) => (
              <div key={index} className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2">
                <Input
                  label={`Value ${index + 1} title`}
                  value={val.title}
                  onChange={(newTitle) => setAboutState((current) => ({
                    ...current,
                    values: current.values.map((v, i) => i === index ? { ...v, title: newTitle } : v)
                  }))}
                />
                <Input
                  label={`Value ${index + 1} description`}
                  value={val.description}
                  onChange={(newDesc) => setAboutState((current) => ({
                    ...current,
                    values: current.values.map((v, i) => i === index ? { ...v, description: newDesc } : v)
                  }))}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAboutState((current) => ({ ...current, values: [...current.values, { title: "", description: "" }] }))}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            + Add value
          </button>
        </div>
      </SettingsCard>}

      {activeTab === "languages" && <SettingsCard
        title="Language & localization"
        description="Choose which shipped locales are active in the storefront header. New arbitrary languages still require code-level routing/messages to be added."
        action={
          <Button
            label="Save languages"
            loading={loadingSection === "languages"}
            onClick={() =>
              saveSection(
                "languages",
                selectedLanguages.map((language) => ({
                  code: language.code,
                  label: language.label,
                  direction: language.direction ?? "ltr"
                }))
              )
            }
          />
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {availableLanguages.map((language) => {
            const checked = selectedLanguageCodes.includes(language.code);
            return (
              <button
                key={language.code}
                type="button"
                onClick={() =>
                  setSelectedLanguageCodes((current) =>
                    checked ? current.filter((code) => code !== language.code) : [...current, language.code]
                  )
                }
                className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${checked ? "border-violet-500/40 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20" : "border-slate-200/80 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.03]"}`}
              >
                <div>
                  <div className="text-[13px] font-semibold">{language.label}</div>
                  <div className={`mt-0.5 text-[10px] font-bold uppercase tracking-[0.24em] ${checked ? "text-white/70" : "text-slate-400"}`}>{language.code}</div>
                </div>
                {checked ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
      </SettingsCard>}

      {activeTab === "footer" && <SettingsCard
        title="Footer management"
        description="Update the public footer contact details and CTA destination. These values are wired into the live footer."
        action={<Button label="Save footer" loading={loadingSection === "footer"} onClick={() => saveSection("footer", footerState)} />}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Support email" value={footerState.supportEmail} onChange={(value) => setFooterState((current) => ({ ...current, supportEmail: value }))} />
          <Input label="Support phone" value={footerState.supportPhone} onChange={(value) => setFooterState((current) => ({ ...current, supportPhone: value }))} />
          <Input label="Location label" value={footerState.locationLabel} onChange={(value) => setFooterState((current) => ({ ...current, locationLabel: value }))} />
          <Input label="CTA href" value={footerState.ctaHref} onChange={(value) => setFooterState((current) => ({ ...current, ctaHref: value }))} />
        </div>
      </SettingsCard>}

      {activeTab === "trustedPartners" && <SettingsCard
        title="Trusted partners"
        description="Manage the partner logos shown on the landing page. Uploads are converted to WebP and stored through the admin panel."
        action={<Button label="Save partners" loading={loadingSection === "trustedPartners"} onClick={() => saveSection("trustedPartners", trustedPartnersState)} />}
      >
        <TrustedPartnersEditor value={trustedPartnersState} onChange={setTrustedPartnersState} disabled={loadingSection === "trustedPartners"} />
      </SettingsCard>}

      {activeTab === "payments" && <SettingsCard
        title="Payment integrations"
        description="Control which payment methods appear at checkout and are accepted by the checkout API."
        action={<Button label="Save payments" loading={loadingSection === "payments"} onClick={() => saveSection("payments", paymentState)} />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ToggleCard label="Stripe" checked={paymentState.stripe.enabled} onChange={(checked) => setPaymentState((current) => ({ ...current, stripe: { enabled: checked } }))} />
          <ToggleCard label="PayPal" checked={paymentState.paypal.enabled} onChange={(checked) => setPaymentState((current) => ({ ...current, paypal: { enabled: checked } }))} />
          <ToggleCard label="Apple Pay" checked={paymentState.applePay.enabled} onChange={(checked) => setPaymentState((current) => ({ ...current, applePay: { enabled: checked } }))} />
          <ToggleCard label="Google Pay" checked={paymentState.googlePay.enabled} onChange={(checked) => setPaymentState((current) => ({ ...current, googlePay: { enabled: checked } }))} />
        </div>
      </SettingsCard>}

      {activeTab === "oauth" && <SettingsCard
        title="OAuth configuration"
        description="Control which social sign-in providers are live and store their credentials for the customer login experience."
        action={<Button label="Save OAuth config" loading={loadingSection === "oauth"} onClick={() => saveSection("oauth", oauthState)} />}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <ToggleCard label="Google" checked={oauthState.google.enabled} onChange={(checked) => setOAuthState((current) => ({ ...current, google: { ...current.google, enabled: checked } }))} />
          <ToggleCard label="GitHub" checked={oauthState.github.enabled} onChange={(checked) => setOAuthState((current) => ({ ...current, github: { ...current.github, enabled: checked } }))} />
          <ToggleCard label="Apple" checked={oauthState.apple.enabled} onChange={(checked) => setOAuthState((current) => ({ ...current, apple: { ...current.apple, enabled: checked } }))} />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div>
              <div className="font-semibold text-slate-950">Google</div>
              <div className="mt-1 text-sm text-slate-500">Used for Continue with Google.</div>
            </div>
            <Input label="Client ID" value={oauthState.google.clientId} onChange={(value) => setOAuthState((current) => ({ ...current, google: { ...current.google, clientId: value } }))} />
            <Input label="Client secret" value={oauthState.google.clientSecret} onChange={(value) => setOAuthState((current) => ({ ...current, google: { ...current.google, clientSecret: value } }))} type="password" />
          </div>
          <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div>
              <div className="font-semibold text-slate-950">GitHub</div>
              <div className="mt-1 text-sm text-slate-500">Used for Continue with GitHub.</div>
            </div>
            <Input label="Client ID" value={oauthState.github.clientId} onChange={(value) => setOAuthState((current) => ({ ...current, github: { ...current.github, clientId: value } }))} />
            <Input label="Client secret" value={oauthState.github.clientSecret} onChange={(value) => setOAuthState((current) => ({ ...current, github: { ...current.github, clientSecret: value } }))} type="password" />
          </div>
          <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div>
              <div className="font-semibold text-slate-950">Apple</div>
              <div className="mt-1 text-sm text-slate-500">Used for Continue with Apple.</div>
            </div>
            <Input label="Client ID" value={oauthState.apple.clientId} onChange={(value) => setOAuthState((current) => ({ ...current, apple: { ...current.apple, clientId: value } }))} />
            <Input label="Client secret" value={oauthState.apple.clientSecret} onChange={(value) => setOAuthState((current) => ({ ...current, apple: { ...current.apple, clientSecret: value } }))} type="password" />
          </div>
        </div>
      </SettingsCard>}

      {activeTab === "gemini" && <SettingsCard
        title="AI integration"
        description="Store your Gemini API key and test a live request against the `gemini-3-flash-preview` model."
        action={
          <div className="flex flex-wrap gap-3">
            <Button label="Save Gemini key" loading={loadingSection === "gemini"} onClick={() => saveSection("gemini", geminiState)} />
            <Button label="Test connection" loading={loadingSection === "gemini-test"} variant="secondary" onClick={handleGeminiTest} />
          </div>
        }
      >
        <Input label="Gemini API key" value={geminiState.apiKey} onChange={(value) => setGeminiState({ apiKey: value })} type="password" icon={<Sparkles className="h-4 w-4" />} />
      </SettingsCard>}

      {activeTab === "domain" && <SettingsCard
        title="Domain operations"
        description="Configure domain pricing, public search behavior, checkout provider, and optional live registration automation. Search uses RDAP availability checks. Public customers do not choose the payment provider here; checkout uses the admin-managed configuration below."
        action={<Button label="Save domain config" loading={loadingSection === "domain"} onClick={() => saveSection("domain", domainState)} />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ToggleCard label="Domains enabled" checked={domainState.enabled} onChange={(checked) => setDomainState((current) => ({ ...current, enabled: checked }))} />
          <ToggleCard label="Live automation" checked={domainState.mode === "live"} onChange={(checked) => setDomainState((current) => ({ ...current, mode: checked ? "live" : "manual" }))} />
          <ToggleCard label="Auto-register after payment" checked={domainState.autoRegisterAfterPayment} onChange={(checked) => setDomainState((current) => ({ ...current, autoRegisterAfterPayment: checked }))} />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Input label="Provider label" value={domainState.providerLabel} onChange={(value) => setDomainState((current) => ({ ...current, providerLabel: value }))} />
          <Input label="Automation endpoint" value={domainState.automationEndpoint} onChange={(value) => setDomainState((current) => ({ ...current, automationEndpoint: value }))} />
          <Input label="Automation token" value={domainState.automationToken} onChange={(value) => setDomainState((current) => ({ ...current, automationToken: value }))} type="password" />
          <SelectInput label="Checkout provider" value={domainState.checkoutProvider} onChange={(value) => setDomainState((current) => ({ ...current, checkoutProvider: value as "STRIPE" | "PAYPAL" }))} options={[{ value: "STRIPE", label: "Stripe" }, { value: "PAYPAL", label: "PayPal" }]} />
          <Input label="Default registration years" value={String(domainState.defaultYears)} onChange={(value) => setDomainState((current) => ({ ...current, defaultYears: Math.max(1, Number(value) || 1) }))} type="number" />
          <Input label="Default DNS TTL" value={String(domainState.defaultDnsTtl)} onChange={(value) => setDomainState((current) => ({ ...current, defaultDnsTtl: Math.max(60, Number(value) || 60) }))} type="number" />
          <Input label="Search markup %" value={String(domainState.priceMarkupPercent)} onChange={(value) => setDomainState((current) => ({ ...current, priceMarkupPercent: Number(value) || 0 }))} type="number" />
          <Input label="Search markup flat" value={String(domainState.priceMarkupFlat)} onChange={(value) => setDomainState((current) => ({ ...current, priceMarkupFlat: Number(value) || 0 }))} type="number" />
          <Input label="Renewal markup %" value={String(domainState.renewalMarkupPercent)} onChange={(value) => setDomainState((current) => ({ ...current, renewalMarkupPercent: Number(value) || 0 }))} type="number" />
          <Input label="Renewal markup flat" value={String(domainState.renewalMarkupFlat)} onChange={(value) => setDomainState((current) => ({ ...current, renewalMarkupFlat: Number(value) || 0 }))} type="number" />
          
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ToggleCard label="Privacy by default" checked={domainState.includePrivacyProtectionByDefault} onChange={(checked) => setDomainState((current) => ({ ...current, includePrivacyProtectionByDefault: checked }))} />
          <ToggleCard label="Allow custom nameservers" checked={domainState.allowCustomNameservers} onChange={(checked) => setDomainState((current) => ({ ...current, allowCustomNameservers: checked }))} />
        </div>
        <label className="mt-6 block space-y-2 text-sm">
          <span className="font-semibold text-slate-700">Default nameservers</span>
          <textarea
            value={domainState.defaultNameservers.join("\n")}
            onChange={(event) => setDomainState((current) => ({
              ...current,
              defaultNameservers: event.target.value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean)
            }))}
            rows={4}
            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
          />
        </label>
        <DomainTldEditor tlds={domainState.tlds || []} onChange={(tlds) => setDomainState(current => ({ ...current, tlds }))} />
      </SettingsCard>}

      {activeTab === "hosting" && <SettingsCard
        title="Magnetic VPS Hosting provider"
        description="Configure the reseller and cloud settings used by Magnetic VPS Hosting fulfillment. Manual mode keeps provisioning records internal. Live mode enables direct API-backed contract and infrastructure orchestration."
        action={<Button label="Save hosting config" loading={loadingSection === "hosting"} onClick={() => saveSection("hosting", hostingState)} />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ToggleCard label="Hosting enabled" checked={hostingState.enabled} onChange={(checked) => setHostingState((current) => ({ ...current, enabled: checked }))} />
          <ToggleCard label="Live provisioning" checked={hostingState.mode === "live"} onChange={(checked) => setHostingState((current) => ({ ...current, mode: checked ? "live" : "manual" }))} />
          <ToggleCard label="Create reseller contracts" checked={hostingState.createResellerContracts} onChange={(checked) => setHostingState((current) => ({ ...current, createResellerContracts: checked }))} />
          <ToggleCard label="Create contract admins" checked={hostingState.createContractAdmins} onChange={(checked) => setHostingState((current) => ({ ...current, createContractAdmins: checked }))} />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Input label="Reseller base URL" value={hostingState.resellerBaseUrl} onChange={(value) => setHostingState((current) => ({ ...current, resellerBaseUrl: value }))} />
          <Input label="Cloud base URL" value={hostingState.cloudBaseUrl} onChange={(value) => setHostingState((current) => ({ ...current, cloudBaseUrl: value }))} />
          <Input label="Reseller username" value={hostingState.resellerUsername} onChange={(value) => setHostingState((current) => ({ ...current, resellerUsername: value }))} />
          <Input label="Reseller password" value={hostingState.resellerPassword} onChange={(value) => setHostingState((current) => ({ ...current, resellerPassword: value }))} type="password" />
          <Input label="Cloud API token" value={hostingState.cloudToken} onChange={(value) => setHostingState((current) => ({ ...current, cloudToken: value }))} type="password" />
          <Input label="Cloud contract number" value={hostingState.cloudContractNumber} onChange={(value) => setHostingState((current) => ({ ...current, cloudContractNumber: value }))} />
          <Input label="Default location" value={hostingState.defaultLocation} onChange={(value) => setHostingState((current) => ({ ...current, defaultLocation: value }))} />
          <Input label="Default image alias" value={hostingState.defaultImageAlias} onChange={(value) => setHostingState((current) => ({ ...current, defaultImageAlias: value }))} />
          <Input label="Customer panel label" value={hostingState.customerPanelLabel} onChange={(value) => setHostingState((current) => ({ ...current, customerPanelLabel: value }))} />
          <Input label="Customer panel URL template" value={hostingState.customerPanelUrlTemplate} onChange={(value) => setHostingState((current) => ({ ...current, customerPanelUrlTemplate: value }))} />
        </div>
        <label className="mt-6 block space-y-2 text-sm">
          <span className="font-semibold text-slate-700">Customer panel help text</span>
          <textarea
            value={hostingState.customerPanelHelpText}
            onChange={(event) => setHostingState((current) => ({ ...current, customerPanelHelpText: event.target.value }))}
            rows={3}
            className="w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
          />
        </label>
        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          <div className="font-semibold text-slate-950">Provisioning mode</div>
          <p className="mt-2">
            <span className="font-medium text-slate-950">Manual:</span> store provisioning requests and operator references inside Magnetic only.
          </p>
          <p>
            <span className="font-medium text-slate-950">Live:</span> call the provider reseller API for contracts/admins and the cloud API for data center and server provisioning during fulfillment.
          </p>
          <p>
            <span className="font-medium text-slate-950">URL template:</span> use placeholders like {"{orderId}"}, {"{email}"}, {"{contractId}"}, {"{adminId}"}, {"{serverId}"}, and {"{datacenterId}"}.
          </p>
        </div>
        <HostingConfigEditor value={hostingState} onChange={setHostingState} />
      </SettingsCard>}

      {activeTab === "socialBot" && <SettingsCard
        title="Magnetic Chatbot"
        description="Configure the Meta app values required by WhatsApp, Messenger, and Instagram. This follows the Meta setup flow for webhook callback URL, verify token, app secret validation, and embedded business login configuration."
        action={<Button label="Save Social Bot config" loading={loadingSection === "socialBot"} onClick={() => void handleSaveSocialBot()} />}
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <Input label="Meta App ID" value={socialBotState.metaAppId} onChange={(value) => setSocialBotState((current) => ({ ...current, metaAppId: value }))} />
          <Input label="Meta App Secret" value={socialBotState.metaAppSecret} onChange={(value) => setSocialBotState((current) => ({ ...current, metaAppSecret: value }))} type="password" />
          <Input label="Meta Config ID" value={socialBotState.metaConfigId} onChange={(value) => setSocialBotState((current) => ({ ...current, metaConfigId: value }))} />
          <Input label="Webhook verify token" value={socialBotState.webhookVerifyToken} onChange={(value) => setSocialBotState((current) => ({ ...current, webhookVerifyToken: value }))} type="password" />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button label={socialBotState.webhookVerifyToken ? "Regenerate & save verify token" : "Generate & save verify token"} loading={loadingSection === "socialBot"} onClick={() => void handleGenerateVerifyToken()} variant="secondary" />
          {socialBotState.webhookVerifyToken ? <Button label="Copy verify token" loading={false} onClick={() => void copyValue("Webhook verify token", socialBotState.webhookVerifyToken)} variant="secondary" /> : null}
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <ReadOnlyValueCard
            label="Webhook callback URL"
            value={metaWebhookUrl || "Set AUTH_URL, NEXTAUTH_URL, or NEXT_PUBLIC_APP_URL to generate this callback URL."}
            onCopy={metaWebhookUrl ? () => void copyValue("Webhook callback URL", metaWebhookUrl) : undefined}
          />
          <ReadOnlyValueCard
            label="Webhook verify token"
            value={socialBotState.webhookVerifyToken || "Add a webhook verify token, save settings, then paste the same token into Meta."}
            onCopy={socialBotState.webhookVerifyToken ? () => void copyValue("Webhook verify token", socialBotState.webhookVerifyToken) : undefined}
          />
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <MetaChannelCard
            title="Instagram API"
            description="Use Instagram API setup with Instagram Login. Add messaging permissions, connect the Instagram account, configure the webhook callback URL and verify token above, then use the saved account or page identifiers in the customer social-bot workspace."
            checklist={[
              "Set Meta App ID, App Secret, Config ID, and webhook verify token here.",
              "Paste the webhook callback URL and verify token into developers.facebook.com.",
              "Enable Instagram messaging permissions and add the Instagram business account.",
              "Use the connected account ID and access token in the workspace integration card."
            ]}
          />
          <MetaChannelCard
            title="Messenger"
            description="Messenger requires the same webhook endpoint plus a Facebook Page connection. Generate the page access token in Meta, subscribe the page to messaging events, then store the page ID and page access token in the workspace integration card."
            checklist={[
              "Subscribe the app webhook using the callback URL and verify token above.",
              "Generate the Facebook Page access token from the Messenger setup flow.",
              "Add the Page ID in the workspace integration settings.",
              "Use the Page access token as the workspace integration access token."
            ]}
          />
          <MetaChannelCard
            title="WhatsApp Cloud API"
            description="WhatsApp uses the same webhook URL and verify token, plus a phone number ID and permanent access token. After webhook verification, manage phone numbers in Meta and save the phone number ID and permanent token in the workspace integration card."
            checklist={[
              "Verify the webhook in the WhatsApp configuration screen with the callback URL above.",
              "Create or rotate a permanent access token in Meta.",
              "Manage phone numbers and copy the phone number ID into the workspace integration.",
              "Use the permanent token as the workspace integration access token."
            ]}
          />
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          <div className="font-semibold text-slate-950">Meta webhook security</div>
          <p className="mt-2">The webhook endpoint uses the verify token for the Meta subscription challenge and can validate `X-Hub-Signature-256` when a Meta App Secret is saved here. Save the app secret before moving the app into a live production state.</p>
        </div>

        <div className="mt-6">
          <Input
            label="Respond.io Workspace URL"
            value={socialBotState.respondIoWorkspaceUrl}
            onChange={(value) => setSocialBotState((current) => ({ ...current, respondIoWorkspaceUrl: value }))}
          />
          <p className="mt-1.5 text-xs text-slate-500">Paste your full workspace URL (e.g. https://app.respond.io/space/415884). Customers will see direct links to Inbox, Contacts, AI Agents, and Reports.</p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700">Global bot instructions</span>
            <span className="text-xs text-slate-500">Click a template to load it into the editor</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {PROMPT_TEMPLATES.map((tpl) => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => setSocialBotState((current) => ({ ...current, globalBotInstructions: tpl.prompt }))}
                className="group flex flex-col gap-1.5 rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-violet-300 hover:bg-violet-50"
              >
                <span className="text-xs font-semibold text-slate-950 group-hover:text-violet-800">{tpl.label}</span>
                <span className="text-[11px] leading-5 text-slate-500 group-hover:text-violet-600">{tpl.description}</span>
              </button>
            ))}
          </div>
          <textarea
            value={socialBotState.globalBotInstructions}
            onChange={(event) => setSocialBotState((current) => ({ ...current, globalBotInstructions: event.target.value }))}
            rows={12}
            placeholder="Write custom instructions or click a template above to get started..."
            className="min-h-40 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
          />
          {socialBotState.globalBotInstructions.includes("[Company Name]") && (
            <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
              Replace <strong>[Company Name]</strong>, <strong>[Products/Services]</strong>, and <strong>[Timeframe]</strong> with your actual values before saving.
            </div>
          )}
        </div>
      </SettingsCard>}

      {activeTab === "magneticCommerce" && <SettingsCard
        title="Magnetic Commerce"
        description="Configure global Magnetic Commerce rollout behavior including automatic DNS records, storefront/admin targets, and default workspace values."
        action={<Button label="Save Magnetic Commerce config" loading={loadingSection === "magneticCommerce"} onClick={() => saveSection("magneticCommerce", magneticCommerceState)} />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ToggleCard label="Commerce enabled" checked={magneticCommerceState.enabled} onChange={(checked) => setMagneticCommerceState((current) => ({ ...current, enabled: checked }))} />
          <ToggleCard label="Live mode" checked={magneticCommerceState.mode === "live"} onChange={(checked) => setMagneticCommerceState((current) => ({ ...current, mode: checked ? "live" : "manual" }))} />
          <ToggleCard label="Auto-apply DNS" checked={magneticCommerceState.autoApplyDnsOnAssignment} onChange={(checked) => setMagneticCommerceState((current) => ({ ...current, autoApplyDnsOnAssignment: checked }))} />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Input label="Storefront root A record" value={magneticCommerceState.storefrontRootARecord} onChange={(value) => setMagneticCommerceState((current) => ({ ...current, storefrontRootARecord: value }))} />
          <Input label="Storefront www CNAME target" value={magneticCommerceState.storefrontWwwCnameTarget} onChange={(value) => setMagneticCommerceState((current) => ({ ...current, storefrontWwwCnameTarget: value }))} />
          <Input label="Admin CNAME target" value={magneticCommerceState.adminCnameTarget} onChange={(value) => setMagneticCommerceState((current) => ({ ...current, adminCnameTarget: value }))} />
          <Input label="Verification TXT name" value={magneticCommerceState.verificationTxtName} onChange={(value) => setMagneticCommerceState((current) => ({ ...current, verificationTxtName: value }))} />
          <Input label="Verification TXT value" value={magneticCommerceState.verificationTxtValue} onChange={(value) => setMagneticCommerceState((current) => ({ ...current, verificationTxtValue: value }))} />
          <Input label="Admin path" value={magneticCommerceState.adminPath} onChange={(value) => setMagneticCommerceState((current) => ({ ...current, adminPath: value }))} />
          <Input label="Default store currency" value={magneticCommerceState.defaultStoreCurrency} onChange={(value) => setMagneticCommerceState((current) => ({ ...current, defaultStoreCurrency: value.toUpperCase() }))} />
        </div>
        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          <div className="font-semibold text-slate-950">Template placeholders</div>
          <p className="mt-2">Use <span className="font-medium text-slate-950">{"{{domain}}"}</span>, <span className="font-medium text-slate-950">{"{{orderId}}"}</span>, and <span className="font-medium text-slate-950">{"{{customerEmail}}"}</span> inside the verification TXT value.</p>
          <p><span className="font-medium text-slate-950">Manual mode:</span> records are stored inside Magnetic only.</p>
          <p><span className="font-medium text-slate-950">Live mode:</span> DNS changes use the managed-domain registrar integration when the assigned domain is active.</p>
        </div>
      </SettingsCard>}

      {activeTab === "welcomeEmail" && <SettingsCard
        title="Welcome email automation"
        description="Automatically send a branded MagneticICT welcome email the first time a customer account is created."
        action={<Button label="Save welcome email" loading={loadingSection === "welcomeEmail"} onClick={() => saveSection("welcomeEmail", welcomeEmailState)} />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ToggleCard label="Welcome email enabled" checked={welcomeEmailState.enabled} onChange={(checked) => setWelcomeEmailState((current) => ({ ...current, enabled: checked }))} />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Input label="Email subject" value={welcomeEmailState.subject} onChange={(value) => setWelcomeEmailState((current) => ({ ...current, subject: value }))} />
          <Input label="Headline" value={welcomeEmailState.headline} onChange={(value) => setWelcomeEmailState((current) => ({ ...current, headline: value }))} />
          <Input label="CTA label" value={welcomeEmailState.ctaLabel} onChange={(value) => setWelcomeEmailState((current) => ({ ...current, ctaLabel: value }))} />
          <Input label="CTA href" value={welcomeEmailState.ctaHref} onChange={(value) => setWelcomeEmailState((current) => ({ ...current, ctaHref: value }))} />
        </div>
        <div className="mt-6">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-700">Email body</span>
            <textarea
              value={welcomeEmailState.body}
              onChange={(event) => setWelcomeEmailState((current) => ({ ...current, body: event.target.value }))}
              rows={7}
              className="min-h-36 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
            />
          </label>
        </div>
      </SettingsCard>}

      {activeTab === "transactionalEmail" && <SettingsCard
        title="Transactional email provider"
        description="Choose between Mailgun and Brevo as your active transactional email provider. Only the enabled provider is used for delivery. The fallback (Resend/AUTH_EMAIL_FROM) is used when both are unconfigured."
        action={
          <div className="flex flex-wrap gap-3">
            <Button label="Save email config" loading={loadingSection === "transactionalEmail"} onClick={() => saveSection("transactionalEmail", transactionalEmailState)} />
            <Button label="Test active provider" loading={loadingSection === "email-test"} onClick={() => void handleEmailTest()} variant="secondary" />
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleCard label="Transactional email enabled" checked={transactionalEmailState.enabled} onChange={(checked) => setTransactionalEmailState((current) => ({ ...current, enabled: checked }))} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTransactionalEmailState((current) => ({ ...current, activeProvider: "mailgun" }))}
            className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition ${
              transactionalEmailState.activeProvider === "mailgun"
                ? "border-violet-500/40 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                : "border-slate-200/80 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
            }`}
          >
            <Mail className="h-5 w-5 shrink-0" />
            <div>
              <div className="text-[13px] font-semibold">Mailgun</div>
              <div className={`text-[11px] font-medium uppercase tracking-[0.2em] ${
                transactionalEmailState.activeProvider === "mailgun" ? "text-white/70" : "text-slate-400"
              }`}>SMTP / REST API</div>
            </div>
            {transactionalEmailState.activeProvider === "mailgun" && <Check className="ml-auto h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setTransactionalEmailState((current) => ({ ...current, activeProvider: "brevo" }))}
            className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition ${
              transactionalEmailState.activeProvider === "brevo"
                ? "border-violet-500/40 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                : "border-slate-200/80 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
            }`}
          >
            <Mail className="h-5 w-5 shrink-0" />
            <div>
              <div className="text-[13px] font-semibold">Brevo</div>
              <div className={`text-[11px] font-medium uppercase tracking-[0.2em] ${
                transactionalEmailState.activeProvider === "brevo" ? "text-white/70" : "text-slate-400"
              }`}>Sendinblue API v3</div>
            </div>
            {transactionalEmailState.activeProvider === "brevo" && <Check className="ml-auto h-4 w-4" />}
          </button>
        </div>

        {transactionalEmailState.activeProvider === "mailgun" && (
          <div className="mt-6">
            <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Mailgun configuration</div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Input label="Mailgun API base URL" value={transactionalEmailState.apiBaseUrl} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, apiBaseUrl: value }))} />
              <Input label="Mailgun API key" value={transactionalEmailState.apiKey} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, apiKey: value }))} type="password" />
              <Input label="Mailgun domain" value={transactionalEmailState.domain} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, domain: value }))} />
              <Input label="From email" value={transactionalEmailState.fromEmail} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, fromEmail: value }))} />
              <Input label="From name" value={transactionalEmailState.fromName} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, fromName: value }))} />
              <Input label="Reply-to email" value={transactionalEmailState.replyToEmail} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, replyToEmail: value }))} />
              <Input label="Test recipient" value={transactionalEmailState.testRecipient} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, testRecipient: value }))} />
            </div>
          </div>
        )}

        {transactionalEmailState.activeProvider === "brevo" && (
          <div className="mt-6">
            <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Brevo configuration</div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Input label="Brevo API key" value={transactionalEmailState.brevo.apiKey} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, brevo: { ...current.brevo, apiKey: value } }))} type="password" />
              <Input label="From email" value={transactionalEmailState.brevo.fromEmail} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, brevo: { ...current.brevo, fromEmail: value } }))} />
              <Input label="From name" value={transactionalEmailState.brevo.fromName} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, brevo: { ...current.brevo, fromName: value } }))} />
              <Input label="Reply-to email" value={transactionalEmailState.brevo.replyToEmail} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, brevo: { ...current.brevo, replyToEmail: value } }))} />
              <Input label="Test recipient" value={transactionalEmailState.brevo.testRecipient} onChange={(value) => setTransactionalEmailState((current) => ({ ...current, brevo: { ...current.brevo, testRecipient: value } }))} />
            </div>
            <div className="mt-4 rounded-2xl border border-blue-200/60 bg-blue-50/60 px-5 py-4 text-sm text-blue-800">
              Brevo uses the <strong>Transactional Emails API v3</strong> (<code className="font-mono text-xs">https://api.brevo.com/v3/smtp/email</code>). Generate your API key from the Brevo dashboard under <strong>SMTP &amp; API</strong>.
            </div>
          </div>
        )}
      </SettingsCard>}

      {activeTab === "emailNotifications" && <SettingsCard
        title="Email notifications"
        description="Choose which emails are sent automatically. Some events are already wired today, while the rest are saved as live automation policy and will be used as their workflows are connected."
        action={<Button label="Save email notifications" loading={loadingSection === "emailNotifications"} onClick={() => saveSection("emailNotifications", emailNotificationsState)} />}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ToggleCard label="Welcome Email" checked={emailNotificationsState.welcomeEmail} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, welcomeEmail: checked }))} />
          <ToggleCard label="Password Reset" checked={emailNotificationsState.passwordReset} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, passwordReset: checked }))} />
          <ToggleCard label="Newsletter Subscription" checked={emailNotificationsState.newsletterSubscription} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, newsletterSubscription: checked }))} />
          <ToggleCard label="Order Placed" checked={emailNotificationsState.orderPlaced} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, orderPlaced: checked }))} />
          <ToggleCard label="Order Confirmed" checked={emailNotificationsState.orderConfirmed} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, orderConfirmed: checked }))} />
          <ToggleCard label="Order Processing" checked={emailNotificationsState.orderProcessing} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, orderProcessing: checked }))} />
          <ToggleCard label="Order Completed" checked={emailNotificationsState.orderCompleted} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, orderCompleted: checked }))} />
          <ToggleCard label="Order Cancelled" checked={emailNotificationsState.orderCancelled} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, orderCancelled: checked }))} />
          <ToggleCard label="Ticket Created" checked={emailNotificationsState.ticketCreated} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, ticketCreated: checked }))} />
          <ToggleCard label="Ticket Reply" checked={emailNotificationsState.ticketReply} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, ticketReply: checked }))} />
          <ToggleCard label="Ticket Closed" checked={emailNotificationsState.ticketClosed} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, ticketClosed: checked }))} />
          <ToggleCard label="Invoice Generated" checked={emailNotificationsState.invoiceGenerated} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, invoiceGenerated: checked }))} />
          <ToggleCard label="Payment Received" checked={emailNotificationsState.paymentReceived} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, paymentReceived: checked }))} />
          <ToggleCard label="Service Expiring" checked={emailNotificationsState.serviceExpiring} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, serviceExpiring: checked }))} />
          <ToggleCard label="Service Suspended" checked={emailNotificationsState.serviceSuspended} onChange={(checked) => setEmailNotificationsState((current) => ({ ...current, serviceSuspended: checked }))} />
        </div>
      </SettingsCard>}

      {activeTab === "emailLogs" && <SettingsCard
        title="Email logs"
        description="Review recent transactional email activity, including successful sends, skipped notifications, and delivery failures."
        action={<div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">{emailLogs.length} recent logs</div>}
      >
        {emailLogs.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-600">
            Email activity will appear here once transactional or test emails start sending.
          </div>
        ) : (
          <div className="space-y-3">
            {emailLogs.map((log) => (
              <div key={log._id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-950">{log.subject}</div>
                    <div className="mt-1 text-sm text-slate-600">To: {log.to}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                      {log.category.replaceAll("_", " ")} · {log.provider} · {log.notificationKey ?? "manual"}
                    </div>
                  </div>
                  <div className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-semibold uppercase tracking-[0.18em] ${log.status === "sent" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : log.status === "failed" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {log.status}
                  </div>
                </div>
                {log.errorMessage ? <div className="mt-3 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{log.errorMessage}</div> : null}
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(log.createdAt))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>}

      {activeTab === "branding" && <SettingsCard
        title="Branding & Logos"
        description="Upload light and dark logo variants for the Admin panel, Customer portal, and Magnetic Bot chatbot. SVG or PNG recommended. Changes take effect on next page load after uploading."
        action={<span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">Auto-saves on upload</span>}
      >
        <BrandingEditor value={brandingState} onChange={setBrandingState} disabled={false} />
      </SettingsCard>}
    </div>
  );
}

function SettingsCard({
  title,
  description,
  action,
  children
}: {
  title: string;
  description: string;
  action: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[#0d1117]">
      {/* Card header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-white/[0.07] sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
      {/* Card body */}
      <div className="px-6 py-6 sm:px-8 sm:py-7">{children}</div>
    </section>
  );
}

function Button({
  label,
  loading,
  onClick,
  variant = "primary"
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        variant === "primary"
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20 hover:brightness-110"
          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
      }`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {label}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  icon,
  readOnly = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: ReactNode;
  readOnly?: boolean;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</span>
      <span className="flex h-11 items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50 px-4 text-slate-500 transition focus-within:border-violet-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus-within:border-violet-500">
        {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          className="w-full bg-transparent text-[13px] text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
        />
      </span>
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{label}</span>
      <span className="flex h-11 items-center rounded-xl border border-slate-200/80 bg-slate-50 px-4 text-slate-500 transition focus-within:border-violet-400 focus-within:bg-white dark:border-white/[0.08] dark:bg-white/[0.04]">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-[13px] text-slate-950 outline-none dark:text-white">
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

function ReadOnlyValueCard({
  label,
  value,
  onCopy
}: {
  label: string;
  value: string;
  onCopy?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-white/[0.07] dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</div>
          <div className="mt-3 break-all rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-[12px] text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300">{value}</div>
        </div>
        {onCopy ? <Button label="Copy" loading={false} onClick={onCopy} variant="secondary" /> : null}
      </div>
    </div>
  );
}

function MetaChannelCard({
  title,
  description,
  checklist
}: {
  title: string;
  description: string;
  checklist: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 dark:border-white/[0.07] dark:bg-white/[0.03]">
      <div className="text-sm font-bold text-slate-950 dark:text-white">{title}</div>
      <p className="mt-2 text-[13px] leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-4 space-y-2">
        {checklist.map((item, i) => (
          <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-[13px] text-slate-600 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-slate-300">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[9px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">{i + 1}</span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function ToggleCard({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`group rounded-2xl border px-4 py-4 text-left transition ${
        checked
          ? "border-violet-500/40 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
          : "border-slate-200/80 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold">{label}</div>
          <div className={`mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] ${checked ? "text-white/70" : "text-slate-400"}`}>
            {checked ? "Enabled" : "Disabled"}
          </div>
        </div>
        <div className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
          checked ? "bg-white/25" : "bg-slate-200 dark:bg-white/10"
        }`}>
          <div className={`h-4 w-4 rounded-full transition ${
            checked ? "translate-x-4 bg-white shadow-sm" : "translate-x-0 bg-white shadow-sm dark:bg-slate-400"
          }`} />
        </div>
      </div>
    </button>
  );
}
