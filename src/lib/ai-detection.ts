import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { getPlatformSettings } from "@/lib/platform-settings";

export type AiDetectionVerdict = "LIKELY_SYNTHETIC" | "POSSIBLY_SYNTHETIC" | "LIKELY_AUTHENTIC" | "INSUFFICIENT_SIGNAL";

export type AiDetectionSignal = {
  label: string;
  value: string;
  impact: "high" | "medium" | "low";
  direction: "synthetic" | "authentic" | "neutral";
  rationale: string;
};

export type AiDetectionFrame = {
  timecode: string;
  score: number;
};

export type AiDetectionResult = {
  mediaType: "image" | "video";
  fileName: string;
  verdict: AiDetectionVerdict;
  confidence: number;
  summary: string;
  signalScore: number;
  metadata: Record<string, string>;
  signals: AiDetectionSignal[];
  sampledFrames: AiDetectionFrame[];
  modelAssisted: boolean;
  disclaimer: string;
};

type GeminiAssessment = {
  verdict: AiDetectionVerdict;
  confidence: number;
  summary: string;
  reasons: string[];
};

type HeuristicAssessment = {
  verdict: AiDetectionVerdict;
  score: number;
  metadata: Record<string, string>;
  signals: AiDetectionSignal[];
  summary: string;
  sampledFrames: AiDetectionFrame[];
};

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"]);
const videoMimeTypes = new Set(["video/mp4", "video/quicktime", "video/webm", "video/x-matroska", "video/x-msvideo"]);
const syntheticKeywords = [
  "midjourney",
  "stable diffusion",
  "stability ai",
  "dall-e",
  "dalle",
  "firefly",
  "comfyui",
  "automatic1111",
  "invokeai",
  "runway",
  "sora",
  "pika",
  "gen-2",
  "synth",
  "ai generated"
];
const cameraKeywords = ["canon", "nikon", "sony", "fujifilm", "iphone", "samsung", "pixel", "leica", "lumix", "gopro"];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function bytesToMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatSeconds(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function signalWeight(signal: AiDetectionSignal) {
  if (signal.impact === "high") {
    return 3;
  }

  if (signal.impact === "medium") {
    return 2;
  }

  return 1;
}

function strongestSignal(signals: AiDetectionSignal[], direction?: AiDetectionSignal["direction"]) {
  return signals
    .filter((signal) => signal.direction !== "neutral" && (!direction || signal.direction === direction))
    .sort((left, right) => signalWeight(right) - signalWeight(left))[0] ?? null;
}

function verdictFromAssessment(score: number, signals: AiDetectionSignal[]): AiDetectionVerdict {
  const syntheticWeight = signals
    .filter((signal) => signal.direction === "synthetic")
    .reduce((sum, signal) => sum + signalWeight(signal), 0);
  const authenticWeight = signals
    .filter((signal) => signal.direction === "authentic")
    .reduce((sum, signal) => sum + signalWeight(signal), 0);
  const hasStrongSyntheticSignal = signals.some((signal) => signal.direction === "synthetic" && signal.impact === "high");
  const hasStrongAuthenticSignal = signals.some((signal) => signal.direction === "authentic" && signal.impact !== "low");

  if (score >= 78 && (hasStrongSyntheticSignal || syntheticWeight >= 4) && syntheticWeight >= authenticWeight + 2) {
    return "LIKELY_SYNTHETIC";
  }

  if (score >= 64 && syntheticWeight >= 3 && syntheticWeight >= authenticWeight + 1) {
    return "POSSIBLY_SYNTHETIC";
  }

  if (score <= 34 && hasStrongAuthenticSignal && authenticWeight >= syntheticWeight + 1) {
    return "LIKELY_AUTHENTIC";
  }

  return "INSUFFICIENT_SIGNAL";
}

function confidenceFromAssessment(score: number, verdict: AiDetectionVerdict, signals: AiDetectionSignal[]) {
  const weightedEvidence = signals.reduce((sum, signal) => sum + signalWeight(signal), 0);
  const distanceFromCenter = Math.abs(score - 50);

  if (verdict === "LIKELY_SYNTHETIC" || verdict === "LIKELY_AUTHENTIC") {
    return clamp(64 + distanceFromCenter + weightedEvidence * 2, 64, 96);
  }

  if (verdict === "POSSIBLY_SYNTHETIC") {
    return clamp(48 + Math.round(distanceFromCenter * 0.8) + weightedEvidence * 2, 48, 78);
  }

  return clamp(18 + Math.round(distanceFromCenter * 0.5) + weightedEvidence, 18, 42);
}

function summaryFromVerdict(verdict: AiDetectionVerdict, mediaType: "image" | "video", signals: AiDetectionSignal[]) {
  const topSyntheticSignal = strongestSignal(signals, "synthetic");
  const topAuthenticSignal = strongestSignal(signals, "authentic");

  if (verdict === "LIKELY_SYNTHETIC") {
    return topSyntheticSignal
      ? `Likely AI-generated. ${topSyntheticSignal.label} stood out most.`
      : `Likely AI-generated. Multiple synthetic signals were found.`;
  }

  if (verdict === "POSSIBLY_SYNTHETIC") {
    return topSyntheticSignal
      ? `Leans AI-generated. ${topSyntheticSignal.label} raised concern.`
      : `Leans AI-generated. Some synthetic signals were found.`;
  }

  if (verdict === "LIKELY_AUTHENTIC") {
    return topAuthenticSignal
      ? `Likely authentic. ${topAuthenticSignal.label} looked natural.`
      : `Likely authentic. The file looks more like real captured media.`;
  }

  if (topSyntheticSignal || topAuthenticSignal) {
    return `Unclear. The ${mediaType} does not contain enough strong evidence yet.`;
  }

  return `Unclear. Not enough reliable evidence was found.`;
}

async function runProcess(command: string, args: string[]) {
  return await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr.trim() || stdout.trim() || `Process exited with code ${code}.`));
    });
  });
}

