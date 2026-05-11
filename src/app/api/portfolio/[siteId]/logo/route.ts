import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPortfolioSiteById, updatePortfolioSite } from "@/lib/portfolio-db";

export const runtime = "nodejs";

const maxBytes = 6 * 1024 * 1024;
const imageExts = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif"];

function isImage(file: File) {
  if (file.type.startsWith("image/")) return true;
  const lower = file.name.toLowerCase();
  return imageExts.some((e) => lower.endsWith(e));
}

function isSvg(file: File) {
  return file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
}

async function saveFile(relPath: string, buf: Buffer) {
  const abs = path.join(process.cwd(), "public", relPath.replace(/^\//, ""));
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, buf);
}

async function removeFile(url: string | null) {
  if (!url) return;
  const rel = url.startsWith("/") ? url.slice(1) : url;
  if (!rel.startsWith("portfolio/uploads/")) return;
  try { await unlink(path.join(process.cwd(), "public", rel)); } catch { /* ignore */ }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await params;
  const site = await getPortfolioSiteById(siteId);
  if (!site || site.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const formData = await request.formData();
  const mode = formData.get("mode");
  const file = formData.get("file");

  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!isImage(file)) return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
  if (file.size === 0 || file.size > maxBytes) return NextResponse.json({ error: "Use an image up to 6 MB." }, { status: 400 });

  const isLight = mode !== "dark";
  const oldUrl = isLight ? site.logoLight : site.logoDark;
  const src = Buffer.from(await file.arrayBuffer());

  let buf: Buffer;
  let ext: string;

  if (isSvg(file)) {
    buf = src; ext = "svg";
  } else {
    try {
      buf = await sharp(src, { failOn: "none" })
        .resize({ width: 600, height: 200, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer();
      ext = "webp";
    } catch {
      buf = src;
      const lower = file.name.toLowerCase();
      ext = lower.endsWith(".png") ? "png" : lower.endsWith(".jpg") || lower.endsWith(".jpeg") ? "jpg" : "png";
    }
  }

  const logoPath = `/portfolio/uploads/${siteId}-${isLight ? "light" : "dark"}.${ext}`;
  await saveFile(logoPath, buf);
  if (oldUrl && oldUrl !== logoPath) await removeFile(oldUrl);

  const patch = isLight ? { logoLight: logoPath } : { logoDark: logoPath };
  await updatePortfolioSite(siteId, session.user.id, patch);

  return NextResponse.json({ ok: true, logoUrl: logoPath });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { siteId } = await params;
  const site = await getPortfolioSiteById(siteId);
  if (!site || site.userId !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  const isLight = url.searchParams.get("mode") !== "dark";

  const oldUrl = isLight ? site.logoLight : site.logoDark;
  await removeFile(oldUrl);
  await updatePortfolioSite(siteId, session.user.id, isLight ? { logoLight: "" } : { logoDark: "" });

  return NextResponse.json({ ok: true });
}
