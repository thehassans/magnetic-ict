"use client";

import type { Dispatch, SetStateAction } from "react";
import type { HostingProviderSettings } from "@/lib/hosting-types";

type HostingConfigEditorProps = {
  value: HostingProviderSettings;
  onChange: Dispatch<SetStateAction<HostingProviderSettings>>;
};

export function HostingConfigEditor({ value, onChange }: HostingConfigEditorProps) {
  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-950">Operating systems</div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {value.operatingSystems.map((operatingSystem, index) => (
            <div key={operatingSystem.id} className="rounded-[20px] border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <InputField label="Name" value={operatingSystem.name} onChange={(next) => onChange((current) => ({ ...current, operatingSystems: current.operatingSystems.map((entry, entryIndex) => (entryIndex === index ? { ...entry, name: next } : entry)) }))} />
                <InputField label="Image alias" value={operatingSystem.imageAlias} onChange={(next) => onChange((current) => ({ ...current, operatingSystems: current.operatingSystems.map((entry, entryIndex) => (entryIndex === index ? { ...entry, imageAlias: next } : entry)) }))} />
              </div>
              <label className="mt-3 block space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Description</span>
                <textarea
                  value={operatingSystem.description}
                  onChange={(event) => onChange((current) => ({ ...current, operatingSystems: current.operatingSystems.map((entry, entryIndex) => (entryIndex === index ? { ...entry, description: event.target.value } : entry)) }))}
                  rows={3}
                  className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <ToggleMini label="Enabled" checked={operatingSystem.enabled} onChange={(checked) => onChange((current) => ({ ...current, operatingSystems: current.operatingSystems.map((entry, entryIndex) => (entryIndex === index ? { ...entry, enabled: checked } : entry)) }))} />
                <ToggleMini label="Recommended" checked={operatingSystem.recommended} onChange={(checked) => onChange((current) => ({ ...current, operatingSystems: current.operatingSystems.map((entry, entryIndex) => (entryIndex === index ? { ...entry, recommended: checked } : entry)) }))} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-950">Control panel pricing</div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {value.controlPanels.map((panel, index) => (
            <div key={panel.id} className="rounded-[20px] border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <InputField label="Name" value={panel.name} onChange={(next) => onChange((current) => ({ ...current, controlPanels: current.controlPanels.map((entry, entryIndex) => (entryIndex === index ? { ...entry, name: next } : entry)) }))} />
                <InputField label="Monthly price" value={String(panel.monthlyPrice)} type="number" onChange={(next) => onChange((current) => ({ ...current, controlPanels: current.controlPanels.map((entry, entryIndex) => (entryIndex === index ? { ...entry, monthlyPrice: Math.max(0, Number(next) || 0) } : entry)) }))} />
              </div>
              <label className="mt-3 block space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Description</span>
                <textarea
                  value={panel.description}
                  onChange={(event) => onChange((current) => ({ ...current, controlPanels: current.controlPanels.map((entry, entryIndex) => (entryIndex === index ? { ...entry, description: event.target.value } : entry)) }))}
                  rows={3}
                  className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <ToggleMini label="Enabled" checked={panel.enabled} onChange={(checked) => onChange((current) => ({ ...current, controlPanels: current.controlPanels.map((entry, entryIndex) => (entryIndex === index ? { ...entry, enabled: checked } : entry)) }))} />
                <ToggleMini label="Recommended" checked={panel.recommended} onChange={(checked) => onChange((current) => ({ ...current, controlPanels: current.controlPanels.map((entry, entryIndex) => (entryIndex === index ? { ...entry, recommended: checked } : entry)) }))} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-950">Managed add-ons</div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {value.addons.map((addon, index) => (
            <div key={addon.id} className="rounded-[20px] border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <InputField label="Name" value={addon.name} onChange={(next) => onChange((current) => ({ ...current, addons: current.addons.map((entry, entryIndex) => (entryIndex === index ? { ...entry, name: next } : entry)) }))} />
                <InputField label="Monthly price" value={String(addon.monthlyPrice)} type="number" onChange={(next) => onChange((current) => ({ ...current, addons: current.addons.map((entry, entryIndex) => (entryIndex === index ? { ...entry, monthlyPrice: Math.max(0, Number(next) || 0) } : entry)) }))} />
              </div>
              <label className="mt-3 block space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Description</span>
                <textarea
                  value={addon.description}
                  onChange={(event) => onChange((current) => ({ ...current, addons: current.addons.map((entry, entryIndex) => (entryIndex === index ? { ...entry, description: event.target.value } : entry)) }))}
                  rows={3}
                  className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <ToggleMini label="Enabled" checked={addon.enabled} onChange={(checked) => onChange((current) => ({ ...current, addons: current.addons.map((entry, entryIndex) => (entryIndex === index ? { ...entry, enabled: checked } : entry)) }))} />
                <ToggleMini label="Default selected" checked={addon.defaultSelected} onChange={(checked) => onChange((current) => ({ ...current, addons: current.addons.map((entry, entryIndex) => (entryIndex === index ? { ...entry, defaultSelected: checked } : entry)) }))} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-950">Regions</div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {value.locations.map((location, index) => (
            <div key={location.id} className="rounded-[20px] border border-slate-200 bg-white p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <InputField label="Name" value={location.name} onChange={(next) => onChange((current) => ({ ...current, locations: current.locations.map((entry, entryIndex) => (entryIndex === index ? { ...entry, name: next } : entry)) }))} />
                <InputField label="Provider location value" value={location.value} onChange={(next) => onChange((current) => ({ ...current, locations: current.locations.map((entry, entryIndex) => (entryIndex === index ? { ...entry, value: next } : entry)) }))} />
              </div>
              <label className="mt-3 block space-y-2 text-sm">
                <span className="font-semibold text-slate-700">Description</span>
                <textarea
                  value={location.description}
                  onChange={(event) => onChange((current) => ({ ...current, locations: current.locations.map((entry, entryIndex) => (entryIndex === index ? { ...entry, description: event.target.value } : entry)) }))}
                  rows={3}
                  className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
                />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <ToggleMini label="Enabled" checked={location.enabled} onChange={(checked) => onChange((current) => ({ ...current, locations: current.locations.map((entry, entryIndex) => (entryIndex === index ? { ...entry, enabled: checked } : entry)) }))} />
                <ToggleMini label="Recommended" checked={location.recommended} onChange={(checked) => onChange((current) => ({ ...current, locations: current.locations.map((entry, entryIndex) => (entryIndex === index ? { ...entry, recommended: checked } : entry)) }))} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InputField({
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
        className="h-11 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:bg-white"
      />
    </label>
  );
}

function ToggleMini({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`rounded-[18px] border px-4 py-3 text-left text-sm transition ${checked ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"}`}
    >
      <div className="font-semibold">{label}</div>
      <div className={`mt-1 text-[11px] uppercase tracking-[0.22em] ${checked ? "text-white/70" : "text-slate-500"}`}>{checked ? "Enabled" : "Disabled"}</div>
    </button>
  );
}
