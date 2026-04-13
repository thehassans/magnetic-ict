export const serviceMenuItems = [
  { key: "ssl", id: "ssl", href: "/services#ssl" },
  { key: "websiteBuilder", id: "website-builder", href: "/services#website-builder" },
  { key: "emailServices", id: "email-services", href: "/services#email-services" },
  { key: "professionalEmail", id: "professional-email", href: "/services#professional-email" },
  { key: "seoTools", id: "seo-tools", href: "/services#seo-tools" },
  { key: "siteLockVpn", id: "sitelock-vpn", href: "/services#sitelock-vpn" },
  { key: "siteMonitoring", id: "site-monitoring", href: "/services#site-monitoring" },
  { key: "websiteSecurity", id: "website-security", href: "/services#website-security" },
  { key: "websiteBackup", id: "website-backup", href: "/services#website-backup" },
  { key: "nordVpn", id: "nordvpn", href: "/services#nordvpn" }
] as const;

export type ServiceMenuKey = (typeof serviceMenuItems)[number]["key"];
