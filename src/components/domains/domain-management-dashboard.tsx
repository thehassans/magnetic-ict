"use client";

import { useMemo, useState, useTransition } from "react";
import { Globe2, Loader2, Plus, RefreshCcw, Save, Server, ShieldCheck, Trash2 } from "lucide-react";
import type { DomainDnsRecord, DomainWhoisData, ManagedDomainSummary } from "@/lib/domain-types";

type TransactionSummary = {
  _id: string;
  type: string;
  status: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
};

type ManagedDomainSnapshot = {
  domain: ManagedDomainSummary & { lastSyncedAt?: string | null; errorMessage?: string | null };
  dnsRecords: DomainDnsRecord[];
  transactions: TransactionSummary[];
  whois: DomainWhoisData | null;
};

type DomainManagementDashboardProps = {
  initialSnapshots: ManagedDomainSnapshot[];
};

type DraftRecord = {
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
  name: string;
  value: string;
  ttl: number;
  priority: string;
};

const emptyRecord: DraftRecord = {
  type: "A",
  name: "@",
  value: "",
  ttl: 3600,
  priority: "10"
};

function getDomainTone(status: string) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "failed":
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export function DomainManagementDashboard({ initialSnapshots }: DomainManagementDashboardProps) {
  const [snapshots, setSnapshots] = useState(initialSnapshots);
  const [selectedDomainId, setSelectedDomainId] = useState(initialSnapshots[0]?.domain.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, DraftRecord>>(() => Object.fromEntries(initialSnapshots.map((snapshot) => [snapshot.domain.id, emptyRecord])));
  const [editingRecordIds, setEditingRecordIds] = useState<Record<string, string | null>>(() => Object.fromEntries(initialSnapshots.map((snapshot) => [snapshot.domain.id, null])));
  const [nameserverDrafts, setNameserverDrafts] = useState<Record<string, string>>(() => Object.fromEntries(initialSnapshots.map((snapshot) => [snapshot.domain.id, snapshot.domain.nameservers.join("\n")])));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, startTransition] = useTransition();

  const selectedSnapshot = useMemo(
    () => snapshots.find((snapshot) => snapshot.domain.id === selectedDomainId) ?? snapshots[0] ?? null,
    [selectedDomainId, snapshots]
  );

  function updateSnapshot(nextSnapshot: ManagedDomainSnapshot) {
    setSnapshots((current) => current.map((snapshot) => snapshot.domain.id === nextSnapshot.domain.id ? nextSnapshot : snapshot));
  }

  async function refreshSnapshot(domainId: string) {
    const response = await fetch(`/api/domains/managed/${domainId}`, { cache: "no-store" });
    const payload = (await response.json().catch(() => ({}))) as { error?: string } & Partial<ManagedDomainSnapshot>;

    if (!response.ok || !payload.domain) {
      throw new Error(payload.error ?? "Unable to refresh this domain.");
    }

    updateSnapshot(payload as ManagedDomainSnapshot);
  }

  function handleDnsSave(recordId?: string) {
    if (!selectedSnapshot) {
      return;
    }

    const draft = drafts[selectedSnapshot.domain.id] ?? emptyRecord;
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/domains/managed/${selectedSnapshot.domain.id}/dns`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            recordId,
            type: draft.type,
            name: draft.name,
            value: draft.value,
            ttl: draft.ttl,
            priority: draft.type === "MX" ? Number(draft.priority) || 10 : null
          })
        });

        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to save DNS record.");
        }

        await refreshSnapshot(selectedSnapshot.domain.id);
        setDrafts((current) => ({ ...current, [selectedSnapshot.domain.id]: emptyRecord }));
        setEditingRecordIds((current) => ({ ...current, [selectedSnapshot.domain.id]: null }));
        setMessage("DNS record saved.");
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to save DNS record.");
      }
    });
  }

  function handleDnsDelete(recordId: string) {
    if (!selectedSnapshot) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/domains/managed/${selectedSnapshot.domain.id}/dns/${recordId}`, {
          method: "DELETE"
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to delete DNS record.");
        }

        await refreshSnapshot(selectedSnapshot.domain.id);
        setMessage("DNS record deleted.");
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to delete DNS record.");
      }
    });
  }

  function handleNameserverSave() {
    if (!selectedSnapshot) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/domains/managed/${selectedSnapshot.domain.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "nameservers",
            payload: {
              nameservers: (nameserverDrafts[selectedSnapshot.domain.id] ?? "")
                .split(/\r?\n/)
                .map((entry) => entry.trim())
                .filter(Boolean)
            }
          })
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to update nameservers.");
        }

        await refreshSnapshot(selectedSnapshot.domain.id);
        setMessage("Nameservers updated.");
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to update nameservers.");
      }
    });
  }

  function handleAutoRenewToggle() {
    if (!selectedSnapshot) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/domains/managed/${selectedSnapshot.domain.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "autoRenew",
            payload: {
              autoRenew: !selectedSnapshot.domain.autoRenew
            }
          })
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to update auto-renew.");
        }

        await refreshSnapshot(selectedSnapshot.domain.id);
        setMessage(`Auto-renew ${selectedSnapshot.domain.autoRenew ? "disabled" : "enabled"}.`);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to update auto-renew.");
      }
    });
  }

  function handleRenewNow() {
    if (!selectedSnapshot) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/domains/managed/${selectedSnapshot.domain.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ action: "renew" })
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to create a renewal request.");
        }

        await refreshSnapshot(selectedSnapshot.domain.id);
        setMessage("Renewal request created.");
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to create a renewal request.");
      }
    });
  }

  if (!selectedSnapshot) {
    return <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">You do not have any managed domains yet.</div>;
  }

  const selectedDraft = drafts[selectedSnapshot.domain.id] ?? emptyRecord;
  const editingRecordId = editingRecordIds[selectedSnapshot.domain.id];

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Domains</div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Magnetic ICT control plane</h2>
          </div>
          <div className="space-y-3">
            {snapshots.map((snapshot) => (
              <button
                key={snapshot.domain.id}
                type="button"
                onClick={() => setSelectedDomainId(snapshot.domain.id)}
                className={`w-full rounded-[24px] border p-4 text-left transition ${selectedDomainId === snapshot.domain.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 hover:bg-white"}`}
              >
                <div className="text-lg font-semibold">{snapshot.domain.domain}</div>
                <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${selectedDomainId === snapshot.domain.id ? "border-white/20 bg-white/10 text-white" : getDomainTone(snapshot.domain.status)}`}>
                  {snapshot.domain.status}
                </div>
                <div className={`mt-3 text-sm ${selectedDomainId === snapshot.domain.id ? "text-white/70" : "text-slate-500"}`}>
                  Expires {snapshot.domain.expiresAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(snapshot.domain.expiresAt)) : "Pending"}
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-5">
          <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Domain overview</div>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{selectedSnapshot.domain.domain}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Manage DNS, WHOIS visibility, nameservers, and renewal state for your domain from one Magnetic ICT workspace.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={handleAutoRenewToggle} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  {selectedSnapshot.domain.autoRenew ? "Disable auto-renew" : "Enable auto-renew"}
                </button>
                <button type="button" onClick={handleRenewNow} className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Request renewal
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Status</div>
                <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getDomainTone(selectedSnapshot.domain.status)}`}>
                  {selectedSnapshot.domain.status}
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Renewal price</div>
                <div className="mt-3 text-2xl font-semibold text-slate-950">${selectedSnapshot.domain.renewalPrice.toFixed(2)}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Registrar ref</div>
                <div className="mt-3 break-all text-sm font-medium text-slate-950">{selectedSnapshot.domain.registrarReference ?? "Pending"}</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Privacy</div>
                <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-950">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  {selectedSnapshot.domain.privacyProtection ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>

            {message ? <div className="mt-5 rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="mt-5 rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-cyan-600" />
                <h2 className="text-xl font-semibold text-slate-950">Nameservers</h2>
              </div>
              <textarea
                value={nameserverDrafts[selectedSnapshot.domain.id] ?? ""}
                onChange={(event) => setNameserverDrafts((current) => ({ ...current, [selectedSnapshot.domain.id]: event.target.value }))}
                rows={5}
                className="mt-4 w-full rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
              />
              <button type="button" onClick={handleNameserverSave} disabled={pendingAction} className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                {pendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save nameservers
              </button>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-cyan-600" />
                <h2 className="text-xl font-semibold text-slate-950">WHOIS</h2>
              </div>
              {selectedSnapshot.whois ? (
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div>Registrar: <span className="font-medium text-slate-950">{selectedSnapshot.whois.registrar ?? "Unknown"}</span></div>
                  <div>Created: <span className="font-medium text-slate-950">{selectedSnapshot.whois.createdAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(selectedSnapshot.whois.createdAt)) : "Unknown"}</span></div>
                  <div>Expires: <span className="font-medium text-slate-950">{selectedSnapshot.whois.expiresAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(selectedSnapshot.whois.expiresAt)) : "Pending"}</span></div>
                  <div>Status: <span className="font-medium text-slate-950">{selectedSnapshot.whois.status.join(", ") || "Unknown"}</span></div>
                </div>
              ) : (
                <div className="mt-4 rounded-[20px] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">WHOIS data will appear here when live registrar sync is available.</div>
              )}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">DNS zone</h2>
                <p className="mt-2 text-sm text-slate-600">Create and manage A, CNAME, MX, TXT, AAAA, and NS records with server-side validation.</p>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                {selectedSnapshot.dnsRecords.length} records
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              <select
                value={selectedDraft.type}
                onChange={(event) => setDrafts((current) => ({
                  ...current,
                  [selectedSnapshot.domain.id]: {
                    ...(current[selectedSnapshot.domain.id] ?? emptyRecord),
                    type: event.target.value as DraftRecord["type"]
                  }
                }))}
                className="h-11 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
              >
                {(["A", "AAAA", "CNAME", "MX", "TXT", "NS"] as const).map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <input value={selectedDraft.name} onChange={(event) => setDrafts((current) => ({ ...current, [selectedSnapshot.domain.id]: { ...(current[selectedSnapshot.domain.id] ?? emptyRecord), name: event.target.value } }))} placeholder="@ or subdomain" className="h-11 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
              <input value={selectedDraft.value} onChange={(event) => setDrafts((current) => ({ ...current, [selectedSnapshot.domain.id]: { ...(current[selectedSnapshot.domain.id] ?? emptyRecord), value: event.target.value } }))} placeholder="Value or target" className="h-11 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white md:col-span-2" />
              <button type="button" onClick={() => handleDnsSave(editingRecordId ?? undefined)} disabled={pendingAction} className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                {pendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {editingRecordId ? "Save record" : "Add record"}
              </button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <input type="number" min={60} max={86400} value={selectedDraft.ttl} onChange={(event) => setDrafts((current) => ({ ...current, [selectedSnapshot.domain.id]: { ...(current[selectedSnapshot.domain.id] ?? emptyRecord), ttl: Math.max(60, Number(event.target.value) || 3600) } }))} placeholder="TTL" className="h-11 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
              <input type="number" min={0} max={65535} value={selectedDraft.priority} onChange={(event) => setDrafts((current) => ({ ...current, [selectedSnapshot.domain.id]: { ...(current[selectedSnapshot.domain.id] ?? emptyRecord), priority: event.target.value } }))} placeholder="Priority for MX" className="h-11 rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white" />
              {editingRecordId ? (
                <button type="button" onClick={() => {
                  setDrafts((current) => ({ ...current, [selectedSnapshot.domain.id]: emptyRecord }));
                  setEditingRecordIds((current) => ({ ...current, [selectedSnapshot.domain.id]: null }));
                }} className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                  Cancel edit
                </button>
              ) : null}
            </div>

            <div className="mt-6 space-y-3">
              {selectedSnapshot.dnsRecords.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No DNS records yet.</div>
              ) : selectedSnapshot.dnsRecords.map((record) => (
                <div key={record.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid gap-2 md:grid-cols-5 md:items-center">
                      <div className="text-sm font-semibold text-slate-950">{record.type}</div>
                      <div className="text-sm text-slate-600">{record.name}</div>
                      <div className="text-sm text-slate-600 md:col-span-2">{record.value}</div>
                      <div className="text-sm text-slate-500">TTL {record.ttl}{record.priority ? ` · Priority ${record.priority}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => {
                        setDrafts((current) => ({
                          ...current,
                          [selectedSnapshot.domain.id]: {
                            type: record.type,
                            name: record.name,
                            value: record.value,
                            ttl: record.ttl,
                            priority: record.priority ? String(record.priority) : "10"
                          }
                        }));
                        setEditingRecordIds((current) => ({ ...current, [selectedSnapshot.domain.id]: record.id }));
                      }} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDnsDelete(record.id)} disabled={pendingAction} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
            <h2 className="text-xl font-semibold text-slate-950">Activity</h2>
            <div className="mt-5 space-y-3">
              {selectedSnapshot.transactions.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No domain activity yet.</div>
              ) : selectedSnapshot.transactions.map((transaction) => (
                <div key={transaction._id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="font-medium text-slate-950">{transaction.type}</div>
                    <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getDomainTone(transaction.status)}`}>
                      {transaction.status}
                    </div>
                  </div>
                  <div className="mt-2">${transaction.amount.toFixed(2)} · {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(transaction.updatedAt))}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
