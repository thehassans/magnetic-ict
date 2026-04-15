"use client";

import { Download, FileVideo2, ImageIcon, LoaderCircle, RefreshCw, ShieldAlert, Sparkles, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AiDetectionSignal = {
  label: string;
  value: string;
  impact: "high" | "medium" | "low";
  direction: "synthetic" | "authentic" | "neutral";
  rationale: string;
};

type AiDetectionFrame = {
  timecode: string;
  score: number;
};

type AiDetectionResult = {
  mediaType: "image" | "video";
  fileName: string;
  verdict: "LIKELY_SYNTHETIC" | "POSSIBLY_SYNTHETIC" | "LIKELY_AUTHENTIC" | "INSUFFICIENT_SIGNAL";
  confidence: number;
  summary: string;
  signalScore: number;
  metadata: Record<string, string>;
  signals: AiDetectionSignal[];
  sampledFrames: AiDetectionFrame[];
  modelAssisted: boolean;
  disclaimer: string;
};

const verdictConfig = {
  LIKELY_SYNTHETIC: {
    label: "Likely AI-generated",
    card: "border-rose-200 bg-rose-50/90 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200"
  },
  POSSIBLY_SYNTHETIC: {
    label: "Possibly synthetic",
    card: "border-amber-200 bg-amber-50/90 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200"
  },
  LIKELY_AUTHENTIC: {
    label: "Likely authentic",
    card: "border-emerald-200 bg-emerald-50/90 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
  },
  INSUFFICIENT_SIGNAL: {
    label: "Insufficient signal",
    card: "border-slate-200 bg-slate-50/90 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
  }
} as const;

export function AiDetectionTool({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiDetectionResult | null>(null);
  const [message, setMessage] = useState(compact ? "Upload image or video." : "Upload an image or video to inspect authenticity signals.");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [selectedFile]);

  const isVideo = selectedFile?.type.startsWith("video/") ?? false;
  const verdict = result ? verdictConfig[result.verdict] : null;
  const stats = useMemo(
    () => [
      { label: "Confidence", value: result ? `${result.confidence}%` : "-" },
      { label: "Signal score", value: result ? `${result.signalScore}/100` : "-" },
      { label: "Reasoning", value: result ? (result.modelAssisted ? "Forensics + Gemini" : "Forensics only") : "-" }
    ],
    [result]
  );

  function handleFile(file: File | null) {
    if (!file) {
      return;
    }

    const allowed = file.type.startsWith("image/") || file.type.startsWith("video/");

    if (!allowed) {
      setError("Choose an image or video file.");
      setMessage("Unsupported media type.");
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setError(null);
    setMessage(compact ? "Ready to analyze." : "Media loaded. Launch the forensic scan to inspect authenticity signals.");
  }

  async function analyze() {
    if (!selectedFile) {
      setError("Upload a file before starting analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setMessage(compact ? "Analyzing..." : "Running media forensics, sampled-frame review, and confidence scoring.");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/ai-detection", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string; result?: AiDetectionResult };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "Unable to analyze this media right now.");
      }

      setResult(payload.result);
      setMessage(compact ? "Done." : "Analysis complete. Review the verdict, evidence signals, and confidence breakdown.");
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : "Unable to analyze this media right now.";
      setError(nextError);
      setMessage(nextError);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function resetAll() {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setMessage(compact ? "Upload image or video." : "Upload an image or video to inspect authenticity signals.");
  }

  function downloadReport() {
    if (!result) {
      return;
    }

    const lines = [
      `MagneticICT AI Detection Report`,
      `File: ${result.fileName}`,
      `Verdict: ${verdictConfig[result.verdict].label}`,
      `Confidence: ${result.confidence}%`,
      `Signal score: ${result.signalScore}/100`,
      `Summary: ${result.summary}`,
      `Reasoning mode: ${result.modelAssisted ? "Forensics + Gemini" : "Forensics only"}`,
      "",
      "Metadata",
      ...Object.entries(result.metadata).map(([key, value]) => `- ${key}: ${value}`),
      "",
      "Signals",
      ...result.signals.map((signal) => `- ${signal.label}: ${signal.value} (${signal.direction}, ${signal.impact}) — ${signal.rationale}`),
      "",
      `Disclaimer: ${result.disclaimer}`
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.fileName.replace(/\.[^.]+$/, "")}-ai-detection-report.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={cn("space-y-8", compact && "space-y-5")}>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className={cn("rounded-[36px] border border-violet-100 bg-white/90 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70", compact ? "p-4 sm:p-5" : "p-6 sm:p-8")}>
          {!compact ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Authenticity lab
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
                <ShieldAlert className="h-4 w-4" />
                Premium forensic scan
              </div>
            </div>
          ) : null}

          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFile(event.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              compact ? "rounded-[26px] border border-dashed p-4 transition sm:p-5" : "mt-6 rounded-[30px] border border-dashed p-6 transition sm:p-8",
              isDragging
                ? "border-cyan-300 bg-cyan-50/70 dark:border-cyan-400/40 dark:bg-cyan-400/10"
                : "border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/5"
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                {compact ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-950 dark:text-white">{selectedFile?.name ?? "Upload media"}</div>
                    <p className={cn("text-sm", error ? "text-rose-600" : "text-slate-500 dark:text-slate-400")}>{message}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-glow">
                      {isVideo ? <FileVideo2 className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">Upload media and inspect whether it looks synthetic.</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                      This workspace combines local forensic heuristics, metadata signals, sampled-frame analysis, and optional Gemini-assisted reasoning when your admin Gemini key is configured.
                    </p>
                    <p className={cn("mt-4 text-sm", error ? "text-rose-600" : "text-slate-500 dark:text-slate-400")}>{message}</p>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Upload className="h-4 w-4" />
                  {compact ? "Upload" : "Choose media"}
                </button>
                <button
                  type="button"
                  onClick={analyze}
                  disabled={!selectedFile || isAnalyzing}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200"
                >
                  {isAnalyzing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isAnalyzing ? "Analyzing" : compact ? "Analyze" : "Analyze media"}
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  {compact ? "Clear" : "Reset"}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(event) => {
                    handleFile(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{stat.label}</div>
                <div className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("rounded-[36px] border border-violet-100 bg-white/90 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70", compact ? "p-4 sm:p-5" : "p-6 sm:p-8")}>
          <div className="flex items-center justify-between gap-4">
            <div>
              {!compact ? <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Preview panel</div> : null}
              <h2 className={cn("font-semibold text-slate-950 dark:text-white", compact ? "text-lg" : "mt-3 text-2xl")}>{compact ? "Preview" : "Uploaded media"}</h2>
            </div>
            {result ? (
              <button
                type="button"
                onClick={downloadReport}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Download className="h-4 w-4" />
                Report
              </button>
            ) : null}
          </div>

          <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
            <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_30%),#eff6ff] dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_30%),rgba(15,23,42,0.8)]">
              {previewUrl ? (
                isVideo ? (
                  <video src={previewUrl} controls className="h-full w-full object-contain p-4" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt={selectedFile?.name ?? "Preview"} className="h-full w-full object-contain p-4" />
                )
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-cyan-400 text-2xl font-semibold text-white shadow-glow">
                    {isVideo ? "V" : "M"}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2 p-5">
              <div className="text-lg font-semibold text-slate-950 dark:text-white">{selectedFile?.name ?? "No file selected yet"}</div>
              <div className="text-sm leading-7 text-slate-600 dark:text-slate-300">{selectedFile ? `${selectedFile.type || "Unknown type"} • ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "Drop a suspicious image or short video to begin analysis."}</div>
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className={cn("rounded-[34px] border p-6 shadow-glow", verdict?.card)}>
              <div className="text-xs uppercase tracking-[0.26em]">Verdict</div>
              <div className="mt-4 text-3xl font-semibold tracking-tight">{verdict?.label}</div>
              <p className="mt-4 text-sm leading-7">{result.summary}</p>
            </div>

            <div className="rounded-[34px] border border-violet-100 bg-white/90 p-6 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70">
              <div className="text-xs uppercase tracking-[0.26em] text-cyan-700 dark:text-cyan-300">Metadata</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {Object.entries(result.metadata).map(([key, value]) => (
                  <div key={key} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{key}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[34px] border border-violet-100 bg-white/90 p-6 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70">
              <div className="text-xs uppercase tracking-[0.26em] text-cyan-700 dark:text-cyan-300">Signal breakdown</div>
              <div className="mt-5 space-y-4">
                {result.signals.map((signal) => (
                  <div key={`${signal.label}-${signal.value}`} className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-lg font-semibold text-slate-950 dark:text-white">{signal.label}</div>
                      <span className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
                        signal.direction === "synthetic"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200"
                          : signal.direction === "authentic"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200"
                            : "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300"
                      )}>
                        {signal.direction}
                      </span>
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-700 dark:bg-white/10 dark:text-slate-300">
                        {signal.impact}
                      </span>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{signal.value}</div>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{signal.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            {result.sampledFrames.length > 0 ? (
              <div className="rounded-[34px] border border-violet-100 bg-white/90 p-6 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70">
                <div className="text-xs uppercase tracking-[0.26em] text-cyan-700 dark:text-cyan-300">Sampled frame review</div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {result.sampledFrames.map((frame) => (
                    <div key={frame.timecode} className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{frame.timecode}</div>
                      <div className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{frame.score}</div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Synthetic score</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-[34px] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {result.disclaimer}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