async function getGeminiApiKeyIfAvailable() {
  const settings = await getPlatformSettings();
  const apiKey = settings.geminiConfig.apiKey.trim();
  return apiKey || null;
}

function extractAsciiMetadata(buffer: Buffer) {
  return buffer.toString("latin1").replace(/\0/g, " ").toLowerCase();
}

function detectSyntheticMetadataHits(text: string) {
  return syntheticKeywords.filter((keyword) => text.includes(keyword));
}

function detectCameraMetadataHits(text: string) {
  return cameraKeywords.filter((keyword) => text.includes(keyword));
}

function pushSignal(
  signals: AiDetectionSignal[],
  scoreRef: { current: number },
  input: AiDetectionSignal & { scoreDelta: number }
) {
  signals.push({
    label: input.label,
    value: input.value,
    impact: input.impact,
    direction: input.direction,
    rationale: input.rationale
  });
  scoreRef.current += input.scoreDelta;
}

async function assessImageBuffer(buffer: Buffer, fileName: string): Promise<HeuristicAssessment> {
  const image = sharp(buffer, { failOn: "none" }).rotate();
  const [metadata, stats] = await Promise.all([image.metadata(), image.stats()]);
  const metadataText = extractAsciiMetadata(buffer);
  const syntheticHits = detectSyntheticMetadataHits(metadataText);
  const cameraHits = detectCameraMetadataHits(metadataText);
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const aspectRatio = width && height ? Number((width / height).toFixed(2)) : 0;
  const averageDeviation = stats.channels.reduce((sum, channel) => sum + channel.stdev, 0) / Math.max(stats.channels.length, 1);
  const averageMean = stats.channels.reduce((sum, channel) => sum + channel.mean, 0) / Math.max(stats.channels.length, 1);
  const metadataMap: Record<string, string> = {
    dimensions: width && height ? `${width} × ${height}` : "Unknown",
    format: metadata.format?.toUpperCase() ?? "Unknown",
    channels: String(metadata.channels ?? stats.channels.length),
    entropy: stats.entropy.toFixed(2),
    sharpness: stats.sharpness.toFixed(2),
    avgDeviation: averageDeviation.toFixed(2),
    avgBrightness: averageMean.toFixed(2),
    aspectRatio: aspectRatio ? aspectRatio.toFixed(2) : "Unknown"
  };
  const signals: AiDetectionSignal[] = [];
  const scoreRef = { current: 50 };

  if (syntheticHits.length > 0) {
    pushSignal(signals, scoreRef, {
      label: "Generator metadata",
      value: syntheticHits.slice(0, 3).join(", "),
      impact: "high",
      direction: "synthetic",
      rationale: "Embedded metadata references common AI generation tooling.",
      scoreDelta: 28
    });
  }

  if (cameraHits.length > 0) {
    pushSignal(signals, scoreRef, {
      label: "Camera-style metadata",
      value: cameraHits.slice(0, 2).join(", "),
      impact: "medium",
      direction: "authentic",
      rationale: "Brand or camera metadata appears more consistent with captured media than raw generated output.",
      scoreDelta: -14
    });
  }

  if (!metadata.exif && syntheticHits.length === 0) {
    pushSignal(signals, scoreRef, {
      label: "Missing camera metadata",
      value: "No structured EXIF detected",
      impact: "low",
      direction: "neutral",
      rationale: "Missing EXIF alone is common after screenshots, exports, and edits, so it is only a weak clue.",
      scoreDelta: 4
    });
  }

  if (stats.entropy < 4.2 && stats.sharpness > 4) {
    pushSignal(signals, scoreRef, {
      label: "Texture consistency",
      value: `Entropy ${stats.entropy.toFixed(2)} / sharpness ${stats.sharpness.toFixed(2)}`,
      impact: "medium",
      direction: "synthetic",
      rationale: "Very clean edge structure with lower-than-expected entropy can indicate synthetic smoothing or generation artifacts.",
      scoreDelta: 10
    });
  }

  if (averageDeviation < 18) {
    pushSignal(signals, scoreRef, {
      label: "Low tonal variation",
      value: averageDeviation.toFixed(2),
      impact: "low",
      direction: "synthetic",
      rationale: "Flattened tonal deviation can appear in generated imagery, especially stylized renders.",
      scoreDelta: 7
    });
  }

  if (width >= 2500 && height >= 2500 && stats.entropy > 6 && averageDeviation > 28) {
    pushSignal(signals, scoreRef, {
      label: "Natural detail density",
      value: `${width} × ${height}`,
      impact: "medium",
      direction: "authentic",
      rationale: "High detail diversity and stronger channel variation are more consistent with richly captured imagery.",
      scoreDelta: -10
    });
  }

  if (signals.length === 0) {
    pushSignal(signals, scoreRef, {
      label: "Limited forensic indicators",
      value: fileName,
      impact: "low",
      direction: "neutral",
      rationale: "No especially strong synthetic or authentic markers were found in the uploaded file.",
      scoreDelta: 0
    });
  }

  const score = clamp(scoreRef.current, 0, 100);
  const verdict = verdictFromAssessment(score, signals);
  return {
    verdict,
    score,
    metadata: metadataMap,
    signals,
    summary: summaryFromVerdict(verdict, "image", signals),
    sampledFrames: []
  };
}

