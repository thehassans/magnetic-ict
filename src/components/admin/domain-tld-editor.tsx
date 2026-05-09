import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { DomainTld } from "@/lib/domain-types";

export function DomainTldEditor({
  tlds,
  onChange
}: {
  tlds: DomainTld[];
  onChange: (tlds: DomainTld[]) => void;
}) {
  const [newTld, setNewTld] = useState("");
  const [newRegisterPrice, setNewRegisterPrice] = useState(19.99);
  const [newRenewPrice, setNewRenewPrice] = useState(19.99);
  const [newTransferPrice, setNewTransferPrice] = useState(19.99);
  const [newPopular, setNewPopular] = useState(false);
  const [newStatus, setNewStatus] = useState<"Active" | "Inactive">("Active");

  function addTld() {
    const tldName = newTld.trim().toLowerCase().replace(/^\./, "");
    if (!tldName) return;
    
    // Prevent duplicates
    if (tlds.some(t => t.tld === tldName)) {
      alert("TLD already exists!");
      return;
    }

    onChange([
      {
        tld: tldName,
        registerPrice: newRegisterPrice,
        renewPrice: newRenewPrice,
        transferPrice: newTransferPrice,
        isPopular: newPopular,
        status: newStatus
      },
      ...tlds
    ]);

    setNewTld("");
    setNewRegisterPrice(19.99);
    setNewRenewPrice(19.99);
    setNewTransferPrice(19.99);
    setNewPopular(false);
    setNewStatus("Active");
  }

  function removeTld(tldName: string) {
    onChange(tlds.filter((t) => t.tld !== tldName));
  }

  function updateTld(index: number, updates: Partial<DomainTld>) {
    const updated = [...tlds];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Domain TLDs</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Manage domain extensions, their pricing, and their visibility.
      </p>

      {/* Add New TLD Form */}
      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]">
        <label className="flex-1 min-w-[120px] space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span>TLD</span>
          <input
            value={newTld}
            onChange={(e) => setNewTld(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:focus:border-cyan-300"
            placeholder="e.g. com"
          />
        </label>
        <label className="w-[100px] space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span>Register $</span>
          <input
            type="number"
            value={newRegisterPrice}
            onChange={(e) => setNewRegisterPrice(parseFloat(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:focus:border-cyan-300"
          />
        </label>
        <label className="w-[100px] space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span>Renew $</span>
          <input
            type="number"
            value={newRenewPrice}
            onChange={(e) => setNewRenewPrice(parseFloat(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:focus:border-cyan-300"
          />
        </label>
        <label className="w-[100px] space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span>Transfer $</span>
          <input
            type="number"
            value={newTransferPrice}
            onChange={(e) => setNewTransferPrice(parseFloat(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:focus:border-cyan-300"
          />
        </label>
        <label className="w-[80px] space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span>Popular</span>
          <select
            value={newPopular ? "true" : "false"}
            onChange={(e) => setNewPopular(e.target.value === "true")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:focus:border-cyan-300"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <label className="w-[100px] space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span>Status</span>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as "Active" | "Inactive")}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:focus:border-cyan-300"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
        <button
          type="button"
          onClick={addTld}
          className="flex h-9 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add TLD
        </button>
      </div>

      {/* TLDs List */}
      <div className="mt-4 max-h-[600px] overflow-y-auto rounded-[24px] border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950/60">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold">TLD</th>
              <th className="px-4 py-3 font-semibold">Register</th>
              <th className="px-4 py-3 font-semibold">Renew</th>
              <th className="px-4 py-3 font-semibold">Transfer</th>
              <th className="px-4 py-3 font-semibold">Popular</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {tlds.map((t, index) => (
              <tr key={t.tld} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">.{t.tld}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={t.registerPrice}
                    onChange={(e) => updateTld(index, { registerPrice: parseFloat(e.target.value) || 0 })}
                    className="w-20 rounded border-slate-200 bg-transparent px-1 py-0.5 outline-none focus:border-slate-950 focus:bg-slate-50 dark:border-white/10 dark:focus:border-cyan-300 dark:focus:bg-white/5"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={t.renewPrice}
                    onChange={(e) => updateTld(index, { renewPrice: parseFloat(e.target.value) || 0 })}
                    className="w-20 rounded border-slate-200 bg-transparent px-1 py-0.5 outline-none focus:border-slate-950 focus:bg-slate-50 dark:border-white/10 dark:focus:border-cyan-300 dark:focus:bg-white/5"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={t.transferPrice}
                    onChange={(e) => updateTld(index, { transferPrice: parseFloat(e.target.value) || 0 })}
                    className="w-20 rounded border-slate-200 bg-transparent px-1 py-0.5 outline-none focus:border-slate-950 focus:bg-slate-50 dark:border-white/10 dark:focus:border-cyan-300 dark:focus:bg-white/5"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={t.isPopular ? "true" : "false"}
                    onChange={(e) => updateTld(index, { isPopular: e.target.value === "true" })}
                    className="rounded border-slate-200 bg-transparent px-1 py-0.5 text-slate-700 outline-none dark:border-white/10 dark:text-slate-300"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={t.status}
                    onChange={(e) => updateTld(index, { status: e.target.value as "Active" | "Inactive" })}
                    className={`rounded border px-1 py-0.5 text-xs font-semibold outline-none ${t.status === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => removeTld(t.tld)}
                    className="text-slate-400 transition hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                  >
                    <Trash2 className="inline-block h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {tlds.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No TLDs configured yet. Add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
