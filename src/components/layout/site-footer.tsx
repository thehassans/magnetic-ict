import { getTranslations } from "next-intl/server";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { getFooterDetailsSettings } from "@/lib/platform-settings";

type SiteFooterProps = {
  locale: string;
};

export async function SiteFooter({ locale }: SiteFooterProps) {
  const [t, footerDetails] = await Promise.all([
    getTranslations("Footer"),
    getFooterDetailsSettings()
  ]);

  return <MinimalFooter locale={locale} description={t("description")} footerDetails={footerDetails} />;
}
