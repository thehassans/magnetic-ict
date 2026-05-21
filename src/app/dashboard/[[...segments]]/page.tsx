import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

function buildQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
    } else if (typeof value === "string") {
      query.append(key, value);
    }
  }

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export default async function DashboardRedirectPage({
  params,
  searchParams
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ segments = [] }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const targetPath = [routing.defaultLocale, "dashboard", ...segments].join("/");

  redirect(`/${targetPath}${buildQueryString(resolvedSearchParams)}`);
}
