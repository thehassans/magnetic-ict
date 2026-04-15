"use client";

import { type ReactNode, useMemo, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
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
  canPersist: boolean;
};

type ToastState = {
  type: "success" | "error";
  message: string;
} | null;

export function AdminSettingsClient({
  activeLanguages,
  availableLanguages,
  footerDetails,
  paymentIntegrations,
  oauthConfig,
  geminiConfig,
  socialBotConfig,
  welcomeEmailConfig,
  canPersist
}: AdminSettingsClientProps) {
  const [selectedLanguageCodes, setSelectedLanguageCodes] = useState(activeLanguages.map((language) => language.code));
  const [footerState, setFooterState] = useState(footerDetails);
  const [paymentState, setPaymentState] = useState(paymentIntegrations);
  const [oauthState, setOAuthState] = useState(oauthConfig);
  const [geminiState, setGeminiState] = useState(geminiConfig);
  const [socialBotState, setSocialBotState] = useState(socialBotConfig);
  const [welcomeEmailState, setWelcomeEmailState] = useState(welcomeEmailConfig);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const selectedLanguages = useMemo(
    () => availableLanguages.filter((language) => selectedLanguageCodes.includes(language.code)),
    [availableLanguages, selectedLanguageCodes]
  );

  async function saveSection(section: "languages" | "footer" | "payments" | "oauth" | "gemini" | "socialBot" | "welcomeEmail", value: unknown) {
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

    setToast({ type: "success", message: `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved.` });
    setLoadingSection(null);
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
        title="Magnetic Social Bot"
        description="Set the global instructions used by the bot, plus Meta embedded-signup values for WhatsApp, Instagram, and Messenger onboarding."
        action={<Button label="Save Social Bot config" loading={loadingSection === "socialBot"} onClick={() => saveSection("socialBot", socialBotState)} />}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Input label="Meta App ID" value={socialBotState.metaAppId} onChange={(value) => setSocialBotState((current) => ({ ...current, metaAppId: value }))} />
          <Input label="Meta Config ID" value={socialBotState.metaConfigId} onChange={(value) => setSocialBotState((current) => ({ ...current, metaConfigId: value }))} />
          <Input label="Webhook verify token" value={socialBotState.webhookVerifyToken} onChange={(value) => setSocialBotState((current) => ({ ...current, webhookVerifyToken: value }))} type="password" />
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
