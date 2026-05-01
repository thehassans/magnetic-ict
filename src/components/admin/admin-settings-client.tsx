"use client";

import { type ReactNode, useMemo, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { HostingConfigEditor } from "@/components/admin/hosting-config-editor";
import type { DomainProviderSettings } from "@/lib/domain-types";
import type { HostingProviderSettings } from "@/lib/hosting-types";
import type { ActiveLanguage } from "@/types/i18n";
import type {
  FooterSettings,
  GeminiSettings,
  OAuthSettings,
  PaymentIntegrationsSettings,
  SocialBotSettings,
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
  welcomeEmailConfig: WelcomeEmailSettings;
  domainProviderConfig: DomainProviderSettings;
  hostingProviderConfig: HostingProviderSettings;
  appBaseUrl: string;
  canPersist: boolean;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

const settingsSectionLabel: Record<"languages" | "footer" | "payments" | "oauth" | "gemini" | "socialBot" | "welcomeEmail" | "domain" | "hosting", string> = {
  languages: "Language",
  footer: "Footer",
  payments: "Payment",
  oauth: "OAuth",
  gemini: "Gemini",
  socialBot: "Social Bot",
  welcomeEmail: "Welcome email",
  domain: "Domain",
  hosting: "Hosting"
};

function createVerifyToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function AdminSettingsClient({
  activeLanguages,
  availableLanguages,
  footerDetails,
  paymentIntegrations,
  oauthConfig,
  geminiConfig,
  socialBotConfig,
  welcomeEmailConfig,
  domainProviderConfig,
  hostingProviderConfig,
  appBaseUrl,
  canPersist
}: AdminSettingsClientProps) {
  const [selectedLanguageCodes, setSelectedLanguageCodes] = useState(activeLanguages.map((language) => language.code));
  const [footerState, setFooterState] = useState(footerDetails);
  const [paymentState, setPaymentState] = useState(paymentIntegrations);
  const [oauthState, setOAuthState] = useState(oauthConfig);
  const [geminiState, setGeminiState] = useState(geminiConfig);
  const [socialBotState, setSocialBotState] = useState(socialBotConfig);
  const [welcomeEmailState, setWelcomeEmailState] = useState(welcomeEmailConfig);
  const [domainState, setDomainState] = useState(domainProviderConfig);
  const [hostingState, setHostingState] = useState(hostingProviderConfig);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const selectedLanguages = useMemo(
    () => availableLanguages.filter((language) => selectedLanguageCodes.includes(language.code)),
    [availableLanguages, selectedLanguageCodes]
  );
  const metaWebhookUrl = useMemo(() => (appBaseUrl ? `${appBaseUrl}/api/social-bot/meta/webhook` : ""), [appBaseUrl]);

  async function saveSection(section: "languages" | "footer" | "payments" | "oauth" | "gemini" | "socialBot" | "welcomeEmail" | "domain" | "hosting", value: unknown) {
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
    <div className="space-y-6">
      {toast ? (
        <div className={`fixed right-6 top-6 z-[120] max-w-sm rounded-[24px] border px-5 py-4 text-sm shadow-[0_24px_80px_rgba(15,23,42,0.14)] ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          {toast.message}
        </div>
      ) : null}

      {!canPersist ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          DATABASE_URL is not configured, so these forms are preview-only locally.
        </div>
      ) : null}

      <SettingsCard
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
                className={`flex items-center justify-between rounded-[22px] border px-4 py-4 text-left transition ${checked ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"}`}
              >
                <div>
                  <div className="font-semibold">{language.label}</div>
                  <div className={`mt-1 text-xs uppercase tracking-[0.24em] ${checked ? "text-white/70" : "text-slate-500"}`}>{language.code}</div>
                </div>
                {checked ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard
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
      </SettingsCard>

      <SettingsCard
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
      </SettingsCard>

      <SettingsCard
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
      </SettingsCard>

      <SettingsCard
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
      </SettingsCard>

      <SettingsCard
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
          <Input label=".com yearly price" value={String(domainState.comPrice)} onChange={(value) => setDomainState((current) => ({ ...current, comPrice: Number(value) || 0 }))} type="number" />
          <Input label=".net yearly price" value={String(domainState.netPrice)} onChange={(value) => setDomainState((current) => ({ ...current, netPrice: Number(value) || 0 }))} type="number" />
          <Input label=".org yearly price" value={String(domainState.orgPrice)} onChange={(value) => setDomainState((current) => ({ ...current, orgPrice: Number(value) || 0 }))} type="number" />
          <Input label=".io yearly price" value={String(domainState.ioPrice)} onChange={(value) => setDomainState((current) => ({ ...current, ioPrice: Number(value) || 0 }))} type="number" />
          <Input label="Fallback yearly price" value={String(domainState.defaultPrice)} onChange={(value) => setDomainState((current) => ({ ...current, defaultPrice: Number(value) || 0 }))} type="number" />
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
      </SettingsCard>

      <SettingsCard
        title="Magnetic VPS Hosting provider"
        description="Configure the IONOS-backed reseller and cloud settings used by Magnetic VPS Hosting fulfillment. Manual mode keeps provisioning records internal without calling IONOS. Live mode enables direct API-backed contract and infrastructure orchestration."
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
        </div>
        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          <div className="font-semibold text-slate-950">Provisioning mode</div>
          <p className="mt-2">
            <span className="font-medium text-slate-950">Manual:</span> store provisioning requests and operator references inside Magnetic only.
          </p>
          <p>
            <span className="font-medium text-slate-950">Live:</span> call the IONOS reseller API for contracts/admins and the cloud API for data center and server provisioning during fulfillment.
          </p>
        </div>
        <HostingConfigEditor value={hostingState} onChange={setHostingState} />
      </SettingsCard>

      <SettingsCard
        title="Magnetic Social Bot"
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
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-700">Global bot instructions</span>
            <textarea
              value={socialBotState.globalBotInstructions}
              onChange={(event) => setSocialBotState((current) => ({ ...current, globalBotInstructions: event.target.value }))}
              rows={8}
              className="min-h-40 w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
            />
          </label>
        </div>
      </SettingsCard>

      <SettingsCard
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
      </SettingsCard>
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
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
      <div className="mt-6">{children}</div>
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
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variant === "primary" ? "bg-slate-950 text-white hover:bg-slate-800" : "border border-slate-200 bg-slate-50 text-slate-950 hover:bg-slate-100"}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  icon
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: ReactNode;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className="flex h-12 items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-slate-700 focus-within:border-slate-950 focus-within:bg-white">
        {icon}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
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
    <label className="space-y-2 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <span className="flex h-12 items-center rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-slate-700 focus-within:border-slate-950 focus-within:bg-white">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm text-slate-950 outline-none">
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
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-950">{label}</div>
          <div className="mt-3 break-all rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{value}</div>
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
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="font-semibold text-slate-950">{title}</div>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-4 space-y-2">
        {checklist.map((item) => (
          <div key={item} className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
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
      className={`rounded-[24px] border px-4 py-5 text-left transition ${checked ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold">{label}</div>
          <div className={`mt-1 text-xs uppercase tracking-[0.22em] ${checked ? "text-white/70" : "text-slate-500"}`}>{checked ? "Enabled" : "Disabled"}</div>
        </div>
        <div className={`flex h-6 w-11 items-center rounded-full p-1 transition ${checked ? "bg-white/20" : "bg-slate-200"}`}>
          <div className={`h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-0"}`} />
        </div>
      </div>
    </button>
  );
}
