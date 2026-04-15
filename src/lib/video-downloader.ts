import { randomUUID } from "node:crypto";
import { promises as fs, createReadStream } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

export type SupportedDownloadPlatform = "youtube" | "instagram" | "facebook";
export type DownloadOutputType = "mp4" | "mp3";

export type VideoDownloadOption = {
  id: string;
  label: string;
  quality: string;
  extension: string;
  note: string;
};

export type VideoInspectionResult = {
  platform: SupportedDownloadPlatform;
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

type YtdlpFormat = {
  format_id?: string;
  ext?: string;
  vcodec?: string;
  acodec?: string;
  width?: number;
  height?: number;
  fps?: number;
  format_note?: string;
  format?: string;
  abr?: number;
  tbr?: number;
  protocol?: string;
  filesize?: number;
};

type YtdlpInfo = {
  title?: string;
  uploader?: string;
  duration?: number;
  thumbnail?: string;
  extractor_key?: string;
  webpage_url?: string;
  formats?: YtdlpFormat[];
};

export type DownloadRequest = {
  url: string;
  outputType: DownloadOutputType;
  quality: string;
  formatId?: string;
};

const supportedHosts: Array<{ platform: SupportedDownloadPlatform; hosts: string[] }> = [
  { platform: "youtube", hosts: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"] },
  { platform: "instagram", hosts: ["instagram.com", "www.instagram.com"] },
  { platform: "facebook", hosts: ["facebook.com", "www.facebook.com", "fb.watch", "m.facebook.com"] }
];
const defaultMp3Qualities = ["128", "192", "320"] as const;

function sanitizeFileName(value: string) {
  return value
    .replace(/[^a-z0-9-_ ]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "download";
}

async function resolveYtdlpBinaryPath() {
  const libraryDirectory = path.join(process.cwd(), "node_modules", "node-ytdlp-wrap", "lib");
  const files = await fs.readdir(libraryDirectory);
  const binaryName = files.find((file) => /^yt-dlp-.*(\.exe)?$/i.test(file));

  if (!binaryName) {
    throw new Error("yt-dlp binary is not available in node_modules.");
  }

  return path.join(libraryDirectory, binaryName);
}

function toWebStream(filePath: string, onClose: () => Promise<void>) {
  const nodeStream = createReadStream(filePath);
  return new ReadableStream<Uint8Array>({
    start(controller) {
      nodeStream.on("data", (chunk: string | Buffer) => {
        controller.enqueue(new Uint8Array(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
      });
      nodeStream.on("end", () => {
        controller.close();
        void onClose();
      });
      nodeStream.on("error", (error) => {
        controller.error(error);
        void onClose();
      });
    },
    cancel() {
      nodeStream.destroy();
      void onClose();
    }
  });
}

async function runYtdlp(args: string[]) {
  const ytdlpPath = await resolveYtdlpBinaryPath();
  return await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(ytdlpPath, args, { windowsHide: true });
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

      reject(new Error(stderr.trim() || stdout.trim() || `yt-dlp exited with code ${code}.`));
    });
  });
}

export function validateSupportedDownloadUrl(value: string) {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Paste a valid YouTube, Instagram, or Facebook link.");
  }

  const match = supportedHosts.find((entry) => entry.hosts.includes(parsed.hostname.toLowerCase()));

  if (!match) {
    throw new Error("Only YouTube, Instagram, and Facebook links are supported right now.");
  }

  return { parsed, platform: match.platform };
}

function dedupeOptions(options: VideoDownloadOption[]) {
  return options.filter((option, index) => options.findIndex((candidate) => candidate.quality === option.quality && candidate.extension === option.extension) === index);
}

function buildMp4Options(formats: YtdlpFormat[]) {
  const candidates = formats
    .filter((format) => format.vcodec && format.vcodec !== "none" && format.format_id && format.height)
    .map((format) => ({
      id: format.format_id as string,
      label: `${format.height}p MP4`,
      quality: String(format.height),
      extension: "mp4",
      note: `${format.fps ? `${Math.round(format.fps)}fps` : "Video"}${format.protocol ? ` • ${format.protocol}` : ""}`,
      height: format.height as number,
      ext: format.ext ?? "unknown"
    }))
    .filter((format) => format.ext === "mp4" || format.ext === "webm" || format.ext === "m4v")
    .sort((left, right) => right.height - left.height)
    .map(({ id, label, quality, extension, note }) => ({ id, label, quality, extension, note }));

  return dedupeOptions(candidates).slice(0, 8);
}

