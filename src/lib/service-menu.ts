export type ServiceMenuKey =
  | "ssl"
  | "websiteBuilder"
  | "emailServices"
  | "professionalEmail"
  | "seoTools"
  | "imageConversion"
  | "aiDetection"
  | "videoDownloader"
  | "magneticSocialBot"
  | "magneticFaceSearch"
  | "siteLockVpn"
  | "siteMonitoring"
  | "websiteSecurity"
  | "websiteBackup"
  | "nordVpn";

export const serviceMenuItems = [
  { key: "imageConversion", id: "image-conversion", href: "/services#image-conversion" },
  { key: "aiDetection", id: "ai-detection", href: "/services#ai-detection" },
  { key: "videoDownloader", id: "video-downloader", href: "/services#video-downloader" },
  { key: "magneticSocialBot", id: "magnetic-social-bot", href: "/services#magnetic-social-bot" },
  { key: "magneticFaceSearch", id: "magnetic-face-search", href: "/services#magnetic-face-search" }
] as const satisfies ReadonlyArray<{ key: ServiceMenuKey; id: string; href: string }>;
