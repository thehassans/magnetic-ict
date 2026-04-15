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
  { key: "ssl", id: "ssl", href: "/services#ssl" },
  { key: "professionalEmail", id: "professional-email", href: "/services#professional-email" },
  { key: "websiteSecurity", id: "website-security", href: "/services#website-security" },
  { key: "websiteBuilder", id: "website-builder", href: "/services#website-builder" },
  { key: "seoTools", id: "seo-tools", href: "/services#seo-tools" },
  { key: "websiteBackup", id: "website-backup", href: "/services#website-backup" },
  { key: "emailServices", id: "email-services", href: "/services#email-services" },
  { key: "siteLockVpn", id: "site-lock-vpn", href: "/services#site-lock-vpn" },
  { key: "nordVpn", id: "nord-vpn", href: "/services#nord-vpn" },
  { key: "imageConversion", id: "image-conversion", href: "/services#image-conversion" },
  { key: "siteMonitoring", id: "site-monitoring", href: "/services#site-monitoring" },
  { key: "aiDetection", id: "ai-detection", href: "/services#ai-detection" },
  { key: "videoDownloader", id: "video-downloader", href: "/services#video-downloader" },
  { key: "magneticSocialBot", id: "magnetic-social-bot", href: "/services#magnetic-social-bot" },
  { key: "magneticFaceSearch", id: "magnetic-face-search", href: "/services#magnetic-face-search" }
] as const satisfies ReadonlyArray<{ key: ServiceMenuKey; id: string; href: string }>;
