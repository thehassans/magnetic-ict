import { prisma } from "@/lib/prisma";
import type { ActiveLanguage } from "@/types/i18n";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export const fallbackLanguages: ActiveLanguage[] = [
  { code: "en", label: "English", direction: "ltr" },
  { code: "fr", label: "Français", direction: "ltr" },
  { code: "ar", label: "العربية", direction: "rtl" },
  { code: "de", label: "Deutsch", direction: "ltr" },
  { code: "es", label: "Español", direction: "ltr" },
  { code: "tr", label: "Türkçe", direction: "ltr" },
  { code: "bn", label: "বাংলা", direction: "ltr" }
];

function ensureBanglaLanguage(languages: ActiveLanguage[]) {
  const bangla = fallbackLanguages.find((language) => language.code === "bn");

  if (!bangla || languages.some((language) => language.code === "bn")) {
    return languages;
  }

  return [...languages, bangla];
}

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

  const savedLanguages = (setting.value as unknown[])
    .filter(
      (entry): entry is ActiveLanguage =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as ActiveLanguage).code === "string" &&
        typeof (entry as ActiveLanguage).label === "string"
    )
    .map((entry) => ({
      code: entry.code,
      label: entry.label,
      direction: (entry.direction === "rtl" ? "rtl" : "ltr") as "ltr" | "rtl"
    }));

  return ensureBanglaLanguage(savedLanguages.length > 0 ? savedLanguages : fallbackLanguages);
}
