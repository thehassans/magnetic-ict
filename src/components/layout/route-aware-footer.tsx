"use client";

import { usePathname } from "next/navigation";
import { MinimalFooter } from "@/components/ui/minimal-footer";

type RouteAwareFooterProps = {
  locale: string;
  description: string;
  footerDetails: {
    supportEmail: string;
    supportPhone: string;
    locationLabel: string;
    ctaHref: string;
  };
};

export function RouteAwareFooter({ locale, description, footerDetails }: RouteAwareFooterProps) {
  const pathname = usePathname() ?? "";

  if (pathname.startsWith(`/${locale}/dashboard`)) {
    return null;
  }

  return <MinimalFooter locale={locale} description={description} footerDetails={footerDetails} />;
}
