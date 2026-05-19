"use client";

import { useState } from "react";
import {
  AlertCircle, Bot, CheckCircle2, ChevronDown, ChevronRight,
  ExternalLink, Instagram, Key, Loader2, MessageCircle,
  PlugZap, RefreshCw, Save, Zap, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotIntegration, SocialChannel } from "@/lib/social-bot-types";

type ChannelDef = {
  label: string;
  description: string;
  icon: typeof MessageCircle;
  gradient: string;
  glow: string;
  glowDark: string;
  ring: string;
  btnGradient: string;
  connectedBg: string;
};

const channelMeta: Record<SocialChannel, ChannelDef> = {
  WHATSAPP: {
    label: "WhatsApp",
    description: "Reach customers on the world's most-used messaging app with AI-powered replies.",
    icon: MessageCircle,
    gradient: "from-emerald-400 to-teal-500",
    glow: "rgba(52,211,153,0.18)",
    glowDark: "rgba(52,211,153,0.28)",
    ring: "ring-emerald-500/30",
    btnGradient: "from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-[0_4px_24px_rgba(52,211,153,0.35)]",
    connectedBg: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300"
  },
  INSTAGRAM: {
    label: "Instagram",
    description: "Handle DMs and story replies automatically with your AI brand voice.",
    icon: Instagram,
    gradient: "from-pink-500 via-fuchsia-500 to-violet-500",
    glow: "rgba(236,72,153,0.18)",
    glowDark: "rgba(236,72,153,0.28)",
    ring: "ring-pink-500/30",
    btnGradient: "from-pink-500 via-fuchsia-500 to-violet-500 hover:from-pink-400 hover:via-fuchsia-400 hover:to-violet-400 shadow-[0_4px_24px_rgba(236,72,153,0.35)]",
    connectedBg: "from-pink-500/10 to-violet-500/10 border-pink-500/20 text-pink-600 dark:text-pink-300"
  },
  MESSENGER: {
    label: "Messenger",
    description: "Automate Facebook Page conversations and support threads at scale.",
    icon: Bot,
    gradient: "from-sky-400 to-blue-500",
    glow: "rgba(14,165,233,0.18)",
    glowDark: "rgba(14,165,233,0.28)",
    ring: "ring-sky-500/30",
    btnGradient: "from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 shadow-[0_4px_24px_rgba(14,165,233,0.35)]",
    connectedBg: "from-sky-500/10 to-blue-500/10 border-sky-500/20 text-sky-600 dark:text-sky-300"
  }
};

type FbPage = { id: string; name: string; access_token: string };
type PagePicker = { channel: SocialChannel; pages: FbPage[] };
type ConnectMethod = "oauth" | "manual";

type ManualFields = {
  phoneNumberId: string;
  accessToken: string;
  pageId: string;
};

type Props = { integrations: SocialBotIntegration[]; metaAppId: string; metaConfigId: string; metaMessengerConfigId: string; metaInstagramConfigId: string; oauthCallbackBase?: string };

