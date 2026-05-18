"use client";

import { useState } from "react";
import { Bot, CheckCircle2, ChevronDown, Instagram, Key, Loader2, MessageCircle, PlugZap, RefreshCw, Save, ShieldCheck, X, Zap } from "lucide-react";
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

const steps = [
  { n: "01", title: "Choose a channel", body: "Select WhatsApp, Instagram, or Messenger to begin the guided Meta business login." },
  { n: "02", title: "Approve access", body: "Meta's secure popup walks you through granting only the permissions your AI bot needs." },
  { n: "03", title: "Go live", body: "Our team maps your number or page and your AI bot is live — no tokens to copy." }
];

type FbPage = { id: string; name: string; access_token: string };
type PagePicker = { channel: SocialChannel; pages: FbPage[] };

type Props = { integrations: SocialBotIntegration[]; metaAppId: string; metaConfigId: string; metaMessengerConfigId: string; metaInstagramConfigId: string; oauthCallbackBase?: string };

export function ChatbotConnect({ integrations, metaAppId, metaConfigId, metaMessengerConfigId, metaInstagramConfigId, oauthCallbackBase }: Props) {
  const [list, setList] = useState(integrations);
  const [connecting, setConnecting] = useState<SocialChannel | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [tokenDrafts, setTokenDrafts] = useState<Record<string, string>>(
    Object.fromEntries(integrations.map((i) => [i._id, ""]))
  );
  const [savingToken, setSavingToken] = useState<string | null>(null);
  const [pagePicker, setPagePicker] = useState<PagePicker | null>(null);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [completingPage, setCompletingPage] = useState(false);
  const [disconnecting, setDisconnecting] = useState<SocialChannel | null>(null);
  const [manualOpen, setManualOpen] = useState<SocialChannel | null>(null);

  // WhatsApp needs config_id too; Instagram/Messenger only need the app ID
  function channelReady(channel: SocialChannel) {
    if (!metaAppId.trim()) return false;
    if (channel === "WHATSAPP") return Boolean(metaConfigId.trim());
    return true;
  }
  const metaReady = Boolean(metaAppId.trim());

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
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
        fbUrl =
          `https://www.facebook.com/v25.0/dialog/oauth` +
          `?client_id=${encodeURIComponent(metaAppId)}` +
          `&config_id=${encodeURIComponent(metaConfigId)}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&response_type=code` +
          `&override_default_response_type=true` +
          `&extras=${encodeURIComponent(extras)}` +
          `&display=popup` +
          `&state=${encodeURIComponent(channel)}`;
      } else if (channel === "INSTAGRAM") {
        const scope = "pages_show_list,pages_manage_metadata,pages_read_engagement,pages_messaging,instagram_basic,instagram_manage_messages,instagram_manage_comments";
        fbUrl =
          `https://www.facebook.com/v25.0/dialog/oauth` +
          `?client_id=${encodeURIComponent(metaAppId)}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scope)}` +
          `&display=popup` +
          `&state=${encodeURIComponent(channel)}`;
      } else {
        // Messenger
        const scope = "pages_show_list,pages_manage_metadata,pages_read_engagement,pages_messaging";
        fbUrl =
          `https://www.facebook.com/v25.0/dialog/oauth` +
          `?client_id=${encodeURIComponent(metaAppId)}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scope)}` +
          `&display=popup` +
          `&state=${encodeURIComponent(channel)}`;
      }

      const popup = window.open(fbUrl, "fb-signup", "width=620,height=700,scrollbars=yes,resizable=yes");
      if (!popup) {
        reject(new Error("Popup was blocked. Allow popups for this site and try again."));
        return;
      }

      let settled = false;
      function settle(ok: boolean, pages: FbPage[], error?: string) {
        if (settled) return;
        settled = true;
        window.removeEventListener("message", onMessage);
        clearInterval(pollTimer);
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
      // For Instagram, ig_id is passed back from oauth-callback as extra field
      const igId = (page as unknown as { ig_id?: string }).ig_id ?? "";
      await fetch("/api/social-bot/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: pagePicker.channel,
          enabled: true,
          label: page.name,
          pageId: page.id,
          phoneNumberId: "",
          accountId: pagePicker.channel === "INSTAGRAM" ? igId : "",
          accessToken: page.access_token
        })
      });
      // Subscribe page to webhook
      await fetch("/api/social-bot/meta/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: page.id, channel: pagePicker.channel })
      }).catch(() => { /* non-fatal */ });
      await reload();
      const igNote = pagePicker.channel === "INSTAGRAM" && igId ? ` (IG Account: ${igId})` : "";
      showToast("ok", `${page.name}${igNote} connected — messages will appear in your Inbox.`);
      setPagePicker(null);
    } catch {
      showToast("err", "Failed to complete connection.");
    } finally {
      setCompletingPage(false);
    }
  }

  async function saveToken(integration: SocialBotIntegration) {
    const token = (tokenDrafts[integration._id] ?? "").trim();
    if (!token) { showToast("err", "Paste the Page Access Token first."); return; }
    setSavingToken(integration._id);
    try {
      const res = await fetch("/api/social-bot/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: integration.channel, enabled: integration.status !== "DISCONNECTED", label: integration.label, pageId: integration.pageId, phoneNumberId: integration.phoneNumberId, accountId: integration.accountId, accessToken: token })
      });
      if (!res.ok) throw new Error("Save failed.");
      await reload();
      showToast("ok", `${integration.channel} page token saved.`);
      // Auto-subscribe page to webhook after manual token save
      await fetch("/api/social-bot/meta/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: integration.channel, pageId: integration.pageId })
      }).catch(() => { /* non-fatal */ });
    } catch (e) {
      showToast("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSavingToken(null);
    }
  }

  async function resubscribe(integration: SocialBotIntegration) {
    if (!integration.pageId) { showToast("err", "No Page ID stored. Please reconnect."); return; }
    try {
      const res = await fetch("/api/social-bot/meta/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: integration.pageId })
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) showToast("err", data.error ?? "Subscription failed.");
      else showToast("ok", "Webhook subscribed — messages will now appear in your Inbox.");
    } catch { showToast("err", "Subscribe request failed."); }
  }

  async function disconnect(channel: SocialChannel) {
    setDisconnecting(channel);
    try {
      await fetch("/api/social-bot/integrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel })
      });
      await reload();
      showToast("ok", `${channelMeta[channel].label} disconnected.`);
    } catch {
      showToast("err", "Disconnect failed.");
    } finally {
      setDisconnecting(null);
    }
  }

  async function connect(integration: SocialBotIntegration) {
    setConnecting(integration.channel);
    try {
      const pages = await openMetaPopup(integration.channel);
      // Messenger and Instagram both require selecting a Facebook Page
      if (integration.channel === "MESSENGER" || integration.channel === "INSTAGRAM") {
        setPagePicker({ channel: integration.channel, pages });
        setSelectedPageId(pages[0]?.id ?? "");
        setConnecting(null);
        return;
      }
      // WhatsApp: no page picker needed
      await fetch("/api/social-bot/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: integration.channel, enabled: true, label: integration.label, pageId: integration.pageId, phoneNumberId: integration.phoneNumberId, accountId: integration.accountId, accessToken: "" })
      });
      await reload();
      showToast("ok", `${channelMeta[integration.channel].label} connected.`);
    } catch (e) {
      showToast("err", e instanceof Error ? e.message : "Connection failed.");
    } finally {
      setConnecting(null);
    }
  }

  return (
    <div className="min-h-full">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0f] px-6 pb-8 pt-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.07),transparent)]" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300 mb-3">
              <Zap className="h-3 w-3" />
              Meta Business
            </div>
            <h1 className="text-[1.6rem] font-bold tracking-tight text-gray-950 dark:text-white">Connect Channels</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-white/35 max-w-md">
              Link your messaging channels in seconds with Meta&#39;s secure guided flow — no API keys required.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-500 dark:text-white/40 transition hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-700 dark:hover:text-white/70"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {toast && (
          <div className={cn(
            "relative mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium",
            toast.type === "ok"
              ? "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
          )}>
            {toast.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <ShieldCheck className="h-4 w-4 shrink-0" />}
            {toast.msg}
          </div>
        )}

        {!metaReady && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Meta connect is not configured yet. Contact support to complete setup.
          </div>
        )}
      </div>

      {/* ── Channel cards ────────────────────────────────────────────────── */}
      <div className="px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {list.map((integration) => {
            const m = channelMeta[integration.channel];
            const Icon = m.icon;
            const isConnected = integration.status === "CONNECTED";
            const isPending = integration.status === "PENDING";
            const isLoading = connecting === integration.channel;

            return (
              <div
                key={integration._id}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[22px] border bg-white dark:bg-white/[0.025] p-6 transition-all duration-300",
                  isConnected
                    ? "border-emerald-200 dark:border-emerald-500/20 shadow-[0_0_0_1px_rgba(52,211,153,0.08),0_4px_24px_rgba(52,211,153,0.08)]"
                    : "border-gray-200/80 dark:border-white/[0.07] hover:border-gray-300 dark:hover:border-white/[0.12] hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                )}
              >
                {/* ambient glow */}
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                  style={{ background: m.glowDark }}
                />
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl opacity-60 dark:opacity-0"
                  style={{ background: m.glow }}
                />

                {/* icon + status */}
                <div className="flex items-start justify-between gap-3">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", m.gradient)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                    isConnected
                      ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : isPending
                        ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : "bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/35"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : isPending ? "bg-amber-500" : "bg-gray-400 dark:bg-white/25")} />
                    {isConnected ? "Live" : isPending ? "Pending" : "Off"}
                  </div>
                </div>

                {/* label + description */}
                <div className="mt-5 flex-1">
                  <h3 className="text-base font-bold tracking-tight text-gray-950 dark:text-white">{m.label}</h3>
                  <p className="mt-1.5 text-[13px] leading-[1.6] text-gray-500 dark:text-white/35">{m.description}</p>
                  {integration.label && (
                    <p className="mt-2 text-[11px] font-mono text-gray-400 dark:text-white/25 truncate">{integration.label}</p>
                  )}
                </div>

                {/* connect button */}
                <div className="mt-6 space-y-3">
                  {isConnected ? (
                    <div className="space-y-2">
                      <div className={cn("flex items-center justify-center gap-2 rounded-xl border bg-gradient-to-r px-4 py-3 text-sm font-semibold", m.connectedBg)}>
                        <CheckCircle2 className="h-4 w-4" />
                        Connected
                      </div>
                      {(integration.channel === "MESSENGER" || integration.channel === "INSTAGRAM") && (
                        <button
                          type="button"
                          onClick={() => void resubscribe(integration)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-sky-200 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-600 dark:text-sky-400 transition hover:bg-sky-100 dark:hover:bg-sky-500/20"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Re-subscribe webhook
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void disconnect(integration.channel)}
                        disabled={disconnecting === integration.channel}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-40"
                      >
                        {disconnecting === integration.channel ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlugZap className="h-3.5 w-3.5" />}
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!channelReady(integration.channel) || isLoading}
                      onClick={() => void connect(integration)}
                      className={cn(
                        "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
                        m.btnGradient
                      )}
                    >
                      {isLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Connecting…</>
                      ) : isPending ? (
                        <>Continue setup</>
                      ) : (
                        <>Connect {m.label}</>
                      )}
                    </button>
                  )}

                  {/* Manual Token Entry — available for ALL states */}
                  <div className="rounded-xl border border-gray-100 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.03] p-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => setManualOpen(manualOpen === integration.channel ? null : integration.channel)}
                      className="flex w-full items-center justify-between gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/50 transition"
                    >
                      <span className="flex items-center gap-1.5"><Key className="h-3 w-3" />Enter token manually</span>
                      <ChevronDown className={cn("h-3 w-3 transition-transform", manualOpen === integration.channel && "rotate-180")} />
                    </button>
                    {manualOpen === integration.channel && (
                      <>
                        {integration.channel === "INSTAGRAM" && (
                          <p className="text-[10px] text-violet-500 dark:text-violet-400 font-medium">Use a Page Access Token (not IG token). Get it from: Meta for Developers → your app → Instagram → Generate Token</p>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={tokenDrafts[integration._id] ?? ""}
                            onChange={(e) => setTokenDrafts((d) => ({ ...d, [integration._id]: e.target.value }))}
                            placeholder={integration.channel === "INSTAGRAM" ? "Page Access Token (EAAHt…)" : "EAAHt…"}
                            className="flex-1 min-w-0 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-mono text-gray-700 dark:text-white/70 placeholder:text-gray-300 dark:placeholder:text-white/15 outline-none focus:border-violet-400 dark:focus:border-violet-500/50 transition"
                          />
                          <button
                            type="button"
                            onClick={() => void saveToken(integration)}
                            disabled={savingToken === integration._id}
                            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-gray-900 dark:bg-white/[0.08] px-2.5 py-1.5 text-[11px] font-semibold text-white dark:text-white/70 transition hover:bg-violet-700 dark:hover:bg-white/[0.14] disabled:opacity-40"
                          >
                            {savingToken === integration._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            Save
                          </button>
                        </div>
                        {integration.accessTokenEncrypted ? (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ Token stored — click Re-subscribe webhook to activate</p>
                        ) : (
                          <p className="text-[10px] text-gray-400 dark:text-white/25">Paste your Page Access Token then Save. After saving, click Connect to subscribe the webhook.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <div className="px-6 pb-8">
        <div className="rounded-[22px] border border-gray-100 dark:border-white/[0.05] bg-gray-50/60 dark:bg-white/[0.02] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-white/25 mb-5">How it works</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-3">
                <span className="mt-0.5 shrink-0 text-[11px] font-black tracking-tight text-gray-200 dark:text-white/10 select-none tabular-nums">{s.n}</span>
                <div>
                  <p className="text-[13px] font-semibold text-gray-800 dark:text-white/70">{s.title}</p>
                  <p className="mt-0.5 text-[12px] leading-[1.65] text-gray-400 dark:text-white/30">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    {/* ── Facebook Page Picker modal ─────────────────────────────────────── */}
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
                <p className="font-semibold text-white text-sm">Connect {pm.label}</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {hasPages ? `${pagePicker.pages.length} Facebook page(s) found — select one below.` : "No pages found."}
                </p>
              </div>
              <button type="button" onClick={() => setPagePicker(null)} className="rounded-lg p-1.5 text-white/30 hover:bg-white/[0.06] hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {hasPages ? (
                <div className="relative">
                  <select
                    value={selectedPageId}
                    onChange={(e) => setSelectedPageId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/[0.10] bg-white/[0.05] px-4 py-3 pr-9 text-sm text-white outline-none focus:border-sky-500/50"
                  >
                    {pagePicker.pages.map((p) => (
                      <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                </div>
              ) : (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-300 space-y-1">
                  <p className="font-semibold">No Facebook Pages found</p>
                  <p className="text-rose-400/70 text-[12px]">Make sure your Facebook account manages at least one Page and that Meta App ID &amp; Secret are saved in admin settings. Also ensure this OAuth redirect URL is added as a Valid OAuth Redirect URI in your Meta App:</p>
                  <p className="font-mono text-[11px] text-rose-300/60 break-all">{typeof window !== "undefined" ? window.location.origin : ""}/api/social-bot/meta/oauth-callback</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPagePicker(null)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/40 hover:bg-white/[0.07] hover:text-white/70 transition"
                >
                  Cancel
                </button>
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