async function writeTempFile(name: string, buffer: Buffer) {
  const tempPath = path.join(os.tmpdir(), `${randomUUID()}-${name}`);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

async function pathExists(candidatePath: string) {
  try {
    await fs.access(candidatePath);
    return true;
  } catch {
    return false;
  }
}

function isExplicitBinaryPath(value: string) {
  return value.includes("/") || value.includes("\\");
}

async function resolveFfprobeBinaryPath() {
  const envPath = process.env.FFPROBE_BINARY?.trim();

  if (envPath) {
    if (!isExplicitBinaryPath(envPath) || await pathExists(envPath)) {
      return envPath;
    }
  }

  const localCandidates = [
    path.join(process.cwd(), "node_modules", "ffprobe-static", "bin", process.platform, process.arch, process.platform === "win32" ? "ffprobe.exe" : "ffprobe"),
    path.join(process.cwd(), "bin", process.platform === "win32" ? "ffprobe.exe" : "ffprobe")
  ];

  for (const candidatePath of localCandidates) {
    if (await pathExists(candidatePath)) {
      return candidatePath;
    }
  }

  return process.platform === "win32" ? "ffprobe.exe" : "ffprobe";
}

async function resolveFfmpegBinaryPath() {
  const envPath = process.env.FFMPEG_BINARY?.trim();

  if (envPath) {
    if (!isExplicitBinaryPath(envPath) || await pathExists(envPath)) {
      return envPath;
    }
  }

  const localCandidates = [
    path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg.exe"),
    path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg"),
    path.join(process.cwd(), "bin", process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg")
  ];

  for (const candidatePath of localCandidates) {
    if (await pathExists(candidatePath)) {
      return candidatePath;
    }
  }

  return process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
}

async function readProbeData(filePath: string) {
  const ffprobePath = await resolveFfprobeBinaryPath();
  const { stdout } = await runProcess(ffprobePath, [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath
  ]);
  return JSON.parse(stdout) as {
    format?: { duration?: string; bit_rate?: string; tags?: Record<string, string> };
    streams?: Array<Record<string, string | number | undefined>>;
  };
}

async function extractVideoFrames(videoPath: string, durationSeconds: number) {
  const ffmpegPath = await resolveFfmpegBinaryPath();

  const samplePoints = [0.18, 0.5, 0.82]
    .map((ratio) => clamp(durationSeconds * ratio, 0.1, Math.max(durationSeconds - 0.1, 0.1)));

  const frames: Array<{ timecode: string; buffer: Buffer }> = [];

  for (const seconds of samplePoints) {
    const framePath = path.join(os.tmpdir(), `${randomUUID()}.jpg`);

    try {
      await runProcess(ffmpegPath, [
        "-y",
        "-ss",
        seconds.toFixed(2),
        "-i",
        videoPath,
        "-frames:v",
        "1",
        "-vf",
        "scale='min(1280,iw)':-1",
        framePath
      ]);
      frames.push({ timecode: formatSeconds(seconds), buffer: await fs.readFile(framePath) });
    } finally {
      await fs.unlink(framePath).catch(() => undefined);
    }
  }

  return frames;
}

async function assessVideoBuffer(buffer: Buffer, fileName: string): Promise<HeuristicAssessment> {
  const videoPath = await writeTempFile(fileName, buffer);

  try {
    let probe: Awaited<ReturnType<typeof readProbeData>>;

    try {
      probe = await readProbeData(videoPath);
    } catch {
      return {
        verdict: "INSUFFICIENT_SIGNAL",
        score: 50,
        metadata: {
          duration: "Unknown",
          dimensions: "Unknown",
          bitrate: "Unknown",
          videoCodec: "Unavailable",
          audioCodec: "Unavailable",
          sampledFrames: "0"
        },
        signals: [{
          label: "Video forensic tooling unavailable",
          value: fileName,
          impact: "low",
          direction: "neutral",
          rationale: "FFmpeg/FFprobe are not available on this server, so only a minimal non-forensic video assessment can be returned."
        }],
        summary: "Unclear. Video analysis tools are not available on this server.",
        sampledFrames: []
      };
    }

    const streams = probe.streams ?? [];
    const videoStream = streams.find((stream) => stream.codec_type === "video");
    const audioStream = streams.find((stream) => stream.codec_type === "audio");
    const durationSeconds = Number(probe.format?.duration ?? 0);
    const bitrate = Number(probe.format?.bit_rate ?? 0);
    const width = Number(videoStream?.width ?? 0);
    const height = Number(videoStream?.height ?? 0);
    const metadataText = JSON.stringify(probe).toLowerCase();
    const syntheticHits = detectSyntheticMetadataHits(metadataText);
    const frames = durationSeconds > 0
      ? await extractVideoFrames(videoPath, durationSeconds).catch(() => [] as Array<{ timecode: string; buffer: Buffer }>)
      : [];
    const frameAssessments = await Promise.all(frames.map((frame) => assessImageBuffer(frame.buffer, `${fileName}-${frame.timecode}.jpg`)));
    const averageFrameScore = frameAssessments.length > 0
      ? frameAssessments.reduce((sum, entry) => sum + entry.score, 0) / frameAssessments.length
      : 50;
    const signals: AiDetectionSignal[] = [];
    const scoreRef = { current: 40 + averageFrameScore * 0.35 };
    const metadata: Record<string, string> = {
      duration: durationSeconds ? `${durationSeconds.toFixed(1)}s` : "Unknown",
      dimensions: width && height ? `${width} × ${height}` : "Unknown",
      bitrate: bitrate ? `${Math.round(bitrate / 1000)} kbps` : "Unknown",
      videoCodec: String(videoStream?.codec_name ?? "Unknown"),
      audioCodec: String(audioStream?.codec_name ?? "None"),
      sampledFrames: String(frameAssessments.length)
    };

    if (syntheticHits.length > 0) {
      pushSignal(signals, scoreRef, {
        label: "Generator metadata",
        value: syntheticHits.slice(0, 3).join(", "),
        impact: "high",
        direction: "synthetic",
        rationale: "Probe data or tags reference AI generation tooling or synthetic export pipelines.",
        scoreDelta: 24
      });
    }

    if (!audioStream) {
      pushSignal(signals, scoreRef, {
        label: "No audio track",
        value: "Silent video",
        impact: "low",
        direction: "synthetic",
        rationale: "Many generated videos ship silent or with stripped audio, though silence alone is not decisive.",
        scoreDelta: 6
      });
    }

    if (durationSeconds > 0 && durationSeconds <= 12 && averageFrameScore >= 62) {
      pushSignal(signals, scoreRef, {
        label: "Short synthetic-style clip",
        value: `${durationSeconds.toFixed(1)}s`,
        impact: "medium",
        direction: "synthetic",
        rationale: "Very short clips with synthetic-leaning sampled frames often come from text-to-video or image-to-video generation workflows.",
        scoreDelta: 10
      });
    }

    if (bitrate > 0 && width > 0 && height > 0 && bitrate / Math.max(width * height, 1) > 0.16) {
      pushSignal(signals, scoreRef, {
        label: "Healthy compression envelope",
        value: `${Math.round(bitrate / 1000)} kbps`,
        impact: "low",
        direction: "authentic",
        rationale: "Less aggressive compression can preserve natural capture noise and detail instead of smoothing artifacts.",
        scoreDelta: -6
      });
    }

    if (frameAssessments.length > 0) {
      pushSignal(signals, scoreRef, {
        label: "Sampled frame analysis",
        value: `${Math.round(averageFrameScore)}/100 synthetic score`,
        impact: averageFrameScore >= 65 ? "high" : averageFrameScore >= 50 ? "medium" : "low",
        direction: averageFrameScore >= 55 ? "synthetic" : averageFrameScore <= 40 ? "authentic" : "neutral",
        rationale: "The verdict incorporates forensic readings from multiple sampled frames across the clip.",
        scoreDelta: averageFrameScore >= 55 ? 8 : averageFrameScore <= 40 ? -8 : 0
      });
    }

    const score = clamp(Math.round(scoreRef.current), 0, 100);
    const fallbackSignals = signals.length > 0 ? signals : [{
      label: "Limited video indicators",
      value: fileName,
      impact: "low",
      direction: "neutral",
      rationale: "The clip did not expose enough strong synthetic or authentic markers for a decisive forensic-only verdict."
    } satisfies AiDetectionSignal];
    const verdict = verdictFromAssessment(score, fallbackSignals);
    return {
      verdict,
      score,
      metadata,
      signals: fallbackSignals,
      summary: summaryFromVerdict(verdict, "video", fallbackSignals),
      sampledFrames: frameAssessments.map((frame, index) => ({ timecode: frames[index]?.timecode ?? `${index + 1}`, score: Math.round(frame.score) }))
    };
  } finally {
    await fs.unlink(videoPath).catch(() => undefined);
  }
}

async function requestGeminiAssessment(parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }>) {
  const apiKey = await getGeminiApiKeyIfAvailable();

  if (!apiKey) {
    return null;
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      },
      contents: [
        {
          role: "user",
          parts
        }
      ]
    })
  });

  const payload = (await response.json().catch(() => ({}))) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Gemini analysis failed.");
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("")?.trim();

  if (!text) {
    return null;
  }

  const parsed = JSON.parse(text) as Partial<GeminiAssessment>;

  if (!parsed.verdict || typeof parsed.confidence !== "number" || typeof parsed.summary !== "string") {
    return null;
  }

  return {
    verdict: parsed.verdict,
    confidence: clamp(Math.round(parsed.confidence), 0, 100),
    summary: parsed.summary,
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons.filter((reason): reason is string => typeof reason === "string") : []
  } satisfies GeminiAssessment;
}

