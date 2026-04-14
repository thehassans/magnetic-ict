export type ServiceMenuKey =
  | "ssl"
  | "websiteBuilder"
  | "emailServices"
  | "professionalEmail"
  | "seoTools"
  | "imageConversion"
  | "magneticFaceSearch"
  | "siteLockVpn"
  | "siteMonitoring"
  | "websiteSecurity"
  | "websiteBackup"
  | "nordVpn";

export const serviceMenuItems = [
  { key: "imageConversion", id: "image-conversion", href: "/services#image-conversion" },
  { key: "magneticFaceSearch", id: "magnetic-face-search", href: "/services#magnetic-face-search" }
] as const satisfies ReadonlyArray<{ key: ServiceMenuKey; id: string; href: string }>;
