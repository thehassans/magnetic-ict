import { prisma } from "@/lib/prisma";
import type { ActiveLanguage } from "@/types/i18n";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export const fallbackLanguages: ActiveLanguage[] = [
  { code: "en", label: "English", direction: "ltr" },
  { code: "fr", label: "Français", direction: "ltr" },
  { code: "ar", label: "العربية", direction: "rtl" },
  { code: "de", label: "Deutsch", direction: "ltr" },
  { code: "es", label: "Español", direction: "ltr" },
  { code: "tr", label: "Türkçe", direction: "ltr" }
];

export async function getActiveLanguages() {
  if (!hasDatabase) {
    return fallbackLanguages;
  }

  const setting = await prisma.setting.findUnique({
    where: { key: "active_languages" }
  }).catch(() => null);

  if (!setting || !Array.isArray(setting.value)) {
    return fallbackLanguages;
  }

  return setting.value as unknown as ActiveLanguage[];
}
