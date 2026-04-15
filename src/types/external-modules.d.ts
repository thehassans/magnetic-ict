declare module "pdf-parse" {
  const pdfParse: (buffer: Buffer) => Promise<{ text: string }>;
  export default pdfParse;
}

declare module "mammoth" {
  export function extractRawText(input: { buffer: Buffer }): Promise<{ value: string }>;
}

declare module "ffmpeg-static" {
  const ffmpegStaticPath: string | null;
  export default ffmpegStaticPath;
}

declare module "ffprobe-static" {
  export const path: string;
}
