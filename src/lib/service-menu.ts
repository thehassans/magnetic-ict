export type ServiceMenuKey =
  | "ssl"
  | "websiteBuilder"
  | "emailServices"
  | "professionalEmail"
  | "seoTools"
  | "magneticFaceSearch"
  | "siteLockVpn"
  | "siteMonitoring"
  | "websiteSecurity"
  | "websiteBackup"
  | "nordVpn";

export const serviceMenuItems = [
  { key: "magneticFaceSearch", id: "magnetic-face-search", href: "/services#magnetic-face-search" }
] as const satisfies ReadonlyArray<{ key: ServiceMenuKey; id: string; href: string }>;
