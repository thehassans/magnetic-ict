import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr", "ar", "de", "es", "tr", "bn"],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: true
});
