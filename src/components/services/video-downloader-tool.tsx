"use client";

import Image from "next/image";
import { Download, LoaderCircle, Music4, PlayCircle, RefreshCw, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

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

function formatDuration(seconds: number | null) {
  if (!seconds || seconds <= 0) {
    return "Unknown";
  }

  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainder = total % 60;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function VideoDownloaderTool({ compact = false }: { compact?: boolean }) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<VideoInspectionResult | null>(null);
  const [outputType, setOutputType] = useState<"mp4" | "mp3">("mp4");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState(compact ? "Paste a link." : "Paste a YouTube, Instagram, or Facebook link to inspect available downloads.");
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => {
    if (!result) {
      return [] as VideoDownloadOption[];
    }

    return outputType === "mp4" ? result.formats.mp4 : result.formats.mp3;
  }, [outputType, result]);

  const selectedOption = options.find((option) => option.id === selectedOptionId) ?? options[0] ?? null;

  async function inspect() {
    if (!url.trim()) {
      setError("Paste a supported video URL first.");
      return;
    }

    setIsInspecting(true);
    setError(null);
    setMessage(compact ? "Inspecting..." : "Inspecting the source, reading available formats, and preparing quality choices.");

    try {
      const response = await fetch("/api/video-downloader/inspect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; result?: VideoInspectionResult };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "Unable to inspect this link right now.");
      }

      setResult(payload.result);
      setOutputType("mp4");
      setSelectedOptionId(payload.result.formats.mp4[0]?.id ?? payload.result.formats.mp3[0]?.id ?? null);
      setMessage(compact ? "Ready." : "Source analyzed. Choose MP4 or MP3, select a quality, and start the download.");
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : "Unable to inspect this link right now.";
      setError(nextError);
      setMessage(nextError);
    } finally {
      setIsInspecting(false);
    }
  }

  async function startDownload() {
    if (!result || !selectedOption) {
      setError("Inspect a link and choose a format first.");
      return;
    }

    setIsDownloading(true);
    setError(null);
    setMessage(compact ? "Downloading..." : "Preparing your file and streaming the selected quality.");

    try {
      const response = await fetch("/api/video-downloader/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: result.sourceUrl,
          outputType,
          quality: selectedOption.quality,
          formatId: outputType === "mp4" ? selectedOption.id : undefined
        })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Unable to create this download right now.");
      }

      const blob = await response.blob();
      const header = response.headers.get("Content-Disposition");
      const fileNameMatch = header?.match(/filename="?([^\"]+)"?$/i);
      const downloadName = fileNameMatch?.[1] ?? `${result.title.replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-")}.${outputType}`;
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      setMessage(compact ? "Done." : "Download started successfully.");
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : "Unable to create this download right now.";
      setError(nextError);
      setMessage(nextError);
    } finally {
      setIsDownloading(false);
    }
  }

  function resetAll() {
    setUrl("");
    setResult(null);
    setOutputType("mp4");
    setSelectedOptionId(null);
    setError(null);
    setMessage(compact ? "Paste a link." : "Paste a YouTube, Instagram, or Facebook link to inspect available downloads.");
  }

  return (
    <div className={cn("space-y-8", compact && "space-y-5")}>
      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div className={cn("rounded-[36px] border border-violet-100 bg-white/90 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70", compact ? "p-4 sm:p-5" : "p-6 sm:p-8")}>
          {!compact ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Premium downloader
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
                <PlayCircle className="h-4 w-4" />
                MP4 and MP3 options
              </div>
            </div>
          ) : null}

          <div className={cn(compact ? "mt-1" : "mt-6", "rounded-[30px] border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5 sm:p-6")}>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Paste source link</label>
              <div className="flex flex-col gap-3 lg:flex-row">
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-cyan-300 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
                />
                <button
                  type="button"
                  onClick={inspect}
                  disabled={isInspecting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isInspecting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {isInspecting ? "Inspecting" : "Inspect link"}
                </button>
              </div>
              <p className={cn("text-sm", error ? "text-rose-600" : "text-slate-500 dark:text-slate-400")}>{message}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Platforms</div>
              <div className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">3</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">YouTube, Instagram, Facebook</div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Output</div>
              <div className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">MP4 / MP3</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quality-aware delivery</div>
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Flow</div>
              <div className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">Inspect</div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Preview, pick, download</div>
            </div>
          </div>
        </div>

        <div className={cn("rounded-[36px] border border-violet-100 bg-white/90 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70", compact ? "p-4 sm:p-5" : "p-6 sm:p-8")}>
          <div>
            {!compact ? <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Source preview</div> : null}
            <h2 className={cn("font-semibold text-slate-950 dark:text-white", compact ? "text-lg" : "mt-3 text-2xl")}>{compact ? "Preview" : result ? result.title : "Inspect a link to preview the source"}</h2>
          </div>

          <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
            <div className="relative aspect-video overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_30%),#eff6ff] dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_30%),rgba(15,23,42,0.8)]">
              {result?.thumbnail ? (
                <Image src={result.thumbnail} alt={result.title} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 40vw" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-cyan-400 text-2xl font-semibold text-white shadow-glow">VD</div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
              {result ? (
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="text-xs uppercase tracking-[0.24em] text-cyan-100">{result.platform}</div>
                  <div className="mt-3 text-xl font-semibold sm:text-2xl">{result.title}</div>
                </div>
              ) : null}
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <InfoTile label="Duration" value={result ? formatDuration(result.durationSeconds) : "-"} />
              <InfoTile label="Channel" value={result?.uploader ?? "-"} />
              <InfoTile label="Formats" value={result ? `${result.formats.mp4.length} video / ${result.formats.mp3.length} audio` : "-"} />
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <section className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setOutputType("mp4");
                setSelectedOptionId(result.formats.mp4[0]?.id ?? null);
              }}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition",
                outputType === "mp4"
                  ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200"
                  : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              )}
            >
              <PlayCircle className="h-4 w-4" />
              MP4 video
            </button>
            <button
              type="button"
              onClick={() => {
                setOutputType("mp3");
                setSelectedOptionId(result.formats.mp3[0]?.id ?? null);
              }}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition",
                outputType === "mp3"
                  ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200"
                  : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              )}
            >
              <Music4 className="h-4 w-4" />
              MP3 audio
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOptionId(option.id)}
                  className={cn(
                    "rounded-[28px] border px-5 py-5 text-left transition",
                    selectedOption?.id === option.id
                      ? "border-cyan-300 bg-cyan-50 text-cyan-800 shadow-[0_16px_40px_rgba(6,182,212,0.12)] dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-100"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-white/5"
                  )}
                >
                  <div className="text-xs uppercase tracking-[0.22em] opacity-70">{outputType}</div>
                  <div className="mt-3 text-xl font-semibold">{option.label}</div>
                  <div className="mt-2 text-sm opacity-80">{option.note}</div>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[220px]">
              <button
                type="button"
                onClick={startDownload}
                disabled={!selectedOption || isDownloading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDownloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isDownloading ? "Preparing" : "Download now"}
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-slate-950/50">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</div>
    </div>
  );
}
