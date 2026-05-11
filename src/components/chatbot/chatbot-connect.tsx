"use client";

import { useState, useEffect } from "react";
import { Bot, CheckCircle2, Instagram, Loader2, MessageCircle, Plug, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialBotIntegration, SocialChannel } from "@/lib/social-bot-types";

declare global {
  interface Window {
    FB?: {
      init: (o: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (cb: (r: { authResponse?: { code?: string } } | undefined) => void, opts: { config_id: string; response_type: string; override_default_response_type: boolean; extras: { sessionInfoVersion: number } }) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const channelMeta: Record<SocialChannel, { label: string; icon: typeof MessageCircle; color: string }> = {
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle, color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20" },
  INSTAGRAM: { label: "Instagram", icon: Instagram, color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-400/10 dark:text-pink-300 dark:border-pink-400/20" },
  MESSENGER: { label: "Messenger", icon: Bot, color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/20" }
};

type Props = { integrations: SocialBotIntegration[]; metaAppId: string; metaConfigId: string };

export function ChatbotConnect({ integrations, metaAppId, metaConfigId }: Props) {
  const [list, setList] = useState(integrations);
  const [sdkReady, setSdkReady] = useState(false);
  const [connecting, setConnecting] = useState<SocialChannel | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const metaReady = Boolean(metaAppId.trim() && metaConfigId.trim());

  useEffect(() => {
    if (!metaReady || typeof window === "undefined") return;
    if (window.FB) { setSdkReady(true); return; }
    window.fbAsyncInit = () => { window.FB?.init({ appId: metaAppId, cookie: true, xfbml: false, version: "v19.0" }); setSdkReady(true); };
    if (!document.getElementById("facebook-jssdk")) {
      const s = document.createElement("script");
      s.id = "facebook-jssdk"; s.src = "https://connect.facebook.net/en_US/sdk.js"; s.async = true;
      document.body.appendChild(s);
    }
  }, [metaAppId, metaReady]);

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function reload() {
    const r = await fetch("/api/social-bot/workspace", { cache: "no-store" });
    if (r.ok) { const ws = await r.json() as { integrations?: SocialBotIntegration[] }; setList(ws.integrations ?? []); }
  }

  async function connect(integration: SocialBotIntegration) {
    if (!window.FB) { showToast("err", "Meta SDK is still loading. Try again."); return; }
    setConnecting(integration.channel);
    try {
      await new Promise<void>((res, rej) => {
        window.FB?.login((resp) => {
          resp?.authResponse?.code ? res() : rej(new Error("Connection cancelled."));
        }, { config_id: metaConfigId, response_type: "code", override_default_response_type: true, extras: { sessionInfoVersion: 2 } });
      });
      await fetch("/api/social-bot/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: integration.channel, enabled: true, label: integration.label, pageId: integration.pageId, phoneNumberId: integration.phoneNumberId, accountId: integration.accountId, accessToken: "" })
      });
      await reload();
      showToast("ok", `${integration.channel} connection request sent. Admin will finish activation.`);
    } catch (e) {
      showToast("err", e instanceof Error ? e.message : "Connection failed.");
    } finally {
      setConnecting(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Connect Channels</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Link your messaging channels through Meta's guided flow.</p>
        </div>
        <button type="button" onClick={() => void reload()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {toast && (
        <div className={cn("rounded-xl px-4 py-3 text-sm", toast.type === "ok" ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200" : "border border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200")}>
          {toast.msg}
        </div>
      )}

      {!metaReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
          Meta connect is not configured yet. Contact support to complete setup.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {list.map((integration) => {
          const meta = channelMeta[integration.channel];
          const Icon = meta.icon;
          const isConnected = integration.status === "CONNECTED";
          const isPending = integration.status === "PENDING";
          const isLoading = connecting === integration.channel;
          return (
            <div key={integration._id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border", meta.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                {isConnected ? <Wifi className="h-5 w-5 text-emerald-500" /> : <WifiOff className="h-5 w-5 text-slate-300 dark:text-slate-600" />}
              </div>
              <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">{meta.label}</h3>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-400" : isPending ? "bg-amber-400" : "bg-slate-300")} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{integration.status}</span>
              </div>
              {integration.label ? <p className="mt-1 text-xs text-slate-400">{integration.label}</p> : null}
              <button
                type="button"
                disabled={!metaReady || !sdkReady || isLoading || isConnected}
                onClick={() => void connect(integration)}
                className={cn(
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition",
                  isConnected
                    ? "bg-emerald-50 text-emerald-700 cursor-default dark:bg-emerald-400/10 dark:text-emerald-300"
                    : "bg-slate-950 text-white hover:bg-violet-700 disabled:opacity-50 dark:bg-white dark:text-slate-950"
                )}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isConnected ? <CheckCircle2 className="h-4 w-4" /> : <Plug className="h-4 w-4" />}
                {isConnected ? "Connected" : isPending ? "Pending activation" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        <p className="font-semibold text-slate-950 dark:text-white">How it works</p>
        <p className="mt-1">Click <strong>Connect</strong> to open Meta&apos;s guided business login. You don&apos;t need to copy tokens — our team receives the authorization and activates your channel within 24 hours. Once active, messages flow directly into your Inbox.</p>
      </div>
    </div>
  );
}
