"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Link2, LoaderCircle, RotateCcw, ScanFace, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { ApprovedFaceProfile, FaceSearchMatch } from "@/lib/face-search-demo-types";
import { cn } from "@/lib/utils";

type FaceSearchDemoProps = {
  registry: ApprovedFaceProfile[];
  locale: string;
};

type SearchResponse = {
  ok?: boolean;
  error?: string;
  durationMs?: number;
  matches?: FaceSearchMatch[];
};

function AccuracyRing({ accuracy }: { accuracy: number }) {
  const background = useMemo(
    () => ({ background: `conic-gradient(rgb(34 211 238) ${accuracy * 3.6}deg, rgba(148, 163, 184, 0.18) 0deg)` }),
    [accuracy]
  );

  return (
    <div className="relative flex h-20 w-20 items-center justify-center rounded-full" style={background}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950 dark:bg-slate-950 dark:text-white">
        {accuracy}%
      </div>
    </div>
  );
}

export function FaceSearchDemo({ registry, locale }: FaceSearchDemoProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [matches, setMatches] = useState<FaceSearchMatch[]>([]);
  const [status, setStatus] = useState<"idle" | "ready" | "scanning" | "done" | "error">("idle");
  const [message, setMessage] = useState("Upload an approved portrait or choose a sample below to test the live search experience.");
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  function resetSearch() {
    setSelectedFile(null);
    setMatches([]);
    setDurationMs(null);
    setStatus("idle");
    setMessage("Upload an approved portrait or choose a sample below to test the live search experience.");
    setActiveSampleId(null);
  }

  function acceptFile(file: File | null) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please choose an image file for the approved face-search demo.");
      return;
    }

    setSelectedFile(file);
    setMatches([]);
    setDurationMs(null);
    setStatus("ready");
    setMessage("Image staged. Start scan to compare it against the approved demo registry.");
  }

  async function handleUseSample(profile: ApprovedFaceProfile) {
    const response = await fetch(profile.imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `${profile.id}.svg`, { type: blob.type || "image/svg+xml" });
    setActiveSampleId(profile.id);
    acceptFile(file);
  }

  async function handleSearch() {
    if (!selectedFile) {
      setStatus("error");
      setMessage("Upload a portrait or pick one of the approved samples first.");
      return;
    }

    setStatus("scanning");
    setMessage("Scanning approved registry, generating a visual signature, and ranking the nearest source matches.");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const [response] = await Promise.all([
        fetch("/api/face-search", {
          method: "POST",
          body: formData
        }),
        new Promise((resolve) => setTimeout(resolve, 1800))
      ]);
      const payload = (await response.json().catch(() => ({}))) as SearchResponse;

      if (!response.ok || !payload.matches) {
        setStatus("error");
        setMessage(payload.error ?? "Unable to scan this image right now.");
        return;
      }

      setMatches(payload.matches);
      setDurationMs(payload.durationMs ?? null);
      setStatus("done");
      setMessage(payload.matches.length > 0 ? "Search complete. Review the top approved source matches below." : "No approved source matches met the similarity threshold.");
    } catch {
      setStatus("error");
      setMessage("Unable to scan this image right now.");
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[36px] border border-violet-100 bg-white/90 p-6 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
              <Sparkles className="h-4 w-4" />
              Approved registry workflow
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs uppercase tracking-[0.28em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Consent-based demo only
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
              acceptFile(event.dataTransfer.files?.[0] ?? null);
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
                <h2 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">Upload an approved image to run the live scan.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  This demo compares your upload against a bundled registry of approved sample portraits and returns ranked matches with source links and demo confidence scores.
                </p>
                <p className={cn("mt-4 text-sm", status === "error" ? "text-rose-600" : "text-slate-500 dark:text-slate-400")}>{message}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <Upload className="h-4 w-4" />
                  Choose image
                </button>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!selectedFile || status === "scanning"}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-5 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200"
                >
                  {status === "scanning" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ScanFace className="h-4 w-4" />}
                  {status === "scanning" ? "Scanning registry" : "Start scan"}
                </button>
                <button
                  type="button"
                  onClick={resetSearch}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    acceptFile(event.target.files?.[0] ?? null);
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {registry.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleUseSample(profile)}
                className={cn(
                  "group overflow-hidden rounded-[24px] border text-left transition",
                  activeSampleId === profile.id
                    ? "border-cyan-300 bg-cyan-50/70 dark:border-cyan-400/30 dark:bg-cyan-400/10"
                    : "border-slate-200 bg-white hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"
                )}
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <Image src={profile.imageUrl} alt={profile.name} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 1280px) 50vw, 25vw" unoptimized />
                </div>
                <div className="space-y-2 p-4">
                  <div className="text-base font-semibold text-slate-950 dark:text-white">{profile.name}</div>
                  <div className="text-sm leading-6 text-slate-600 dark:text-slate-300">{profile.title}</div>
                  <div className="text-xs uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">Use sample</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-violet-100 bg-white/90 p-6 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_30%),radial-gradient(circle_at_80%_24%,rgba(6,182,212,0.16),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_80%_24%,rgba(6,182,212,0.24),transparent_24%)]" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Biometric HUD</div>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Live scan preview</h2>
              </div>
              {durationMs !== null ? <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">{durationMs} ms</div> : null}
            </div>

            <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-slate-950/95 dark:border-white/10">
              <div className="relative aspect-[4/5] w-full">
                {previewUrl ? <Image src={previewUrl} alt="Selected search preview" fill className="object-cover opacity-85" unoptimized sizes="(max-width: 1280px) 100vw, 40vw" /> : null}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.12),rgba(2,6,23,0.78))]" />
                <AnimatePresence>
                  {status === "scanning" ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                      <motion.div
                        initial={{ y: -30 }}
                        animate={{ y: [0, 320, 0] }}
                        transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        className="absolute left-6 right-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_24px_rgba(34,211,238,0.95)]"
                      />
                      <div className="absolute inset-6 rounded-[28px] border border-cyan-300/40" />
                      <div className="absolute left-[20%] top-[28%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)]" />
                      <div className="absolute left-[50%] top-[36%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)]" />
                      <div className="absolute left-[68%] top-[29%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)]" />
                      <div className="absolute left-[50%] top-[56%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.85)]" />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.26em] text-cyan-100 backdrop-blur">
                    {status === "scanning" ? "Scanning" : status === "done" ? "Scan complete" : status === "error" ? "Attention" : "Ready"}
                  </div>
                  <p className="mt-4 max-w-md text-sm leading-7 text-slate-200">
                    {previewUrl ? "The demo creates a visual signature for the upload and compares it against the approved registry." : "Select a sample or upload an image to activate the biometric-style scan preview."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Registry scope</div>
                <div className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{registry.length} approved profiles</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Search model</div>
                <div className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">Image signature ranking</div>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Source output</div>
                <div className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">Asset link + confidence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-violet-100 bg-white/90 p-6 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Ranked matches</div>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Approved source results</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Results below come only from the approved demo registry and are intended to demonstrate product flow, confidence ranking, and source-link retrieval.
            </p>
          </div>
          <Link
            href="/services/magneticFaceSearch"
            locale={locale}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
          >
            Service details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {matches.length > 0 ? (
              matches.map((match, index) => (
                <motion.article
                  key={match.id}
                  layout
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="overflow-hidden rounded-[30px] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={match.imageUrl} alt={match.name} fill className="object-cover" sizes="(max-width: 1280px) 100vw, 33vw" unoptimized />
                  </div>
                  <div className="space-y-5 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.26em] text-cyan-700 dark:text-cyan-300">Match #{index + 1}</div>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{match.name}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{match.summary}</p>
                      </div>
                      <AccuracyRing accuracy={match.accuracy} />
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/60">
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Consent note</div>
                      <div className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{match.consentNote}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {match.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href={match.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700"
                    >
                      <Link2 className="h-4 w-4" />
                      Open source asset
                    </a>
                  </div>
                </motion.article>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="xl:col-span-3 rounded-[30px] border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center dark:border-white/10 dark:bg-white/5"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-glow">
                  {status === "error" ? <AlertCircle className="h-7 w-7" /> : <ScanFace className="h-7 w-7" />}
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-slate-950 dark:text-white">
                  {status === "error" ? "Search needs attention" : "No results yet"}
                </h3>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="rounded-[36px] border border-violet-100 bg-white/90 p-6 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
        <div className="text-xs uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-300">Approved registry</div>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Profiles currently indexed in the live demo</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
          These records are the only searchable assets in this environment. Replace them later with your own consented or properly licensed dataset when you are ready to expand the MVP.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {registry.map((profile) => (
            <div key={profile.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
              <div className="relative aspect-[4/5]">
                <Image src={profile.imageUrl} alt={profile.name} fill className="object-cover" sizes="(max-width: 1280px) 50vw, 25vw" unoptimized />
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <div className="text-lg font-semibold text-slate-950 dark:text-white">{profile.name}</div>
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{profile.title}</div>
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{profile.summary}</p>
                <a
                  href={profile.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 transition hover:text-violet-700 dark:text-cyan-300 dark:hover:text-white"
                >
                  <Link2 className="h-4 w-4" />
                  View source asset
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
