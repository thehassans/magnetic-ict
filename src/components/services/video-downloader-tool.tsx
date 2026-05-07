"use client";

import Image from "next/image";
import { Download, LoaderCircle, Music4, PlayCircle, RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/* ── Types ── */
type VideoDownloadOption = {
  id: string;
  label: string;
  quality: string;
  extension: string;
  note: string;
};

type VideoInspectionResult = {
  platform: "youtube" | "instagram" | "facebook";
  sourceUrl: string;
  title: string;
  thumbnail: string | null;
  durationSeconds: number | null;
  uploader: string | null;
  formats: {
    mp4: VideoDownloadOption[];
    mp3: VideoDownloadOption[];
  };
};

type Platform = "youtube" | "instagram" | "facebook" | null;

/* ── Helpers ── */
function detectPlatform(raw: string): Platform {
  try {
    const url = new URL(raw.trim());
    const host = url.hostname.replace(/^www\./, "");
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("facebook.com") || host.includes("fb.com") || host.includes("fb.watch")) return "facebook";
  } catch {
    // not a valid URL yet
  }
  return null;
}

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

const PLATFORM_META: Record<
  NonNullable<Platform>,
  { label: string; color: string; dot: string; icon: string }
> = {
  youtube: {
    label: "YouTube",
    color: "text-red-500 dark:text-red-400",
    dot: "bg-red-500",
    icon: "▶",
  },
  instagram: {
    label: "Instagram",
    color: "text-fuchsia-500 dark:text-fuchsia-400",
    dot: "bg-gradient-to-br from-fuchsia-500 to-orange-400",
    icon: "◉",
  },
  facebook: {
    label: "Facebook",
    color: "text-blue-500 dark:text-blue-400",
    dot: "bg-blue-500",
    icon: "f",
  },
};

