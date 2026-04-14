"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ImageIcon, LoaderCircle, RefreshCw, Sparkles, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getImageOutputFormatConfig, imageOutputFormats, imageResizeModes, type ImageOutputFormat, type ImageResizeMode } from "@/lib/image-conversion";
import { cn } from "@/lib/utils";

type ClientImageInfo = {
  width: number;
  height: number;
};

async function readImageDimensions(fileOrUrl: File | string) {
  const sourceUrl = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);

  try {
    const dimensions = await new Promise<ClientImageInfo>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("Unable to load image"));
      image.src = sourceUrl;
    });

    return dimensions;
  } finally {
    if (typeof fileOrUrl !== "string") {
      URL.revokeObjectURL(sourceUrl);
    }
  }
}

export function ImageConversionTool() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [sourceInfo, setSourceInfo] = useState<ClientImageInfo | null>(null);
  const [resultPreviewUrl, setResultPreviewUrl] = useState<string | null>(null);
  const [resultInfo, setResultInfo] = useState<ClientImageInfo | null>(null);
  const [resultFileName, setResultFileName] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>("png");
  const [resizeMode, setResizeMode] = useState<ImageResizeMode>("inside");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("Upload an image to convert formats and resize dimensions instantly.");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setSourcePreviewUrl(null);
      setSourceInfo(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setSourcePreviewUrl(objectUrl);

    readImageDimensions(selectedFile)
      .then((info) => {
        setSourceInfo(info);
        setWidth((current) => current || String(info.width));
        setHeight((current) => current || String(info.height));
      })
      .catch(() => {
        setSourceInfo(null);
      });

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (resultPreviewUrl) {
        URL.revokeObjectURL(resultPreviewUrl);
      }
    };
  }, [resultPreviewUrl]);

  function resetResultState() {
    if (resultPreviewUrl) {
      URL.revokeObjectURL(resultPreviewUrl);
    }

    setResultPreviewUrl(null);
    setResultInfo(null);
    setResultBlob(null);
    setResultFileName(null);
  }

  function handleFile(file: File | null) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, WebP, or another supported image file.");
      setMessage("Only image files can be converted.");
      return;
    }

    resetResultState();
    setSelectedFile(file);
    setError(null);
    setMessage("Image ready. Choose the output format, resize options, and start conversion.");
  }

  async function processImage() {
    if (!selectedFile) {
      setError("Upload an image before starting conversion.");
      setMessage("Choose a file to continue.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setMessage("Processing image, applying resize rules, and preparing your download.");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("outputFormat", outputFormat);
    formData.append("resizeMode", resizeMode);
    formData.append("quality", String(quality));

    if (width.trim().length > 0) {
      formData.append("width", width.trim());
    }

    if (height.trim().length > 0) {
      formData.append("height", height.trim());
    }

    try {
      const response = await fetch("/api/image-conversion", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? "Unable to process this image right now.");
      }

      const blob = await response.blob();
      const previewUrl = URL.createObjectURL(blob);
      const fileNameHeader = response.headers.get("X-Output-File-Name");
      const decodedFileName = fileNameHeader ? decodeURIComponent(fileNameHeader) : `converted.${getImageOutputFormatConfig(outputFormat).extension}`;

      resetResultState();
      setResultBlob(blob);
      setResultPreviewUrl(previewUrl);
      setResultFileName(decodedFileName);
      setMessage("Conversion complete. Preview the output and download the processed image.");
      setResultInfo({
        width: Number(response.headers.get("X-Output-Width") ?? 0),
        height: Number(response.headers.get("X-Output-Height") ?? 0)
      });
    } catch (caughtError) {
      const nextError = caughtError instanceof Error ? caughtError.message : "Unable to process this image right now.";
      setError(nextError);
      setMessage(nextError);
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadResult() {
    if (!resultBlob || !resultFileName) {
      return;
    }

    const downloadUrl = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = resultFileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  function resetAll() {
    resetResultState();
    setSelectedFile(null);
    setSourceInfo(null);
    setWidth("");
    setHeight("");
    setQuality(90);
    setResizeMode("inside");
    setOutputFormat("png");
    setError(null);
    setMessage("Upload an image to convert formats and resize dimensions instantly.");
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[36px] border border-violet-100 bg-white/90 p-6 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Live converter
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ImageIcon className="h-4 w-4" />
              Free access
            </div>
          </div>

          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFile(event.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              "mt-6 rounded-[30px] border border-dashed p-6 transition sm:p-8",
              isDragging
                ? "border-cyan-300 bg-cyan-50/70 dark:border-cyan-400/40 dark:bg-cyan-400/10"
                : "border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/5"
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-glow">
                  <Upload className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">Upload an image and configure the output.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  Convert JPG to PNG, PNG to JPG, JPG to WebP, PNG to WebP, WebP to JPG, and resize the final image before download.
                </p>
                <p className={cn("mt-4 text-sm", error ? "text-rose-600" : "text-slate-500 dark:text-slate-400")}>{message}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Upload className="h-4 w-4" />
                  Choose image
                </button>
                <button
                  type="button"
                  onClick={processImage}
                  disabled={!selectedFile || isProcessing}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200"
                >
                  {isProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isProcessing ? "Processing" : "Convert image"}
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    handleFile(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Output format</div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {imageOutputFormats.map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => setOutputFormat(format.id)}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                      outputFormat === format.id
                        ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200"
                        : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
                    )}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Resize mode</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {imageResizeModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setResizeMode(mode.id)}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                      resizeMode === mode.id
                        ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200"
                        : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Width</div>
              <input
                inputMode="numeric"
                value={width}
                onChange={(event) => setWidth(event.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Auto"
                className="mt-4 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-cyan-300 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              />
            </label>
            <label className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Height</div>
              <input
                inputMode="numeric"
                value={height}
                onChange={(event) => setHeight(event.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Auto"
                className="mt-4 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-cyan-300 dark:border-white/10 dark:bg-slate-950/60 dark:text-white"
              />
            </label>
            <label className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Quality</div>
              <input
                type="range"
                min={40}
                max={100}
                step={1}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
                className="mt-5 w-full accent-cyan-500"
              />
              <div className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{quality}%</div>
            </label>
          </div>
        </div>

        <div className="rounded-[36px] border border-violet-100 bg-white/90 p-6 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Preview panel</div>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Original and output</h2>
            </div>
            {resultBlob ? (
              <button
                type="button"
                onClick={downloadResult}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            <PreviewCard
              title="Original image"
              subtitle={sourceInfo ? `${sourceInfo.width} × ${sourceInfo.height}px` : "Upload a file to preview it here."}
              imageUrl={sourcePreviewUrl}
              fallbackLabel="Original"
            />
            <AnimatePresence initial={false}>
              <motion.div layout>
                <PreviewCard
                  title="Processed output"
                  subtitle={resultInfo ? `${resultInfo.width} × ${resultInfo.height}px${resultFileName ? ` • ${resultFileName}` : ""}` : "Run conversion to generate a new file preview."}
                  imageUrl={resultPreviewUrl}
                  fallbackLabel="Output"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreviewCard({
  title,
  subtitle,
  imageUrl,
  fallbackLabel
}: {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  fallbackLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_30%),#eff6ff] dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_30%),rgba(15,23,42,0.8)]">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-contain p-4" sizes="(max-width: 1280px) 100vw, 40vw" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-cyan-400 text-2xl font-semibold text-white shadow-glow">
              {fallbackLabel.slice(0, 1)}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2 p-5">
        <div className="text-lg font-semibold text-slate-950 dark:text-white">{title}</div>
        <div className="text-sm leading-7 text-slate-600 dark:text-slate-300">{subtitle}</div>
      </div>
    </div>
  );
}
