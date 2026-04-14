import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { ApprovedFaceProfile, FaceSearchMatch } from "@/lib/face-search-demo-types";

type ImageSignature = {
  hash: string;
  mean: number;
  contrast: number;
};

const hashSize = 16;
const maxPixels = hashSize * hashSize;
const approvedFaceRegistry: ApprovedFaceProfile[] = [
  {
    id: "aaniya-rahman",
    name: "Aaniya Rahman",
    title: "Approved demo profile",
    summary: "Consented sample portrait used to validate private image similarity search flows.",
    imageUrl: "/face-search/approved/aaniya-rahman.svg",
    sourceUrl: "/face-search/approved/aaniya-rahman.svg",
    consentNote: "Available only for this demo registry with internal testing consent.",
    tags: ["consented", "demo registry", "portrait"]
  },
  {
    id: "ibrahim-syed",
    name: "Ibrahim Syed",
    title: "Approved demo profile",
    summary: "Authorized reference image included for upload-to-search product demonstrations.",
    imageUrl: "/face-search/approved/ibrahim-syed.svg",
    sourceUrl: "/face-search/approved/ibrahim-syed.svg",
    consentNote: "Available only for this demo registry with internal testing consent.",
    tags: ["consented", "demo registry", "headshot"]
  },
  {
    id: "meher-khan",
    name: "Meher Khan",
    title: "Approved demo profile",
    summary: "Approved sample used to demonstrate source-link retrieval and match ranking.",
    imageUrl: "/face-search/approved/meher-khan.svg",
    sourceUrl: "/face-search/approved/meher-khan.svg",
    consentNote: "Available only for this demo registry with internal testing consent.",
    tags: ["consented", "demo registry", "reference image"]
  },
  {
    id: "zayan-malik",
    name: "Zayan Malik",
    title: "Approved demo profile",
    summary: "Private gallery entry for similarity scoring, source linking, and UI validation.",
    imageUrl: "/face-search/approved/zayan-malik.svg",
    sourceUrl: "/face-search/approved/zayan-malik.svg",
    consentNote: "Available only for this demo registry with internal testing consent.",
    tags: ["consented", "demo registry", "source link"]
  }
];

const signatureCache = new Map<string, Promise<ImageSignature>>();

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getAbsolutePublicPath(imageUrl: string) {
  return path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
}

async function createImageSignature(buffer: Buffer) {
  const resized = await sharp(buffer)
    .resize(hashSize, hashSize, { fit: "cover" })
    .grayscale()
    .raw()
    .toBuffer();

  const pixels = Array.from(resized.subarray(0, maxPixels));
  const mean = pixels.reduce((sum, pixel) => sum + pixel, 0) / pixels.length;
  const contrast = Math.sqrt(pixels.reduce((sum, pixel) => sum + (pixel - mean) ** 2, 0) / pixels.length);
  const hash = pixels.map((pixel) => (pixel >= mean ? "1" : "0")).join("");

  return { hash, mean, contrast } satisfies ImageSignature;
}

async function getApprovedSignature(profile: ApprovedFaceProfile) {
  const existing = signatureCache.get(profile.id);

  if (existing) {
    return existing;
  }

  const pending = readFile(getAbsolutePublicPath(profile.imageUrl)).then((buffer) => createImageSignature(buffer));
  signatureCache.set(profile.id, pending);
  return pending;
}

function getHammingDistance(left: string, right: string) {
  let distance = 0;

  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    if (left[index] !== right[index]) {
      distance += 1;
    }
  }

  return distance + Math.abs(left.length - right.length);
}

export function getApprovedFaceRegistry() {
  return approvedFaceRegistry;
}

export async function searchApprovedFaces(sourceBuffer: Buffer) {
  const sourceSignature = await createImageSignature(sourceBuffer);

  const matches = await Promise.all(
    approvedFaceRegistry.map(async (profile) => {
      const approvedSignature = await getApprovedSignature(profile);
      const hammingDistance = getHammingDistance(sourceSignature.hash, approvedSignature.hash);
      const hashSimilarity = 1 - hammingDistance / maxPixels;
      const meanSimilarity = 1 - Math.min(Math.abs(sourceSignature.mean - approvedSignature.mean) / 255, 1);
      const contrastSimilarity = 1 - Math.min(Math.abs(sourceSignature.contrast - approvedSignature.contrast) / 128, 1);
      const score = clamp(hashSimilarity * 0.72 + meanSimilarity * 0.14 + contrastSimilarity * 0.14, 0, 1);
      const accuracy = Math.round(clamp(38 + score * 61, 0, 99));

      return {
        ...profile,
        accuracy,
        score
      } satisfies FaceSearchMatch;
    })
  );

  return matches
    .sort((left, right) => right.score - left.score)
    .filter((match, index) => match.accuracy >= 55 || index === 0)
    .slice(0, 3);
}