export function ChatbotConnect({ integrations, metaAppId, metaConfigId, metaMessengerConfigId, metaInstagramConfigId, oauthCallbackBase }: Props) {
  const [list, setList] = useState(integrations);
  const [connecting, setConnecting] = useState<SocialChannel | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [pagePicker, setPagePicker] = useState<PagePicker | null>(null);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [completingPage, setCompletingPage] = useState(false);
  const [disconnecting, setDisconnecting] = useState<SocialChannel | null>(null);
  const [method, setMethod] = useState<Record<SocialChannel, ConnectMethod>>({
    WHATSAPP: "oauth", MESSENGER: "oauth", INSTAGRAM: "oauth"
  });
  const [manualFields, setManualFields] = useState<Record<SocialChannel, ManualFields>>({
    WHATSAPP: { phoneNumberId: "", accessToken: "", pageId: "" },
    MESSENGER: { phoneNumberId: "", accessToken: "", pageId: "" },
    INSTAGRAM: { phoneNumberId: "", accessToken: "", pageId: "" }
  });
  const [saving, setSaving] = useState<SocialChannel | null>(null);

  const metaReady = Boolean(metaAppId.trim());

  function channelReady(channel: SocialChannel) {
    if (!metaAppId.trim()) return false;
    if (channel === "WHATSAPP") return Boolean(metaConfigId.trim());
    return true;
  }

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  }

  function setField(channel: SocialChannel, key: keyof ManualFields, value: string) {
    setManualFields((prev) => ({ ...prev, [channel]: { ...prev[channel], [key]: value } }));
  }

  async function reload() {
    const r = await fetch("/api/social-bot/workspace", { cache: "no-store" });
    if (r.ok) { const ws = await r.json() as { integrations?: SocialBotIntegration[] }; setList(ws.integrations ?? []); }
  }

  function openMetaPopup(channel: SocialChannel): Promise<FbPage[]> {
    return new Promise((resolve, reject) => {
      const base = oauthCallbackBase?.trim() || window.location.origin;
      const callbackUrl = `${base}/api/social-bot/meta/oauth-callback`;
      let fbUrl: string;
      if (channel === "WHATSAPP" && metaConfigId.trim()) {
        const extras = JSON.stringify({ sessionInfoVersion: 2 });
        fbUrl = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${encodeURIComponent(metaAppId)}&config_id=${encodeURIComponent(metaConfigId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&override_default_response_type=true&extras=${encodeURIComponent(extras)}&display=popup&state=${encodeURIComponent(channel)}`;
      } else if (channel === "INSTAGRAM") {
        const scope = "pages_show_list,pages_manage_metadata,pages_read_engagement,pages_messaging,instagram_basic,instagram_manage_messages,instagram_manage_comments";
        fbUrl = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${encodeURIComponent(metaAppId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${encodeURIComponent(scope)}&display=popup&state=${encodeURIComponent(channel)}`;
      } else {
        const scope = "pages_show_list,pages_manage_metadata,pages_read_engagement,pages_messaging";
        fbUrl = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${encodeURIComponent(metaAppId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${encodeURIComponent(scope)}&display=popup&state=${encodeURIComponent(channel)}`;
      }
      const popup = window.open(fbUrl, "fb-signup", "width=620,height=700,scrollbars=yes,resizable=yes");
      if (!popup) { reject(new Error("Popup blocked. Allow popups for this site and try again.")); return; }
      let settled = false;
      function settle(ok: boolean, pages: FbPage[], error?: string) {
        if (settled) return; settled = true;
        window.removeEventListener("message", onMessage); clearInterval(pollTimer);
        ok ? resolve(pages) : reject(new Error(error ?? "Connection cancelled."));
      }
      function onMessage(ev: MessageEvent) {
        const d = ev.data as { type?: string; ok?: boolean; error?: string | null; pages?: FbPage[] };
        if (d?.type === "fb-connect") settle(d.ok === true, d.pages ?? [], d.error ?? undefined);
      }
      const pollTimer = setInterval(() => { if (popup.closed) settle(false, []); }, 500);
      window.addEventListener("message", onMessage);
    });
  }

  async function completePage() {
    if (!pagePicker) return;
    const page = pagePicker.pages.find((p) => p.id === selectedPageId) ?? pagePicker.pages[0];
    if (!page) return;
    setCompletingPage(true);
    try {
      const igId = (page as unknown as { ig_id?: string }).ig_id ?? "";
      await fetch("/api/social-bot/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: pagePicker.channel, enabled: true, label: page.name, pageId: page.id, phoneNumberId: "", accountId: pagePicker.channel === "INSTAGRAM" ? igId : "", accessToken: page.access_token })
      });
      await fetch("/api/social-bot/meta/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId: page.id, channel: pagePicker.channel }) }).catch(() => {});
      await reload();
      showToast("ok", `${page.name} connected — messages will appear in your Inbox.`);
      setPagePicker(null);
    } catch { showToast("err", "Failed to complete connection."); }
    finally { setCompletingPage(false); }
  }

  async function saveManual(integration: SocialBotIntegration) {
    const ch = integration.channel;
    const f = manualFields[ch];
    const token = f.accessToken.trim();
    if (!token) { showToast("err", "Access Token is required."); return; }
    if (ch === "WHATSAPP" && !f.phoneNumberId.trim()) { showToast("err", "Phone Number ID is required for WhatsApp."); return; }
    if ((ch === "MESSENGER" || ch === "INSTAGRAM") && !f.pageId.trim()) { showToast("err", "Page ID is required."); return; }
    setSaving(ch);
    try {
      await fetch("/api/social-bot/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: ch,
          enabled: true,
          label: integration.label || (ch === "WHATSAPP" ? `WA ${f.phoneNumberId}` : `Page ${f.pageId}`),
          pageId: ch === "WHATSAPP" ? "" : f.pageId.trim(),
          phoneNumberId: ch === "WHATSAPP" ? f.phoneNumberId.trim() : "",
          accountId: "",
          accessToken: token
        })
      });
      if (ch !== "WHATSAPP") {
        await fetch("/api/social-bot/meta/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId: f.pageId.trim(), channel: ch }) }).catch(() => {});
      }
      await reload();
      showToast("ok", `${channelMeta[ch].label} connected via manual setup.`);
    } catch (e) { showToast("err", e instanceof Error ? e.message : "Save failed."); }
    finally { setSaving(null); }
  }

  async function resubscribe(integration: SocialBotIntegration) {
    if (!integration.pageId) { showToast("err", "No Page ID stored. Reconnect first."); return; }
    try {
      const res = await fetch("/api/social-bot/meta/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pageId: integration.pageId }) });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) showToast("err", data.error ?? "Subscription failed.");
      else showToast("ok", "Webhook re-subscribed — messages will now appear in your Inbox.");
    } catch { showToast("err", "Subscribe request failed."); }
  }

  async function disconnect(channel: SocialChannel) {
    setDisconnecting(channel);
    try {
      await fetch("/api/social-bot/integrations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel }) });
      await reload();
      showToast("ok", `${channelMeta[channel].label} disconnected.`);
    } catch { showToast("err", "Disconnect failed."); }
    finally { setDisconnecting(null); }
  }

  async function connectOAuth(integration: SocialBotIntegration) {
    setConnecting(integration.channel);
    try {
      const pages = await openMetaPopup(integration.channel);
      if (integration.channel === "MESSENGER" || integration.channel === "INSTAGRAM") {
        setPagePicker({ channel: integration.channel, pages });
        setSelectedPageId(pages[0]?.id ?? "");
        setConnecting(null);
        return;
      }
      await fetch("/api/social-bot/integrations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel: integration.channel, enabled: true, label: integration.label, pageId: "", phoneNumberId: "", accountId: "", accessToken: "" }) });
      await reload();
      showToast("ok", `${channelMeta[integration.channel].label} connected via Meta login.`);
    } catch (e) { showToast("err", e instanceof Error ? e.message : "Connection failed."); }
    finally { setConnecting(null); }
  }

  const inputCls = "w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] px-3.5 py-2.5 text-sm text-gray-800 dark:text-white/80 placeholder:text-gray-400 dark:placeholder:text-white/20 outline-none focus:border-violet-400 dark:focus:border-violet-500/50 transition font-mono";

  return (
    <div className="min-h-full">

      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0f] px-6 pb-6 pt-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(124,58,237,0.06),transparent)]" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300 mb-2.5">
              <Zap className="h-2.5 w-2.5" />
              Channels
            </div>
            <h1 className="text-[1.5rem] font-bold tracking-tight text-gray-950 dark:text-white">Connect Channels</h1>
            <p className="mt-1 text-[13px] text-gray-400 dark:text-white/30 max-w-lg">
              Link WhatsApp, Messenger, or Instagram to your AI bot. Use the guided Meta login or enter credentials manually.
            </p>
          </div>
          <button type="button" onClick={() => void reload()} className="shrink-0 flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-500 dark:text-white/35 transition hover:text-gray-800 dark:hover:text-white/60">
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </button>
        </div>

        {toast && (
          <div className={cn("mt-4 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium",
            toast.type === "ok"
              ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
          )}>
            {toast.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {toast.msg}
          </div>
        )}

        {!metaReady && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Meta App ID is not configured. Contact your admin to finish setup.
          </div>
        )}
      </div>

      {/* Channel list */}
      <div className="px-6 py-5 space-y-4">
        {list.map((integration) => {
          const m = channelMeta[integration.channel];
          const Icon = m.icon;
          const isConnected = integration.status === "CONNECTED";
          const isPending = integration.status === "PENDING";
          const isLoadingOAuth = connecting === integration.channel;
          const isSaving = saving === integration.channel;
          const curMethod = method[integration.channel];
          const f = manualFields[integration.channel];

          return (
            <div key={integration._id} className={cn(
              "rounded-[20px] border bg-white dark:bg-white/[0.025] overflow-hidden transition-all",
              isConnected
                ? "border-emerald-200 dark:border-emerald-500/20"
                : "border-gray-200/80 dark:border-white/[0.07]"
            )}>
              {/* Card header */}
              <div className="flex items-center gap-4 px-5 py-4">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md", m.gradient)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[15px] text-gray-950 dark:text-white">{m.label}</p>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      isConnected ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : isPending ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        : "bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/30"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : isPending ? "bg-amber-500" : "bg-gray-400 dark:bg-white/20")} />
                      {isConnected ? "Live" : isPending ? "Pending" : "Not connected"}
                    </span>
                  </div>
                  {integration.label ? (
                    <p className="mt-0.5 text-[12px] text-gray-400 dark:text-white/25 truncate">{integration.label}</p>
                  ) : (
                    <p className="mt-0.5 text-[12px] text-gray-400 dark:text-white/20 truncate">{m.description}</p>
                  )}
                </div>
                {isConnected && (
                  <button
                    type="button"
                    onClick={() => void disconnect(integration.channel)}
                    disabled={disconnecting === integration.channel}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-40"
                  >
                    {disconnecting === integration.channel ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlugZap className="h-3 w-3" />}
                    Disconnect
                  </button>
                )}
              </div>

              {/* Connected actions bar */}
              {isConnected && (
                <div className="border-t border-gray-100 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.015] px-5 py-3 flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-[12px] text-gray-500 dark:text-white/30 flex-1">Channel is live. Incoming messages are routed to your Inbox.</p>
                  {(integration.channel === "MESSENGER" || integration.channel === "INSTAGRAM") && (
                    <button type="button" onClick={() => void resubscribe(integration)} className="flex items-center gap-1.5 rounded-lg border border-sky-200 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400 transition hover:bg-sky-100 dark:hover:bg-sky-500/20">
                      <RefreshCw className="h-3 w-3" />Re-subscribe webhook
                    </button>
                  )}
                </div>
              )}

              {/* Connection panel — only when not connected */}
              {!isConnected && (
                <div className="border-t border-gray-100 dark:border-white/[0.05]">

                  {/* Method tabs */}
                  <div className="flex border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.01]">
                    {(["oauth", "manual"] as ConnectMethod[]).map((m2) => (
                      <button
                        key={m2}
                        type="button"
                        onClick={() => setMethod((prev) => ({ ...prev, [integration.channel]: m2 }))}
                        className={cn(
                          "flex items-center gap-1.5 px-5 py-3 text-[12px] font-semibold border-b-2 transition",
                          curMethod === m2
                            ? "border-violet-500 text-violet-600 dark:text-violet-400"
                            : "border-transparent text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/50"
                        )}
                      >
                        {m2 === "oauth" ? <><Zap className="h-3 w-3" />Guided Login</> : <><Key className="h-3 w-3" />Manual Setup</>}
                      </button>
                    ))}
                  </div>

                  {/* OAuth panel */}
                  {curMethod === "oauth" && (
                    <div className="px-5 py-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-1">
                          <p className="text-[13px] font-semibold text-gray-800 dark:text-white/70">Connect with Meta Business Login</p>
                          <p className="text-[12px] text-gray-400 dark:text-white/25 leading-relaxed">
                            {integration.channel === "WHATSAPP"
                              ? "A secure Meta popup will guide you through linking your WhatsApp Business account. No tokens to copy."
                              : integration.channel === "MESSENGER"
                              ? "Log in with Facebook and select the Page to connect. Messenger DMs will automatically route to your Inbox."
                              : "Log in with Facebook and link your Instagram Professional account. Story replies and DMs will appear in your Inbox."}
                          </p>
                        </div>
                        <a
                          href={integration.channel === "WHATSAPP"
                            ? "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                            : "https://developers.facebook.com/docs/messenger-platform/get-started"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 flex items-center gap-1 text-[11px] text-violet-500 dark:text-violet-400 hover:underline"
                        >
                          Docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      {/* Steps */}
                      <div className="space-y-2">
                        {[
                          integration.channel === "WHATSAPP"
                            ? "Click Connect — a Meta popup opens"
                            : "Click Connect — a Facebook login popup opens",
                          integration.channel === "WHATSAPP"
                            ? "Follow the embedded signup: select your WABA and phone number"
                            : "Approve permissions and select your Facebook Page",
                          "Done! Messages start arriving in your Inbox automatically."
                        ].map((step, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-500/15 text-[9px] font-bold text-violet-600 dark:text-violet-400">{i + 1}</span>
                            <p className="text-[12px] text-gray-500 dark:text-white/30">{step}</p>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={!channelReady(integration.channel) || isLoadingOAuth}
                        onClick={() => void connectOAuth(integration)}
                        className={cn(
                          "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
                          m.btnGradient
                        )}
                      >
                        {isLoadingOAuth
                          ? <><Loader2 className="h-4 w-4 animate-spin" />Connecting…</>
                          : <><ChevronRight className="h-4 w-4" />{isPending ? "Continue setup" : `Connect ${m.label}`}</>}
                      </button>

                      {!channelReady(integration.channel) && (
                        <p className="text-center text-[11px] text-amber-500">
                          {integration.channel === "WHATSAPP" ? "WhatsApp Config ID not set in admin settings." : "Meta App ID not set in admin settings."}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Manual panel */}
                  {curMethod === "manual" && (
                    <div className="px-5 py-5 space-y-4">
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800 dark:text-white/70 mb-1">Enter credentials manually</p>
                        <p className="text-[12px] text-gray-400 dark:text-white/25 leading-relaxed">
                          {integration.channel === "WHATSAPP"
                            ? "Get your Phone Number ID and System User Access Token from Meta Developer Console → WhatsApp → API Setup."
                            : "Get your Page ID and a Page Access Token from Meta Developer Console → your app → Messenger / Instagram → Generate Token."}
                        </p>
                      </div>

                      {integration.channel === "WHATSAPP" ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/35 mb-1.5">Phone Number ID</label>
                            <input type="text" value={f.phoneNumberId} onChange={(e) => setField(integration.channel, "phoneNumberId", e.target.value)} placeholder="1234567890123456" className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/35 mb-1.5">System User Access Token</label>
                            <input type="password" value={f.accessToken} onChange={(e) => setField(integration.channel, "accessToken", e.target.value)} placeholder="EAAHt…" className={inputCls} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/35 mb-1.5">Facebook Page ID</label>
                            <input type="text" value={f.pageId} onChange={(e) => setField(integration.channel, "pageId", e.target.value)} placeholder="1234567890" className={inputCls} />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/35 mb-1.5">Page Access Token</label>
                            <input type="password" value={f.accessToken} onChange={(e) => setField(integration.channel, "accessToken", e.target.value)} placeholder="EAAHt…" className={inputCls} />
                          </div>
                          {integration.channel === "INSTAGRAM" && (
                            <div className="flex items-start gap-2 rounded-xl border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 px-3 py-2.5">
                              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-violet-500 dark:text-violet-400" />
                              <p className="text-[11px] text-violet-600 dark:text-violet-300">Use a <strong>Page</strong> Access Token (from the Facebook Page connected to your Instagram Professional account), not an Instagram token directly.</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <a
                          href={integration.channel === "WHATSAPP"
                            ? "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started#phone-number"
                            : "https://developers.facebook.com/docs/pages/access-tokens"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-violet-500 dark:text-violet-400 hover:underline"
                        >
                          Where do I find these? <ExternalLink className="h-3 w-3" />
                        </a>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void saveManual(integration)}
                          className="ml-auto flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white/[0.10] hover:bg-violet-700 dark:hover:bg-white/[0.18] px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          {isSaving ? "Saving…" : "Save & Connect"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Page picker modal */}
      {pagePicker && (() => {
        const pm = channelMeta[pagePicker.channel];
        const PIcon = pm.icon;
        const hasPages = pagePicker.pages.length > 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setPagePicker(null)} />
            <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.10] bg-[#0c0c1e] shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${pm.gradient} shadow-lg`}>
                  <PIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">Select Facebook Page</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{hasPages ? `${pagePicker.pages.length} page(s) found` : "No pages found"}</p>
                </div>
                <button type="button" onClick={() => setPagePicker(null)} className="rounded-lg p-1.5 text-white/30 hover:bg-white/[0.06] hover:text-white/60"><X className="h-4 w-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                {hasPages ? (
                  <div className="space-y-2">
                    {pagePicker.pages.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPageId(p.id)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                          selectedPageId === p.id
                            ? "border-violet-500/40 bg-violet-500/10"
                            : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07]"
                        )}
                      >
                        <div className={cn("h-2 w-2 rounded-full shrink-0", selectedPageId === p.id ? "bg-violet-400" : "bg-white/20")} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{p.name}</p>
                          <p className="text-[11px] text-white/30 truncate">{p.id}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300 space-y-2">
                    <p className="font-semibold">No Facebook Pages found</p>
                    <p className="text-rose-400/70 text-[12px]">Make sure your account manages at least one Page, then try again. Or use Manual Setup to enter your Page ID and token directly.</p>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button type="button" onClick={() => setPagePicker(null)} className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/40 hover:bg-white/[0.07] hover:text-white/70 transition">Cancel</button>
                  {hasPages && (
                    <button
                      type="button"
                      onClick={() => void completePage()}
                      disabled={completingPage || !selectedPageId}
                      className={`flex items-center gap-2 rounded-xl bg-gradient-to-r ${pm.btnGradient} px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 transition`}
                    >
                      {completingPage && <Loader2 className="h-4 w-4 animate-spin" />}
                      Connect Page
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
