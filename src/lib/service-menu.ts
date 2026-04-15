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
  { key: "nordVpn", id: "nord-vpn", href: "/services#nord-vpn" }
] as const satisfies ReadonlyArray<{ key: ServiceMenuKey; id: string; href: string }>;
