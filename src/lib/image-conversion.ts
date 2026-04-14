export const imageOutputFormats = [
  {
    id: "jpeg",
    label: "JPG",
    mimeType: "image/jpeg",
    extension: "jpg"
  },
  {
    id: "png",
    label: "PNG",
    mimeType: "image/png",
    extension: "png"
  },
  {
    id: "webp",
    label: "WebP",
    mimeType: "image/webp",
    extension: "webp"
  }
] as const;

export const imageResizeModes = [
  {
    id: "inside",
    label: "Keep aspect ratio"
  },
  {
    id: "fill",
    label: "Force exact size"
  }
] as const;

export type ImageOutputFormat = (typeof imageOutputFormats)[number]["id"];
export type ImageResizeMode = (typeof imageResizeModes)[number]["id"];

const outputFormatMap = new Map(imageOutputFormats.map((format) => [format.id, format]));
const resizeModeSet = new Set(imageResizeModes.map((mode) => mode.id));

export function isImageOutputFormat(value: string): value is ImageOutputFormat {
  return outputFormatMap.has(value as ImageOutputFormat);
}

export function isImageResizeMode(value: string): value is ImageResizeMode {
  return resizeModeSet.has(value as ImageResizeMode);
}

export function getImageOutputFormatConfig(format: ImageOutputFormat) {
  return outputFormatMap.get(format)!;
}