async function getGeminiImageAssessment(file: File, heuristic: HeuristicAssessment) {
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [
    {
      text: [
        "Assess whether this uploaded media is likely AI-generated or likely authentic.",
        "Return strict JSON with keys: verdict, confidence, summary, reasons.",
        "Make summary one short sentence.",
        "Allowed verdict values: LIKELY_SYNTHETIC, POSSIBLY_SYNTHETIC, LIKELY_AUTHENTIC, INSUFFICIENT_SIGNAL.",
        `Heuristic summary: ${heuristic.summary}`,
        `Metadata: ${JSON.stringify(heuristic.metadata)}`,
        `Signals: ${JSON.stringify(heuristic.signals)}`
      ].join("\n")
    },
    {
      inline_data: {
        mime_type: file.type || "image/jpeg",
        data: Buffer.from(await file.arrayBuffer()).toString("base64")
      }
    }
  ];

  return await requestGeminiAssessment(parts);
}

async function getGeminiVideoAssessment(fileName: string, heuristic: HeuristicAssessment, frames: Array<{ mimeType: string; buffer: Buffer }>) {
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [
    {
      text: [
        "Assess whether this uploaded video is likely AI-generated or likely authentic.",
        "The actual video is represented by sampled frames plus forensic metadata.",
        "Return strict JSON with keys: verdict, confidence, summary, reasons.",
        "Make summary one short sentence.",
        "Allowed verdict values: LIKELY_SYNTHETIC, POSSIBLY_SYNTHETIC, LIKELY_AUTHENTIC, INSUFFICIENT_SIGNAL.",
        `Video file: ${fileName}`,
        `Metadata: ${JSON.stringify(heuristic.metadata)}`,
        `Signals: ${JSON.stringify(heuristic.signals)}`,
        `Frame scores: ${JSON.stringify(heuristic.sampledFrames)}`
      ].join("\n")
    },
    ...frames.map((frame, index) => ({
      text: `Sampled frame ${index + 1}`
    })),
    ...frames.map((frame) => ({
      inline_data: {
        mime_type: frame.mimeType,
        data: frame.buffer.toString("base64")
      }
    }))
  ];

  return await requestGeminiAssessment(parts);
}