function buildMp3Options() {
  return defaultMp3Qualities.map((quality) => ({
    id: `mp3-${quality}`,
    label: `${quality} kbps MP3`,
    quality,
    extension: "mp3",
    note: "Audio extraction"
  }));
}

export async function inspectVideoDownload(url: string): Promise<VideoInspectionResult> {
  const { platform } = validateSupportedDownloadUrl(url);
  const { stdout } = await runYtdlp([
    url,
    "--dump-single-json",
    "--no-playlist",
    "--skip-download",
    "--no-warnings"
  ]);
  const payload = JSON.parse(stdout) as YtdlpInfo;
  const formats = payload.formats ?? [];
  const mp4Options = buildMp4Options(formats);

  if (mp4Options.length === 0) {
    throw new Error("We couldn't find downloadable MP4 formats for this link.");
  }

  return {
    platform,
    sourceUrl: payload.webpage_url || url,
    title: payload.title?.trim() || "Untitled video",
    thumbnail: payload.thumbnail ?? null,
    durationSeconds: typeof payload.duration === "number" ? payload.duration : null,
    uploader: payload.uploader ?? null,
    formats: {
      mp4: mp4Options,
      mp3: buildMp3Options()
    }
  };
}

async function findCreatedDownloadFile(directory: string, baseName: string) {
  const files = await fs.readdir(directory);
  const match = files
    .filter((file) => file.startsWith(baseName))
    .sort((left, right) => right.length - left.length)[0];

  if (!match) {
    throw new Error("Unable to prepare the download file.");
  }

  return path.join(directory, match);
}

export async function buildDownloadResponse(input: DownloadRequest) {
  const { platform } = validateSupportedDownloadUrl(input.url);
  const inspection = await inspectVideoDownload(input.url);
  const downloadDir = path.join(os.tmpdir(), `magnetic-download-${randomUUID()}`);
  const safeBase = `${sanitizeFileName(inspection.title)}-${Date.now()}`;

  await fs.mkdir(downloadDir, { recursive: true });

  const outputTemplate = path.join(downloadDir, `${safeBase}.%(ext)s`);
  const args = [input.url, "--no-playlist", "--no-warnings", "-o", outputTemplate];

  if (input.outputType === "mp4") {
    if (!input.formatId) {
      throw new Error("Choose a video quality before starting the download.");
    }

    args.push("-f", `${input.formatId}+bestaudio[ext=m4a]/${input.formatId}+bestaudio/${input.formatId}/best[ext=mp4]/best`);
    args.push("--merge-output-format", "mp4");
  } else {
    if (!ffmpegPath) {
      throw new Error("MP3 conversion is not available because FFmpeg is missing.");
    }

    args.push("-f", "bestaudio/best");
    args.push("--extract-audio", "--audio-format", "mp3", "--audio-quality", `${input.quality}K`, "--ffmpeg-location", ffmpegPath);
  }

  await runYtdlp(args);

  const outputFilePath = await findCreatedDownloadFile(downloadDir, safeBase);
  const stats = await fs.stat(outputFilePath);
  const extension = path.extname(outputFilePath).replace(/^\./, "") || input.outputType;
  const outputFileName = `${sanitizeFileName(inspection.title)}-${input.outputType === "mp3" ? `${input.quality}kbps` : `${input.quality}p`}.${extension}`;
  const contentType = input.outputType === "mp3" ? "audio/mpeg" : "video/mp4";

  const cleanup = async () => {
    await fs.rm(downloadDir, { recursive: true, force: true }).catch(() => undefined);
  };

  const stream = toWebStream(outputFilePath, cleanup);

  return {
    platform,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stats.size),
      "Content-Disposition": `attachment; filename="${outputFileName}"`,
      "Cache-Control": "no-store",
      "X-Download-Platform": platform
    },
    stream
  };
}
