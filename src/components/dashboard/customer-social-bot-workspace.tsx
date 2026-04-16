"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Bot, CheckCircle2, Instagram, Loader2, MessageCircle, Send, Sparkles, Upload, Wand2, Webhook } from "lucide-react";
import { Spinner } from "@/components/ui/spinner-1";
import { cn } from "@/lib/utils";
import type { SocialBotIntegration, SocialBotMessage, SocialBotThread, SocialBotWorkspace, SocialChannel } from "@/lib/social-bot-types";

type ThreadPayload = {
  thread: SocialBotThread | null;
  messages: SocialBotMessage[];
};

type CustomerSocialBotWorkspaceProps = {
  metaAppId: string;
  metaConfigId: string;
};

declare global {
  interface Window {
    FB?: {
      init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { code?: string } } | undefined) => void,
        options: {
          config_id: string;
          response_type: string;
          override_default_response_type: boolean;
          extras: { sessionInfoVersion: number };
        }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

const sourceIconMap = {
  WHATSAPP: MessageCircle,
  INSTAGRAM: Instagram,
  MESSENGER: Bot
} as const;

export function CustomerSocialBotWorkspace({ metaAppId, metaConfigId }: CustomerSocialBotWorkspaceProps) {
  const [workspace, setWorkspace] = useState<SocialBotWorkspace | null>(null);
  const [selectedStep, setSelectedStep] = useState<1 | 2 | 3>(1);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threadPayload, setThreadPayload] = useState<ThreadPayload | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [demoThread, setDemoThread] = useState({ source: "WHATSAPP" as SocialChannel, contactName: "", contactHandle: "", firstMessage: "" });
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [connectingChannel, setConnectingChannel] = useState<SocialChannel | null>(null);

  const integrations = workspace?.integrations ?? [];
  const threads = workspace?.threads ?? [];
  const knowledgeBaseDocuments = workspace?.documents ?? [];
  const hasKnowledgeBaseTraining = isUploadingDocs || knowledgeBaseDocuments.some((document) => document.status === "PROCESSING");
  const metaConnectReady = Boolean(metaAppId.trim() && metaConfigId.trim());

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/social-bot/workspace", { cache: "no-store" });
      const payload = (await response.json()) as SocialBotWorkspace & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load Magnetic Social Bot workspace.");
      }

      setWorkspace(payload);
      setBusinessName(payload.profile?.businessName ?? "");
      setIndustry(payload.profile?.industry ?? "");
      setSelectedStep((payload.profile?.knowledgeBaseReady ? 3 : payload.profile?.businessName ? 2 : 1) as 1 | 2 | 3);
      setSelectedThreadId((current) => current ?? payload.threads[0]?._id ?? null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load workspace.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!selectedThreadId) {
      setThreadPayload(null);
      return;
    }

    let cancelled = false;

    async function loadThread() {
      const response = await fetch(`/api/social-bot/threads/${selectedThreadId}`, { cache: "no-store" });
      const payload = (await response.json()) as ThreadPayload & { error?: string };

      if (!response.ok) {
        if (!cancelled) {
          setError(payload.error ?? "Unable to load thread.");
        }
        return;
      }

      if (!cancelled) {
        setThreadPayload(payload);
      }
    }

    void loadThread();
    const interval = window.setInterval(loadThread, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [selectedThreadId]);

  useEffect(() => {
    if (!metaConnectReady || typeof window === "undefined") {
      return;
    }

    if (window.FB) {
      setSdkReady(true);
      return;
    }

    window.fbAsyncInit = () => {
      if (!window.FB) {
        return;
      }

      window.FB.init({
        appId: metaAppId,
        cookie: true,
        xfbml: false,
        version: "v19.0"
      });
      setSdkReady(true);
    };

    const existing = document.getElementById("facebook-jssdk");
    if (existing) {
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    document.body.appendChild(script);
  }, [metaAppId, metaConnectReady]);

  const selectedThread = threadPayload?.thread ?? null;
  const selectedMessages = threadPayload?.messages ?? [];
  const stats = {
    documentsReady: workspace?.documents.filter((document) => document.status === "READY").length ?? 0,
    connectedChannels: workspace?.integrations.filter((integration) => integration.status === "CONNECTED").length ?? 0,
    aiThreads: workspace?.threads.filter((thread) => thread.mode === "AI").length ?? 0
  };

  async function saveProfile() {
    setIsSavingProfile(true);
    setError(null);

    try {
      const response = await fetch("/api/social-bot/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, industry })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save profile.");
      }

      setToast("Profile saved.");
      setSelectedStep(2);
      await loadWorkspace();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function uploadDocuments(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setIsUploadingDocs(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      const response = await fetch("/api/social-bot/documents", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to upload documents.");
      }

      setToast("Knowledge base updated.");
      setSelectedStep(3);
      await loadWorkspace();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to upload documents.");
    } finally {
      setIsUploadingDocs(false);
    }
  }

  async function saveIntegration(integration: SocialBotIntegration, updates: Partial<SocialBotIntegration> & { accessToken?: string }) {
    setError(null);

    const response = await fetch("/api/social-bot/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: integration.channel,
        enabled: updates.enabled ?? integration.enabled,
        label: updates.label ?? integration.label,
        pageId: updates.pageId ?? integration.pageId,
        phoneNumberId: updates.phoneNumberId ?? integration.phoneNumberId,
        accountId: updates.accountId ?? integration.accountId,
        accessToken: updates.accessToken ?? ""
      })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? `Unable to update ${integration.channel}.`);
      return;
    }

    await loadWorkspace();
  }

  async function launchMetaSignup() {
    if (!metaConnectReady) {
      throw new Error("Meta guided connect is not available yet. Please contact support.");
    }

    if (!window.FB) {
      throw new Error("Meta connect is still loading. Please try again in a moment.");
    }

    return await new Promise<void>((resolve, reject) => {
      window.FB?.login(
        (response) => {
          if (response?.authResponse?.code) {
            resolve();
            return;
          }

          reject(new Error("Meta connection was canceled or not completed."));
        },
        {
          config_id: metaConfigId,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            sessionInfoVersion: 2
          }
        }
      );
    });
  }

  async function handleConnectChannel(integration: SocialBotIntegration) {
    setConnectingChannel(integration.channel);
    setError(null);

    try {
      await launchMetaSignup();
      await saveIntegration(integration, { enabled: true });
      setToast(`${integration.channel} connection request sent. Our team can finish activation without asking you for raw tokens.`);
      setSelectedStep(3);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to start Meta connect.");
    } finally {
      setConnectingChannel(null);
    }
  }

  async function createDemoThread() {
    setError(null);
    const response = await fetch("/api/social-bot/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(demoThread)
    });

    const payload = (await response.json().catch(() => ({}))) as ThreadPayload & { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to create demo thread.");
      return;
    }

    setToast("Demo thread created.");
    setDemoThread({ source: "WHATSAPP", contactName: "", contactHandle: "", firstMessage: "" });
    await loadWorkspace();
    if (payload.thread?._id) {
      setSelectedThreadId(payload.thread._id);
      setThreadPayload(payload);
    }
  }

  async function toggleThreadMode(mode: "AI" | "MANUAL") {
    if (!selectedThread) {
      return;
    }

    const response = await fetch(`/api/social-bot/threads/${selectedThread._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Unable to change thread mode.");
      return;
    }

    setToast(`Thread switched to ${mode === "AI" ? "AI" : "Manual"} mode.`);
    await loadWorkspace();
    const refreshed = await fetch(`/api/social-bot/threads/${selectedThread._id}`, { cache: "no-store" });
    const refreshedPayload = (await refreshed.json()) as ThreadPayload;
    setThreadPayload(refreshedPayload);
  }

  async function sendMessage() {
    if (!selectedThread || !messageText.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/social-bot/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: selectedThread._id, text: messageText })
      });

      const payload = (await response.json().catch(() => ({}))) as ThreadPayload & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send message.");
      }

      setThreadPayload(payload);
      setMessageText("");
      setToast("Reply sent.");
      await loadWorkspace();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to send message.");
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-10 text-center shadow-glow dark:border-white/10 dark:bg-slate-950/50">
        <Spinner size={28} className="mx-auto" aria-label="Loading workspace" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast ? <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{toast}</div> : null}
      {error ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Docs" value={String(stats.documentsReady)} icon={<Upload className="h-4 w-4" />} />
        <StatCard label="Channels" value={String(stats.connectedChannels)} icon={<Webhook className="h-4 w-4" />} />
        <StatCard label="AI Threads" value={String(stats.aiThreads)} icon={<Sparkles className="h-4 w-4" />} />
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white/90 p-5 shadow-glow dark:border-white/10 dark:bg-slate-950/50 sm:p-6">
        <div className="flex flex-wrap gap-3">
          {[
            { id: 1 as const, label: "1" },
            { id: 2 as const, label: "2" },
            { id: 3 as const, label: "3" }
          ].map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setSelectedStep(step.id)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition",
                selectedStep === step.id
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              )}
            >
              {step.label}
            </button>
          ))}
        </div>

        {selectedStep === 1 ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4">
              <Field label="Business Name" value={businessName} onChange={setBusinessName} />
              <Field label="Industry" value={industry} onChange={setIndustry} />
              <button
                type="button"
                onClick={saveProfile}
                disabled={isSavingProfile}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Save
              </button>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <label className={cn(
                "flex min-h-40 flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-300 px-4 text-center text-sm text-slate-600 transition dark:border-white/15 dark:text-slate-300",
                isUploadingDocs
                  ? "cursor-wait border-cyan-300 bg-cyan-50/70 dark:bg-cyan-400/10"
                  : "cursor-pointer hover:border-cyan-300 hover:bg-cyan-50/60 dark:hover:bg-cyan-400/10"
              )}>
                {isUploadingDocs ? (
                  <>
                    <Spinner size={50} aria-label="Uploading and training documents" />
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-950 dark:text-white">Uploading and training</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Extracting document text and preparing model knowledge.</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>PDF / DOCX / TXT</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Upload files to train your business knowledge base.</span>
                  </>
                )}
                <input type="file" multiple accept=".pdf,.docx,.txt,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" disabled={isUploadingDocs} onChange={(event) => void uploadDocuments(event.target.files)} />
              </label>
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                {isUploadingDocs ? "Please wait while your files are uploaded and trained into the AI context." : "Use your business docs as RAG context."}
              </div>
            </div>
          </div>
        ) : null}

        {selectedStep === 2 ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100">
              Connect your channels without entering Page IDs or access tokens. We open Meta&apos;s guided business flow, then your admin can complete any final activation from the admin panel.
            </div>
            {!metaConnectReady ? (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Guided Meta connect is not configured yet. Please contact support so we can finish setup for your workspace.
              </div>
            ) : null}
            <div className="grid gap-4 lg:grid-cols-3">
              {integrations.map((integration) => (
                <CustomerChannelCard
                  key={integration._id}
                  integration={integration}
                  sdkReady={sdkReady}
                  metaConnectReady={metaConnectReady}
                  loading={connectingChannel === integration.channel}
                  onConnect={() => void handleConnectChannel(integration)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {selectedStep === 3 ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm font-semibold text-slate-950 dark:text-white">New demo thread</div>
                <div className="mt-4 grid gap-3">
                  <select value={demoThread.source} onChange={(event) => setDemoThread((current) => ({ ...current, source: event.target.value as SocialChannel }))} className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-white">
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="MESSENGER">Messenger</option>
                  </select>
                  <Field label="Name" value={demoThread.contactName} onChange={(value) => setDemoThread((current) => ({ ...current, contactName: value }))} compact />
                  <Field label="Handle" value={demoThread.contactHandle} onChange={(value) => setDemoThread((current) => ({ ...current, contactHandle: value }))} compact />
                  <textarea value={demoThread.firstMessage} onChange={(event) => setDemoThread((current) => ({ ...current, firstMessage: event.target.value }))} rows={4} className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-white" />
                  <button type="button" onClick={() => void createDemoThread()} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-700">
                    <Wand2 className="h-4 w-4" />
                    Start
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/40">
                {threads.length === 0 ? (
                  <div className="p-5 text-sm text-slate-500 dark:text-slate-400">No threads yet.</div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-white/10">
                    {threads.map((thread) => {
                      const Icon = sourceIconMap[thread.source];
                      return (
                        <button
                          key={thread._id}
                          type="button"
                          onClick={() => setSelectedThreadId(thread._id)}
                          className={cn(
                            "flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-white/5",
                            selectedThreadId === thread._id && "bg-cyan-50/70 dark:bg-cyan-400/10"
                          )}
                        >
                          <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate font-semibold text-slate-950 dark:text-white">{thread.contactName}</div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{thread.mode}</span>
                            </div>
                            <div className="truncate text-sm text-slate-500 dark:text-slate-400">{thread.lastMessagePreview}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/40 sm:p-5">
              {selectedThread ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-white/10">
                    <div>
                      <div className="text-lg font-semibold text-slate-950 dark:text-white">{selectedThread.contactName}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{selectedThread.contactHandle}</div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => void toggleThreadMode("AI")} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", selectedThread.mode === "AI" ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200")}>AI</button>
                      <button type="button" onClick={() => void toggleThreadMode("MANUAL")} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", selectedThread.mode === "MANUAL" ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200")}>Manual</button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedMessages.map((message) => {
                      const Icon = sourceIconMap[message.source];
                      const outbound = message.direction === "OUTBOUND";
                      return (
                        <div key={message._id} className={cn("flex gap-3", outbound && "justify-end")}>
                          {!outbound ? (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                              <Icon className="h-4 w-4" />
                            </div>
                          ) : null}
                          <div className={cn("max-w-[78%] rounded-[22px] px-4 py-3 text-sm leading-7", outbound ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100")}>
                            {message.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <textarea value={messageText} onChange={(event) => setMessageText(event.target.value)} rows={3} className="min-h-28 flex-1 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <button type="button" onClick={() => void sendMessage()} disabled={isSending} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60">
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex min-h-80 items-center justify-center text-sm text-slate-500 dark:text-slate-400">Select a thread.</div>
              )}
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="Guided connect" text="Customers no longer need to paste Page IDs or access tokens. Start Meta connect, approve access, and let the admin team complete the technical mapping." />
        <InfoCard title="Memory window" text="Replies use the last 10 messages plus retrieved business chunks to keep the flow human-like." />
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white/90 p-5 shadow-glow dark:border-white/10 dark:bg-slate-950/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-950 dark:text-white">Knowledge Base</div>
          {hasKnowledgeBaseTraining ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100">
              <Spinner size={18} aria-label="Knowledge base training in progress" />
              Training in progress
            </div>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {knowledgeBaseDocuments.map((document) => (
            <div key={document._id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm dark:border-white/10 dark:bg-white/5">
              <div className="font-semibold text-slate-950 dark:text-white">{document.fileName}</div>
              <div className="mt-1 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                {document.status === "PROCESSING" ? <Spinner size={16} aria-label={`${document.fileName} is processing`} /> : null}
                <span>{document.status} · {document.chunkCount} chunks</span>
              </div>
              <div className="mt-3 text-slate-600 dark:text-slate-300">{document.textPreview || "No preview available."}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-glow dark:border-white/10 dark:bg-slate-950/50">
      <div className="text-cyan-600 dark:text-cyan-300">{icon}</div>
      <div className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{value}</div>
      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

function Field({ label, value, onChange, compact = false }: { label: string; value: string; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <label className="space-y-2 text-sm">
      {!compact ? <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span> : null}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} className="h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none dark:border-white/10 dark:bg-slate-950/60 dark:text-white" />
    </label>
  );
}

function CustomerChannelCard({
  integration,
  sdkReady,
  metaConnectReady,
  loading,
  onConnect
}: {
  integration: SocialBotIntegration;
  sdkReady: boolean;
  metaConnectReady: boolean;
  loading: boolean;
  onConnect: () => void;
}) {
  const buttonDisabled = loading || !metaConnectReady || !sdkReady;
  const statusTone = integration.status === "CONNECTED"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : integration.status === "PENDING"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-slate-950 dark:text-white">{integration.channel}</div>
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone}`}>
          {integration.status}
        </span>
      </div>
      <div className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
        {integration.channel === "WHATSAPP"
          ? "Approve Meta access for your WhatsApp Business account. We will finish the phone-number mapping for you."
          : integration.channel === "INSTAGRAM"
            ? "Approve access to your Instagram business account and messaging permissions without entering manual IDs."
            : "Approve access to your Facebook Page so Messenger can be activated without pasting page tokens."}
      </div>
      <button
        type="button"
        onClick={onConnect}
        disabled={buttonDisabled}
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening Meta..." : integration.status === "CONNECTED" ? "Reconnect with Meta" : integration.status === "PENDING" ? "Continue Meta connect" : "Connect with Meta"}
      </button>
      {!metaConnectReady ? <div className="mt-3 text-xs text-amber-700">Waiting for platform Meta settings.</div> : null}
      {metaConnectReady && !sdkReady ? <div className="mt-3 text-xs text-slate-500">Loading Meta connect…</div> : null}
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-glow dark:border-white/10 dark:bg-slate-950/50">
      <div className="font-semibold text-slate-950 dark:text-white">{title}</div>
      <div className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{text}</div>
    </div>
  );
}
