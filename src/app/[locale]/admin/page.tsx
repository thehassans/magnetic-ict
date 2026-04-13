import { redirect } from "next/navigation";

function normalizeCallbackPath(rawPath?: string) {
  if (!rawPath || !rawPath.startsWith("/") || rawPath === "/admin") {
    return "/admin/dashboard";
  }

  return rawPath;
}

export default async function AdminEntryPage({
  searchParams
}: {
  searchParams: Promise<{ callback?: string }>;
}) {
  const query = await searchParams;
  const callbackPath = normalizeCallbackPath(query.callback);

  redirect(`/admin?callback=${encodeURIComponent(callbackPath)}`);
}