/* ── Component ── */
export function VideoDownloaderTool({ compact = false }: { compact?: boolean }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<VideoInspectionResult | null>(null);
  const [outputType, setOutputType] = useState<"mp4" | "mp3">("mp4");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const detected = detectPlatform(url);
  const meta = detected ? PLATFORM_META[detected] : null;

  const options = useMemo(() => {
    if (!result) return [] as VideoDownloadOption[];
    return outputType === "mp4" ? result.formats.mp4 : result.formats.mp3;
  }, [outputType, result]);

  const selectedOption =
    options.find((o) => o.id === selectedOptionId) ?? options[0] ?? null;

  async function inspect() {
    if (!url.trim() || !detected) return;
    setIsInspecting(true);
    setError(null);
    setStatus("Analyzing source…");
    try {
      const res = await fetch("/api/video-downloader/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        result?: VideoInspectionResult;
      };
      if (!res.ok || !payload.result)
        throw new Error(payload.error ?? "Unable to inspect this link.");
      setResult(payload.result);
      setOutputType("mp4");
      setSelectedOptionId(
        payload.result.formats.mp4[0]?.id ??
          payload.result.formats.mp3[0]?.id ??
          null
      );
      setStatus("Ready — choose a format and download.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to inspect this link.";
      setError(msg);
      setStatus(null);
    } finally {
      setIsInspecting(false);
    }
  }

  async function startDownload() {
    if (!result || !selectedOption) return;
    setIsDownloading(true);
    setError(null);
    setStatus("Preparing file…");
    try {
      const res = await fetch("/api/video-downloader/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: result.sourceUrl,
          outputType,
          quality: selectedOption.quality,
          formatId: outputType === "mp4" ? selectedOption.id : undefined,
        }),
      });
      if (!res.ok) {
        const p = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(p.error ?? "Download failed.");
      }
      const blob = await res.blob();
      const header = res.headers.get("Content-Disposition");
      const match = header?.match(/filename="?([^"]+)"?$/i);
      const name =
        match?.[1] ??
        `${result.title.replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-")}.${outputType}`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatus("Download started.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Download failed.";
      setError(msg);
      setStatus(null);
    } finally {
      setIsDownloading(false);
    }
  }

  function reset() {
    setUrl("");
    setResult(null);
    setOutputType("mp4");
    setSelectedOptionId(null);
    setError(null);
    setStatus(null);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      {/* ── Input card ── */}
      <div className="relative rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_4px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-[0_4px_40px_rgba(0,0,0,0.3)]">
        {/* Platform pill — shows as user types a valid URL */}
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
            Paste link
          </span>
          {meta && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all",
                detected === "youtube" &&
                  "border-red-200 bg-red-50 text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400",
                detected === "instagram" &&
                  "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-600 dark:border-fuchsia-400/20 dark:bg-fuchsia-400/10 dark:text-fuchsia-400",
                detected === "facebook" &&
                  "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
              {meta.label} detected
            </span>
          )}
        </div>

        {/* URL input */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (result) reset();
              }}
              onKeyDown={(e) => e.key === "Enter" && detected && !isInspecting && inspect()}
              placeholder="https://youtube.com/watch?v=…"
              className="h-12 w-full rounded-2xl border border-slate-200/80 bg-slate-50/60 pl-4 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/10"
            />
            {url && (
              <button
                onClick={reset}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={inspect}
            disabled={!detected || isInspecting}
            className={cn(
              "inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-semibold transition-all",
              detected && !isInspecting
                ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100"
                : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/[0.05] dark:text-slate-600"
            )}
          >
            {isInspecting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : null}
            {isInspecting ? "Analyzing" : "Analyze"}
          </button>
        </div>

        {/* Status / Error */}
        {(status || error) && (
          <p
            className={cn(
              "mt-3 text-xs leading-relaxed",
              error
                ? "text-rose-500 dark:text-rose-400"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            {error ?? status}
          </p>
        )}

        {/* Supported platforms hint */}
        {!detected && !result && (
          <div className="mt-5 flex items-center gap-4">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Supports</span>
            <div className="flex items-center gap-3">
              {(["youtube", "instagram", "facebook"] as const).map((p) => (
                <span
                  key={p}
                  className="text-[11px] font-medium capitalize text-slate-500 dark:text-slate-400"
                >
                  {PLATFORM_META[p].label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Preview card — only after inspect ── */}
      {result && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_4px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-[0_4px_40px_rgba(0,0,0,0.3)]">
          {/* Thumbnail */}
          <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
            {result.thumbnail ? (
              <Image
                src={result.thumbnail}
                alt={result.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-xl font-bold text-white shadow-xl">
                  {result.platform[0].toUpperCase()}
                </div>
              </div>
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            {/* Meta overlay */}
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.28em]",
                  PLATFORM_META[result.platform].color
                )}
              >
                {PLATFORM_META[result.platform].label}
              </span>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-white line-clamp-2">
                {result.title}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-3 divide-x divide-slate-200/70 border-t border-slate-200/70 dark:divide-white/[0.06] dark:border-white/[0.06]">
            {[
              { label: "Duration", value: formatDuration(result.durationSeconds) },
              { label: "Channel", value: result.uploader ?? "—" },
              { label: "Formats", value: `${result.formats.mp4.length + result.formats.mp3.length}` },
            ].map((tile) => (
              <div key={tile.label} className="px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  {tile.label}
                </p>
                <p className="mt-1.5 truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {tile.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Format picker — only after inspect ── */}
      {result && (
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_4px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04] dark:shadow-[0_4px_40px_rgba(0,0,0,0.3)]">
          {/* MP4 / MP3 toggle */}
          <div className="mb-4 flex gap-2">
            {(["mp4", "mp3"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setOutputType(type);
                  setSelectedOptionId(
                    result.formats[type][0]?.id ?? null
                  );
                }}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold uppercase tracking-[0.18em] transition-all",
                  outputType === type
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/[0.1]"
                )}
              >
                {type === "mp4" ? (
                  <PlayCircle className="h-3.5 w-3.5" />
                ) : (
                  <Music4 className="h-3.5 w-3.5" />
                )}
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Quality options */}
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOptionId(option.id)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition-all",
                  selectedOption?.id === option.id
                    ? "border-indigo-300 bg-indigo-50/80 dark:border-indigo-500/30 dark:bg-indigo-500/10"
                    : "border-slate-200/70 bg-slate-50/50 hover:border-slate-300 hover:bg-white dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.12] dark:hover:bg-white/[0.05]"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-semibold",
                    selectedOption?.id === option.id
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-slate-800 dark:text-slate-200"
                  )}
                >
                  {option.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {option.note}
                </p>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={startDownload}
              disabled={!selectedOption || isDownloading}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all",
                !selectedOption || isDownloading
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/[0.05] dark:text-slate-600"
                  : "bg-slate-950 text-white shadow-lg shadow-slate-950/10 hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100"
              )}
            >
              {isDownloading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isDownloading ? "Preparing…" : "Download"}
            </button>
            <button
              onClick={reset}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50/60 text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-700 dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-white/[0.14] dark:hover:bg-white/[0.07] dark:hover:text-slate-200"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