function mergeGeminiAssessment(heuristic: HeuristicAssessment, gemini: GeminiAssessment | null, mediaType: "image" | "video") {
  const heuristicVerdict = heuristic.verdict;
  const heuristicConfidence = confidenceFromAssessment(heuristic.score, heuristic.verdict, heuristic.signals);

  if (!gemini) {
    return {
      verdict: heuristicVerdict,
      confidence: heuristicConfidence,
      summary: heuristic.summary,
      modelAssisted: false
    };
  }

  const geminiScoreAnchor = gemini.verdict === "LIKELY_SYNTHETIC"
    ? 85
    : gemini.verdict === "POSSIBLY_SYNTHETIC"
      ? 62
      : gemini.verdict === "LIKELY_AUTHENTIC"
        ? 22
        : 50;

  const blendedScore = Math.round(heuristic.score * 0.55 + geminiScoreAnchor * 0.45);
  const verdict = verdictFromAssessment(blendedScore, heuristic.signals);
  const confidenceFloor = verdict === "INSUFFICIENT_SIGNAL" ? 24 : verdict === "POSSIBLY_SYNTHETIC" ? 50 : 64;
  const confidence = clamp(Math.round((heuristicConfidence * 0.55) + (gemini.confidence * 0.45)), confidenceFloor, 98);

  return {
    verdict,
    confidence,
    summary: summaryFromVerdict(verdict, mediaType, heuristic.signals),
    modelAssisted: true
  };
}

