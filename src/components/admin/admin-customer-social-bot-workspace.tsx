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

type AdminCustomerSocialBotWorkspaceProps = {
  userId: string;
  customerLabel: string;
};

const sourceIconMap = {
  WHATSAPP: MessageCircle,
  INSTAGRAM: Instagram,
  MESSENGER: Bot
} as const;

export function AdminCustomerSocialBotWorkspace({ userId, customerLabel }: AdminCustomerSocialBotWorkspaceProps) {
  const [workspace, setWorkspace] = useState<SocialBotWorkspace | null>(null);
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

  const integrations = workspace?.integrations ?? [];
  const threads = workspace?.threads ?? [];
  const knowledgeBaseDocuments = workspace?.documents ?? [];
  const hasKnowledgeBaseTraining = isUploadingDocs || knowledgeBaseDocuments.some((document) => document.status === "PROCESSING");

  const buildApiUrl = useCallback(
    (path: string) => {
      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      return `/api/admin/social-bot${normalizedPath}?userId=${encodeURIComponent(userId)}`;
    },
    [userId]
  );

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl("/workspace"), { cache: "no-store" });
      const payload = (await response.json()) as SocialBotWorkspace & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load customer workspace.");
      }

      setWorkspace(payload);
      setBusinessName(payload.profile?.businessName ?? "");
      setIndustry(payload.profile?.industry ?? "");
      setSelectedThreadId((current) => current ?? payload.threads[0]?._id ?? null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load workspace.");
    } finally {
      setIsLoading(false);
    }
  }, [buildApiUrl]);

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
      const response = await fetch(buildApiUrl(`/threads/${selectedThreadId}`), { cache: "no-store" });
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
  }, [buildApiUrl, selectedThreadId]);

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
      const response = await fetch(buildApiUrl("/workspace"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, industry })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save profile.");
      }

      setToast("Customer profile saved.");
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

      const response = await fetch(buildApiUrl("/documents"), {
        method: "POST",
        body: formData
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to upload documents.");
      }

      setToast("Knowledge base updated.");
      await loadWorkspace();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to upload documents.");
    } finally {
      setIsUploadingDocs(false);
    }
  }

  async function saveIntegration(integration: SocialBotIntegration, updates: Partial<SocialBotIntegration> & { accessToken?: string }) {
    setError(null);

    const response = await fetch(buildApiUrl("/integrations"), {
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

    setToast(`${integration.channel} integration saved.`);
    await loadWorkspace();
  }

  async function createDemoThread() {
    setError(null);

    const response = await fetch(buildApiUrl("/threads"), {
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

    const response = await fetch(buildApiUrl(`/threads/${selectedThread._id}`), {
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
    const refreshed = await fetch(buildApiUrl(`/threads/${selectedThread._id}`), { cache: "no-store" });
    const refreshedPayload = (await refreshed.json()) as ThreadPayload;
    setThreadPayload(refreshedPayload);
    await loadWorkspace();
  }

  async function sendMessage() {
    if (!selectedThread || !messageText.trim()) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl("/messages"), {
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
      <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
        <Spinner size={28} className="mx-auto" aria-label="Loading customer workspace" />
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

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Admin workspace</div>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{customerLabel}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Manage the selected customer&apos;s business profile, knowledge base, channel integrations, and conversation inbox from one place.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="text-sm font-semibold text-slate-950">Business profile</div>
            <div className="mt-5 grid gap-4">
              <Field label="Business Name" value={businessName} onChange={setBusinessName} />
              <Field label="Industry" value={industry} onChange={setIndustry} />
              <button
                type="button"
                onClick={saveProfile}
                disabled={isSavingProfile}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Save profile
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-950">Knowledge Base</div>
              {hasKnowledgeBaseTraining ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900">
                  <Spinner size={18} aria-label="Knowledge base training in progress" />
                  Training in progress
                </div>
              ) : null}
            </div>
            <label
              className={cn(
                "mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-300 px-4 text-center text-sm text-slate-600 transition",
                isUploadingDocs ? "cursor-wait border-cyan-300 bg-cyan-50/70" : "hover:border-cyan-300 hover:bg-cyan-50/60"
              )}
            >
              {isUploadingDocs ? (
                <>
                  <Spinner size={50} aria-label="Uploading and training documents" />
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-950">Uploading and training</div>
                    <div className="text-xs text-slate-500">Extracting document text and preparing model knowledge.</div>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>PDF / DOCX / TXT</span>
                  <span className="text-xs text-slate-500">Upload files to train the selected customer&apos;s knowledge base.</span>
                </>
              )}
              <input type="file" multiple accept=".pdf,.docx,.txt,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" disabled={isUploadingDocs} onChange={(event) => void uploadDocuments(event.target.files)} />
            </label>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {knowledgeBaseDocuments.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 sm:col-span-2">No training documents yet.</div>
              ) : (
                knowledgeBaseDocuments.map((document) => (
                  <div key={document._id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm">
                    <div className="font-semibold text-slate-950">{document.fileName}</div>
                    <div className="mt-1 flex items-center gap-2 text-slate-500">
                      {document.status === "PROCESSING" ? <Spinner size={16} aria-label={`${document.fileName} is processing`} /> : null}
                      <span>{document.status} · {document.chunkCount} chunks</span>
                    </div>
                    <div className="mt-3 text-slate-600">{document.textPreview || "No preview available."}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="text-sm font-semibold text-slate-950">Channel integrations</div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {integrations.map((integration) => (
              <AdminIntegrationCard key={integration._id} integration={integration} onSave={saveIntegration} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            <div className="text-sm font-semibold text-slate-950">New demo thread</div>
            <div className="mt-4 grid gap-3">
              <select value={demoThread.source} onChange={(event) => setDemoThread((current) => ({ ...current, source: event.target.value as SocialChannel }))} className="h-11 rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none">
                <option value="WHATSAPP">WhatsApp</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="MESSENGER">Messenger</option>
              </select>
              <Field label="Name" value={demoThread.contactName} onChange={(value) => setDemoThread((current) => ({ ...current, contactName: value }))} compact />
              <Field label="Handle" value={demoThread.contactHandle} onChange={(value) => setDemoThread((current) => ({ ...current, contactHandle: value }))} compact />
              <textarea value={demoThread.firstMessage} onChange={(event) => setDemoThread((current) => ({ ...current, firstMessage: event.target.value }))} rows={4} className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none" />
              <button type="button" onClick={() => void createDemoThread()} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-700">
                <Wand2 className="h-4 w-4" />
                Start demo
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            {threads.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">No threads yet.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {threads.map((thread) => {
                  const Icon = sourceIconMap[thread.source];
                  return (
                    <button
                      key={thread._id}
                      type="button"
                      onClick={() => setSelectedThreadId(thread._id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50",
                        selectedThreadId === thread._id && "bg-cyan-50/70"
                      )}
                    >
                      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="truncate font-semibold text-slate-950">{thread.contactName}</div>
                          <span className="text-xs text-slate-500">{thread.mode}</span>
                        </div>
                        <div className="truncate text-sm text-slate-500">{thread.lastMessagePreview}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)] sm:p-6">
          {selectedThread ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="text-lg font-semibold text-slate-950">{selectedThread.contactName}</div>
                  <div className="text-sm text-slate-500">{selectedThread.contactHandle}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => void toggleThreadMode("AI")} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", selectedThread.mode === "AI" ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-700")}>AI</button>
                  <button type="button" onClick={() => void toggleThreadMode("MANUAL")} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", selectedThread.mode === "MANUAL" ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-700")}>Manual</button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {selectedMessages.map((message) => {
                  const Icon = sourceIconMap[message.source];
                  const outbound = message.direction === "OUTBOUND";
                  return (
                    <div key={message._id} className={cn("flex gap-3", outbound && "justify-end")}>
                      {!outbound ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                          <Icon className="h-4 w-4" />
                        </div>
                      ) : null}
                      <div className={cn("max-w-[78%] rounded-[22px] px-4 py-3 text-sm leading-7", outbound ? "bg-slate-950 text-white" : "border border-slate-200 bg-slate-50 text-slate-800")}>
                        {message.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-3">
                <textarea value={messageText} onChange={(event) => setMessageText(event.target.value)} rows={3} className="min-h-28 flex-1 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none" />
                <button type="button" onClick={() => void sendMessage()} disabled={isSending} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 items-center justify-center text-sm text-slate-500">Select a thread.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className="text-cyan-600">{icon}</div>
      <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function Field({ label, value, onChange, compact = false }: { label: string; value: string; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <label className="space-y-2 text-sm">
      {!compact ? <span className="font-semibold text-slate-700">{label}</span> : null}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} className="h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none" />
    </label>
  );
}

function AdminIntegrationCard({ integration, onSave }: { integration: SocialBotIntegration; onSave: (integration: SocialBotIntegration, updates: Partial<SocialBotIntegration> & { accessToken?: string }) => Promise<void> }) {
  const [label, setLabel] = useState(integration.label);
  const [pageId, setPageId] = useState(integration.pageId);
  const [phoneNumberId, setPhoneNumberId] = useState(integration.phoneNumberId);
  const [accountId, setAccountId] = useState(integration.accountId);
  const [accessToken, setAccessToken] = useState("");
  const [enabled, setEnabled] = useState(integration.enabled);

  useEffect(() => {
    setLabel(integration.label);
    setPageId(integration.pageId);
    setPhoneNumberId(integration.phoneNumberId);
    setAccountId(integration.accountId);
    setEnabled(integration.enabled);
    setAccessToken("");
  }, [integration]);

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-950">{integration.channel}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{integration.status}</div>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          On
        </label>
      </div>
      <div className="mt-4 grid gap-3">
        <Field label="Label" value={label} onChange={setLabel} compact />
        <Field label="Page ID" value={pageId} onChange={setPageId} compact />
        <Field label="Phone Number ID" value={phoneNumberId} onChange={setPhoneNumberId} compact />
        <Field label="Account ID" value={accountId} onChange={setAccountId} compact />
        <input value={accessToken} onChange={(event) => setAccessToken(event.target.value)} placeholder="Access Token" className="h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none" />
        <button type="button" onClick={() => void onSave(integration, { enabled, label, pageId, phoneNumberId, accountId, accessToken })} className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-700">
          Save integration
        </button>
      </div>
    </div>
  );
}
