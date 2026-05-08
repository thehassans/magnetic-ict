"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ImageIcon, LoaderCircle, RefreshCw, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getImageOutputFormatConfig, imageOutputFormats, imageResizeModes, type ImageOutputFormat, type ImageResizeMode } from "@/lib/image-conversion";
import { cn } from "@/lib/utils";

type ClientImageInfo = { width: number; height: number; };

async function readImageDimensions(fileOrUrl: File|string): Promise<ClientImageInfo> {
  const src = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  try {
    return await new Promise<ClientImageInfo>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Unable to load image"));
      img.src = src;
    });
  } finally { if (typeof fileOrUrl !== "string") URL.revokeObjectURL(src); }
}

export function ImageConversionTool({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement|null>(null);
  const [selectedFile, setSelectedFile] = useState<File|null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string|null>(null);
  const [sourceInfo, setSourceInfo] = useState<ClientImageInfo|null>(null);
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string|null>(null);
  const [resultInfo, setResultInfo] = useState<ClientImageInfo|null>(null);
  const [resultFileName, setResultFileName] = useState<string|null>(null);
  const [resultBlob, setResultBlob] = useState<Blob|null>(null);
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>("png");
  const [resizeMode, setResizeMode] = useState<ImageResizeMode>("inside");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [status, setStatus] = useState<string|null>(null);

  useEffect(() => {
    if (!selectedFile) { setSourcePreviewUrl(null); setSourceInfo(null); return; }
    const url = URL.createObjectURL(selectedFile);
    setSourcePreviewUrl(url);
    readImageDimensions(selectedFile).then((info) => { setSourceInfo(info); setWidth((c) => c || String(info.width)); setHeight((c) => c || String(info.height)); }).catch(() => setSourceInfo(null));
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => { return () => { if (resultPreviewUrl) URL.revokeObjectURL(resultPreviewUrl); }; }, [resultPreviewUrl]);

  function resetResult() { if (resultPreviewUrl) URL.revokeObjectURL(resultPreviewUrl); setResultPreviewUrl(null); setResultInfo(null); setResultBlob(null); setResultFileName(null); }

  function handleFile(file: File|null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    resetResult(); setSelectedFile(file); setError(null); setStatus("Image ready — configure and convert.");
  }

  async function processImage() {
    if (!selectedFile) { setError("Upload an image first."); return; }
    setIsProcessing(true); setError(null); setStatus("Processing…");
    const fd = new FormData();
    fd.append("file", selectedFile); fd.append("outputFormat", outputFormat); fd.append("resizeMode", resizeMode); fd.append("quality", String(quality));
    if (width.trim()) fd.append("width", width.trim());
    if (height.trim()) fd.append("height", height.trim());
    try {
      const res = await fetch("/api/image-conversion", { method: "POST", body: fd });
      if (!res.ok) { const p = (await res.json().catch(()=>({}))) as {error?:string}; throw new Error(p.error??"Unable to process this image."); }
      const blob = await res.blob();
      const fnHeader = res.headers.get("X-Output-File-Name");
      const fname = fnHeader ? decodeURIComponent(fnHeader) : `converted.${getImageOutputFormatConfig(outputFormat).extension}`;
      resetResult(); setResultBlob(blob); setResultPreviewUrl(URL.createObjectURL(blob)); setResultFileName(fname);
      setResultInfo({ width: Number(res.headers.get("X-Output-Width")??0), height: Number(res.headers.get("X-Output-Height")??0) });
      setStatus("Conversion complete — ready to download.");
    } catch (e) { const msg = e instanceof Error ? e.message : "Unable to process."; setError(msg); setStatus(null); }
    finally { setIsProcessing(false); }
  }

  function downloadResult() {
    if (!resultBlob || !resultFileName) return;
    const link = document.createElement("a"); link.href = URL.createObjectURL(resultBlob); link.download = resultFileName; document.body.appendChild(link); link.click(); link.remove();
  }

  function resetAll() { resetResult(); setSelectedFile(null); setSourceInfo(null); setWidth(""); setHeight(""); setQuality(90); setResizeMode("inside"); setOutputFormat("png"); setError(null); setStatus(null); }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      {/* Upload card */}
      <div
        onDragEnter={(e)=>{e.preventDefault();setIsDragging(true);}} onDragLeave={(e)=>{e.preventDefault();setIsDragging(false);}} onDragOver={(e)=>e.preventDefault()}
        onDrop={(e)=>{e.preventDefault();setIsDragging(false);handleFile(e.dataTransfer.files?.[0]??null);}}
        className={cn("rounded-3xl border p-6 shadow-[0_4px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl transition dark:shadow-[0_4px_40px_rgba(0,0,0,0.3)]",
          isDragging?"border-indigo-300 bg-indigo-50/80 dark:border-indigo-500/30 dark:bg-indigo-500/10":"border-slate-200/70 bg-white/90 dark:border-white/[0.07] dark:bg-white/[0.04]")}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Upload image</span>
          {selectedFile && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              <ImageIcon className="h-3 w-3"/> Image loaded
            </span>
          )}
        </div>

        <div className={cn("mb-5 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-8 transition",
          isDragging?"border-indigo-400":"border-slate-200 dark:border-white/[0.08]")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <ImageIcon className="h-6 w-6 text-white"/>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedFile ? selectedFile.name : "Drop image here"}</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {selectedFile && sourceInfo ? `${sourceInfo.width}×${sourceInfo.height}px · ${(selectedFile.size/(1024*1024)).toFixed(2)} MB` : "JPG, PNG, WebP, AVIF, GIF, TIFF"}
            </p>
          </div>
        </div>

        {(status||error) && <p className={cn("mb-4 text-xs",error?"text-rose-500 dark:text-rose-400":"text-slate-500 dark:text-slate-400")}>{error??status}</p>}

        <div className="flex gap-3">
          <button onClick={()=>inputRef.current?.click()} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/60 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.07]">
            <Upload className="h-4 w-4"/> Choose image
          </button>
          <button onClick={processImage} disabled={!selectedFile||isProcessing}
            className={cn("inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition-all",
              selectedFile&&!isProcessing?"bg-slate-950 text-white shadow-lg hover:bg-emerald-600 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-100":"cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/[0.05] dark:text-slate-600")}>
            {isProcessing?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}
            {isProcessing?"Converting…":"Convert"}
          </button>
          {selectedFile && (
            <button onClick={resetAll} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50/60 text-slate-500 transition hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/[0.07]">
              <RefreshCw className="h-4 w-4"/>
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{handleFile(e.target.files?.[0]??null);e.currentTarget.value="";}}/>
      </div>

      {/* Settings card — only after file loaded */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div key="settings" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
            className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_4px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-white/[0.07] dark:bg-white/[0.04]">

            {/* Format */}
            <div className="mb-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Output format</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {imageOutputFormats.map((f) => (
                  <button key={f.id} onClick={()=>setOutputFormat(f.id)}
                    className={cn("rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      outputFormat===f.id?"border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300":"border-slate-200/70 bg-slate-50/60 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05]")}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resize mode */}
            <div className="mb-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Resize mode</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {imageResizeModes.map((m) => (
                  <button key={m.id} onClick={()=>setResizeMode(m.id)}
                    className={cn("rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      resizeMode===m.id?"border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300":"border-slate-200/70 bg-slate-50/60 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-slate-400 dark:hover:bg-white/[0.05]")}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* W / H / Quality */}
            <div className="grid grid-cols-3 gap-3">
              {[{label:"Width",val:width,set:setWidth},{label:"Height",val:height,set:setHeight}].map(({label,val,set})=>(
                <label key={label} className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{label}</p>
                  <input inputMode="numeric" value={val} onChange={(e)=>set(e.target.value.replace(/[^0-9]/g,""))} placeholder="Auto"
                    className="mt-2 h-9 w-full rounded-xl border border-slate-200/80 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-white"/>
                </label>
              ))}
              <label className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Quality</p>
                <input type="range" min={40} max={100} step={1} value={quality} onChange={(e)=>setQuality(Number(e.target.value))} className="mt-3 w-full accent-indigo-500"/>
                <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">{quality}%</p>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview comparison — original + converted */}
      <AnimatePresence>
        {sourcePreviewUrl && (
          <motion.div key="previews" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.35,delay:0.05,ease:[0.22,1,0.36,1]}}
            className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-[0_4px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl overflow-hidden dark:border-white/[0.07] dark:bg-white/[0.04]">

            {/* Original */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
              <Image src={sourcePreviewUrl} alt="Original" fill className="object-contain p-2" sizes="(max-width:768px) 100vw, 672px" unoptimized/>
              <div className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                Original{sourceInfo ? ` · ${sourceInfo.width}×${sourceInfo.height}px` : ""}
              </div>
            </div>

            {/* Converted */}
            <AnimatePresence>
              {resultPreviewUrl && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="relative overflow-hidden border-t border-slate-200/70 dark:border-white/[0.06]">
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <Image src={resultPreviewUrl} alt="Converted" fill className="object-contain p-2" sizes="(max-width:768px) 100vw, 672px" unoptimized/>
                    <div className="absolute bottom-3 left-3 rounded-full bg-emerald-600/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                      Converted{resultInfo ? ` · ${resultInfo.width}×${resultInfo.height}px` : ""}
                    </div>
                  </div>
                  <div className="border-t border-slate-200/70 p-4 dark:border-white/[0.06]">
                    <button onClick={downloadResult} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-100">
                      <Download className="h-4 w-4"/> Download {resultFileName ?? "image"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
