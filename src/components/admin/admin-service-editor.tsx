"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ServiceOverride } from "@/lib/service-overrides";

export function AdminServiceEditor({ service, disabled }: { service: ServiceOverride; disabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description);
  const [category, setCategory] = useState(service.category);
  const [imageLabel, setImageLabel] = useState(service.imageLabel);
  const [imageUrl, setImageUrl] = useState(service.imageUrl);
  const [tiers, setTiers] = useState(service.tiers.map((tier) => ({ catalogKey: tier.id, name: tier.name, price: tier.price })));
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleImageUpload(file: File | null) {
    if (!file) {
      return;
    }

    setMessage("");
    setIsError(false);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/admin/services/${service.id}/image`, {
        method: "POST",
        body: formData
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; imageUrl?: string; message?: string };

      if (!response.ok || !payload.imageUrl) {
        setIsError(true);
        setMessage(payload.error ?? "Unable to upload this image right now.");
        return;
      }

      setImageUrl(payload.imageUrl);
      setIsError(false);
      setMessage(payload.message ?? "Service image uploaded.");
      router.refresh();
    });
  }

  function handleImageRemove() {
    setMessage("");
    setIsError(false);

    startTransition(async () => {
      const response = await fetch(`/api/admin/services/${service.id}/image`, {
        method: "DELETE"
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

      if (!response.ok) {
        setIsError(true);
        setMessage(payload.error ?? "Unable to remove this image right now.");
        return;
      }

      setImageUrl(null);
      setIsError(false);
      setMessage(payload.message ?? "Service image removed.");
      router.refresh();
    });
  }

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
          imageLabel,
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
        <Field label="Image label" value={imageLabel} onChange={setImageLabel} />
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
        <div className="md:col-span-2 rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-700">Service image</div>
              <div className="mt-1 text-sm text-slate-500">Uploads are converted to WebP for the storefront.</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={disabled || isPending}
                  onChange={(event) => {
                    handleImageUpload(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={handleImageRemove}
                disabled={disabled || isPending || !imageUrl}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove image
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
            {imageUrl ? (
              <div className="relative aspect-[16/9] w-full">
                <Image src={imageUrl} alt={name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 560px" unoptimized />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center px-6 text-center text-sm text-slate-500">
                No uploaded image yet.
              </div>
            )}
          </div>
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
