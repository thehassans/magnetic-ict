import { getTranslations } from "next-intl/server";
import { RouteAwareFooter } from "@/components/layout/route-aware-footer";
import { getFooterDetailsSettings } from "@/lib/platform-settings";

type SiteFooterProps = {
  locale: string;
};

export async function SiteFooter({ locale }: SiteFooterProps) {
  const [t, footerDetails] = await Promise.all([
    getTranslations("Footer"),
    getFooterDetailsSettings()
  ]);

  return <RouteAwareFooter locale={locale} description={t("description")} footerDetails={footerDetails} />;
}
