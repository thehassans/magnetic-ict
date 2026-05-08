"use client";

import { Download, FileVideo2, ImageIcon, LoaderCircle, RefreshCw, Sparkles, Upload } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AiDetectionSignal = { label: string; value: string; impact: "high"|"medium"|"low"; direction: "synthetic"|"authentic"|"neutral"; rationale: string; };
type AiDetectionFrame = { timecode: string; score: number; };
type AiDetectionResult = { mediaType: "image"|"video"; fileName: string; verdict: "LIKELY_SYNTHETIC"|"POSSIBLY_SYNTHETIC"|"LIKELY_AUTHENTIC"|"INSUFFICIENT_SIGNAL"; confidence: number; summary: string; signalScore: number; metadata: Record<string,string>; signals: AiDetectionSignal[]; sampledFrames: AiDetectionFrame[]; modelAssisted: boolean; disclaimer: string; };

const verdictConfig = {
  LIKELY_SYNTHETIC:    { label: "Looks AI-generated", bar: "bg-rose-500",    badge: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300" },
  POSSIBLY_SYNTHETIC:  { label: "May be AI-generated",bar: "bg-amber-500",   badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300" },
  LIKELY_AUTHENTIC:    { label: "Looks authentic",     bar: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300" },
  INSUFFICIENT_SIGNAL: { label: "Insufficient signal", bar: "bg-slate-400",   badge: "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300" },
} as const;

export function AiDetectionTool({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement|null>(null);
  const [selectedFile, setSelectedFile] = useState<File|null>(null);
  const [previewUrl, setPreviewUrl] = useState<string|null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiDetectionResult|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [status, setStatus] = useState<string|null>(null);

  useEffect(() => {
    if (!selectedFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const isVideo = selectedFile?.type.startsWith("video/") ?? false;
  const verdict = result ? verdictConfig[result.verdict] : null;
  const mainSignal = result?.signals.find((s) => s.direction !== "neutral") ?? result?.signals[0] ?? null;

  function handleFile(file: File|null) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) { setError("Choose an image or video file."); return; }
    setSelectedFile(file); setResult(null); setError(null); setStatus("Media loaded — ready to analyze.");
  }

  async function analyze() {
    if (!selectedFile) { setError("Upload a file first."); return; }
    setIsAnalyzing(true); setError(null); setStatus("Running forensic scan…");
    try {
      const fd = new FormData(); fd.append("file", selectedFile);
      const res = await fetch("/api/ai-detection", { method: "POST", body: fd });
      const payload = (await res.json().catch(() => ({}))) as { error?: string; result?: AiDetectionResult };
      if (!res.ok || !payload.result) throw new Error(payload.error ?? "Unable to analyze this file.");
      setResult(payload.result); setStatus("Analysis complete.");
    } catch (e) { const msg = e instanceof Error ? e.message : "Unable to analyze."; setError(msg); setStatus(null); }
    finally { setIsAnalyzing(false); }
  }

  function downloadReport() {
    if (!result) return;
    const lines = [`MagneticICT AI Detection Report`,`File: ${result.fileName}`,`Verdict: ${verdictConfig[result.verdict].label}`,`Confidence: ${result.confidence}%`,`Summary: ${result.summary}`,"","Signals",...result.signals.map((s) => `- ${s.label}: ${s.value} (${s.direction}) — ${s.rationale}`),"",`Disclaimer: ${result.disclaimer}`];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${result.fileName.replace(/\.[^.]+$/,"")}-ai-report.txt`; document.body.appendChild(link); link.click(); link.remove();
  }

  function reset() { setSelectedFile(null); setResult(null); setError(null); setStatus(null); }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Upload card */}
      <div
        onDragEnter={(e)=>{e.preventDefault();setIsDragging(true);}} onDragLeave={(e)=>{e.preventDefault();setIsDragging(false);}} onDragOver={(e)=>e.preventDefault()}
        onDrop={(e)=>{e.preventDefault();setIsDragging(false);handleFile(e.dataTransfer.files?.[0]??null);}}
        className={cn("relative rounded-3xl border p-6 shadow-[0_4px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl transition dark:shadow-[0_4px_40px_rgba(0,0,0,0.3)]",
          isDragging ? "border-indigo-300 bg-indigo-50/80 dark:border-indigo-500/30 dark:bg-indigo-500/10" : "border-slate-200/70 bg-white/90 dark:border-white/[0.07] dark:bg-white/[0.04]")}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Upload media</span>
          {selectedFile && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
              {isVideo ? <FileVideo2 className="h-3 w-3"/> : <ImageIcon className="h-3 w-3"/>}
              {isVideo ? "Video" : "Image"} loaded
            </span>
          )}
        </div>

        <div className={cn("mb-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-8 transition",
          isDragging ? "border-indigo-400" : "border-slate-200 dark:border-white/[0.08]")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg">
            {isVideo ? <FileVideo2 className="h-6 w-6 text-white"/> : <ImageIcon className="h-6 w-6 text-white"/>}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedFile ? selectedFile.name : "Drop image or video here"}</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{selectedFile ? `${selectedFile.type||"Unknown"} · ${(selectedFile.size/(1024*1024)).toFixed(2)} MB` : "JPG, PNG, MP4, MOV and more"}</p>
          </div>
        </div>

        {(status||error) && <p className={cn("mb-4 text-xs",error?"text-rose-500 dark:text-rose-400":"text-slate-500 dark:text-slate-400")}>{error??status}</p>}

        <div className="flex gap-3">
          <button onClick={()=>inputRef.current?.click()} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/60 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.07]">
            <Upload className="h-4 w-4"/> Choose media
          </button>
          <button onClick={analyze} disabled={!selectedFile||isAnalyzing}
            className={cn("inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all",
              selectedFile&&!isAnalyzing ? "bg-slate-950 text-white shadow-lg hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100" : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/[0.05] dark:text-slate-600")}>
            {isAnalyzing ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
            {isAnalyzing ? "Analyzing…" : "Analyze"}
          </button>
          {selectedFile && (
            <button onClick={reset} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50/60 text-slate-500 transition hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/[0.07]">
              <RefreshCw className="h-4 w-4"/>
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e)=>{handleFile(e.target.files?.[0]??null);e.currentTarget.value="";}}/>
      </div>

      {/* Preview card */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div key="preview" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
            className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_4px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04]">
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
              {isVideo ? <video src={previewUrl} controls className="h-full w-full object-contain"/> :
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={selectedFile?.name??"Preview"} className="h-full w-full object-contain p-2"/>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && verdict && (
          <motion.div key="result" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.35,delay:0.05,ease:[0.22,1,0.36,1]}} className="space-y-4">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_4px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04]">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Verdict</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className={cn("rounded-full border px-3 py-1 text-xs font-bold",verdict.badge)}>{verdict.label}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{result.confidence}% confidence</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{result.summary}</p>
                  {mainSignal && <p className="mt-1.5 text-xs text-slate-500">Main clue: {mainSignal.label}</p>}
                </div>
                <button onClick={downloadReport} className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-200">
                  <Download className="h-3.5 w-3.5"/> Report
                </button>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                <motion.div className={cn("h-full rounded-full",verdict.bar)} initial={{width:"0%"}} animate={{width:`${result.confidence}%`}} transition={{duration:0.8,ease:"easeOut"}}/>
              </div>
              <p className="mt-1.5 text-right text-[11px] text-slate-400 dark:text-slate-500">Signal score: {result.signalScore}/100</p>
            </div>

            {result.signals.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {result.signals.map((signal) => (
                  <div key={`${signal.label}-${signal.value}`} className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.03]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{signal.label}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        signal.direction==="synthetic"?"bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300":signal.direction==="authentic"?"bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300":"bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400")}>{signal.direction}</span>
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">{signal.value}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{signal.rationale}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 text-xs leading-relaxed text-slate-500 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400">{result.disclaimer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
