"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceOverride } from "@/lib/service-overrides";

export function AdminServiceEditor({ service, disabled }: { service: ServiceOverride; disabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [category, setCategory] = useState(service.category);
  const [tiers, setTiers] = useState(service.tiers.map((tier) => ({ catalogKey: tier.id, name: tier.name, price: tier.price })));
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setMessage("");
    setIsError(false);

    startTransition(async () => {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          description,
          category,
          tiers
        })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setIsError(true);
        setMessage(payload.error ?? "Unable to save service updates right now.");
        return;
      }

      setIsError(false);
      setMessage("Service settings saved.");
      router.refresh();
    });
  }

  return (
    <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Service name" value={name} onChange={setName} />
        <Field label="Category" value={category} onChange={setCategory} />
        <div className="md:col-span-2">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-700">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className="w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <div key={tier.catalogKey} className="rounded-[22px] border border-slate-200 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{tier.catalogKey}</div>
            <div className="mt-4 space-y-3">
              <Field
                label="Tier name"
                value={tier.name}
                onChange={(value) =>
                  setTiers((current) => current.map((entry, currentIndex) => (currentIndex === index ? { ...entry, name: value as typeof tier.name } : entry)))
                }
              />
              <Field
                label="Price"
                type="number"
                value={String(tier.price)}
                onChange={(value) =>
                  setTiers((current) => current.map((entry, currentIndex) => (currentIndex === index ? { ...entry, price: Number(value) || 0 } : entry)))
                }
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || isPending}
          className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save service"}
        </button>
        {message ? <p className={`text-sm ${isError ? "text-rose-600" : "text-emerald-600"}`}>{message}</p> : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="space-y-2 text-sm">
      <span className="font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950"
      />
    </label>
  );
}
