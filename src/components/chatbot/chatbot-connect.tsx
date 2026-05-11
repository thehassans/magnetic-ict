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

const channelMeta: Record<SocialChannel, { label: string; icon: typeof MessageCircle; color: string; glow: string }> = {
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle, color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25", glow: "rgba(52,211,153,0.6)" },
  INSTAGRAM: { label: "Instagram", icon: Instagram, color: "bg-pink-500/15 text-pink-300 border-pink-500/25", glow: "rgba(236,72,153,0.6)" },
  MESSENGER: { label: "Messenger", icon: Bot, color: "bg-sky-500/15 text-sky-300 border-sky-500/25", glow: "rgba(14,165,233,0.6)" }
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
    <div className="min-h-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Connect Channels</h1>
          <p className="mt-0.5 text-sm text-white/40">Link messaging channels through Meta&#39;s guided flow</p>
        </div>
        <button type="button" onClick={() => void reload()} className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/50 transition hover:bg-white/[0.07] hover:text-white/80">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {toast && (
        <div className={cn("rounded-xl border px-4 py-3 text-sm", toast.type === "ok" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-rose-500/20 bg-rose-500/10 text-rose-300")}>
          {toast.msg}
        </div>
      )}

      {!metaReady && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
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
            <div key={integration._id} className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.05]">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-20"
                style={{ background: meta.glow ?? "rgba(124,58,237,0.5)" }} />
              <div className="flex items-start justify-between gap-3">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border", meta.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                {isConnected
                  ? <Wifi className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
                  : <WifiOff className="h-5 w-5 text-white/15" />}
              </div>
              <h3 className="mt-4 font-semibold text-white">{meta.label}</h3>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" : isPending ? "bg-amber-400" : "bg-white/20")} />
                <span className="text-xs text-white/40">{integration.status}</span>
              </div>
              {integration.label ? <p className="mt-1 text-xs text-white/30">{integration.label}</p> : null}
              <button
                type="button"
                disabled={!metaReady || !sdkReady || isLoading || isConnected}
                onClick={() => void connect(integration)}
                className={cn(
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition",
                  isConnected
                    ? "bg-emerald-500/15 text-emerald-300 cursor-default"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:from-violet-500 hover:to-purple-500 disabled:opacity-40"
                )}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isConnected ? <CheckCircle2 className="h-4 w-4" /> : <Plug className="h-4 w-4" />}
                {isConnected ? "Connected" : isPending ? "Pending activation" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="text-sm font-semibold text-white/80">How it works</p>
        <p className="mt-2 text-sm leading-7 text-white/35">Click <strong className="text-white/60">Connect</strong> to open Meta&#39;s guided business login. You don&#39;t need to copy tokens — our team receives the authorization and activates your channel within 24 hours.</p>
      </div>
    </div>
  );
}