export async function analyzeUploadedMedia(file: File): Promise<AiDetectionResult> {
  if (!imageMimeTypes.has(file.type) && !videoMimeTypes.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, HEIC, MP4, MOV, WebM, MKV, or AVI file.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isVideo = videoMimeTypes.has(file.type);
  const mediaType = isVideo ? "video" : "image";
  const heuristic = isVideo ? await assessVideoBuffer(buffer, file.name) : await assessImageBuffer(buffer, file.name);
  let geminiAssessment: GeminiAssessment | null = null;

  try {
    if (isVideo) {
      const frames = await Promise.all(
        heuristic.sampledFrames.slice(0, 3).map(async (_, index) => {
          const tempVideoPath = await writeTempFile(file.name, buffer);

          try {
            const extracted = await extractVideoFrames(tempVideoPath, Number(heuristic.metadata.duration?.replace("s", "") ?? 0));
            const frame = extracted[index];
            return frame ? { mimeType: "image/jpeg", buffer: frame.buffer } : null;
          } finally {
            await fs.unlink(tempVideoPath).catch(() => undefined);
          }
        })
      );
      geminiAssessment = await getGeminiVideoAssessment(file.name, heuristic, frames.filter((frame): frame is { mimeType: string; buffer: Buffer } => Boolean(frame)));
    } else if (buffer.length <= 18 * 1024 * 1024) {
      geminiAssessment = await getGeminiImageAssessment(file, heuristic);
    }
  } catch {
    geminiAssessment = null;
  }

  const merged = mergeGeminiAssessment(heuristic, geminiAssessment, mediaType);

  return {
    mediaType,
    fileName: file.name,
    verdict: merged.verdict,
    confidence: merged.confidence,
    summary: merged.summary,
    signalScore: heuristic.score,
    metadata: {
      ...heuristic.metadata,
      uploadSize: bytesToMb(file.size)
    },
    signals: heuristic.signals,
    sampledFrames: heuristic.sampledFrames,
    modelAssisted: merged.modelAssisted,
    disclaimer: merged.modelAssisted
      ? "This result blends forensic heuristics with Gemini-assisted reasoning and should be treated as a decision-support signal, not proof."
      : "This result is based on local forensic heuristics only and should be treated as a decision-support signal, not proof."
  };
}
