import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "@/i18n/routing";

export default getRequestConfig(
  async ({ requestLocale }: { requestLocale: Promise<string | undefined> }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale;

    const defaultMessages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;

    try {
      const localeMessages = (await import(`../../messages/${locale}.json`)).default;

      return {
        locale,
        messages: deepMerge(defaultMessages, localeMessages)
      };
    } catch {
      return {
        locale: routing.defaultLocale,
        messages: defaultMessages
      };
    }
  }
);

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>) {
  const result = { ...base };

  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = override[key];

    if (isObject(baseValue) && isObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
      continue;
    }

    result[key] = overrideValue;
  }

  return result;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
