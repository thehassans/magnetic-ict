import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLoginScreen } from "@/components/admin/admin-login-screen";
import { hasConfiguredAdminCredentials } from "@/lib/admin-credentials";

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
  const [query, session] = await Promise.all([searchParams, auth()]);
  const callbackPath = normalizeCallbackPath(query.callback);
  const showAccessDenied = Boolean(session?.user);

  if (session?.user?.role === "ADMIN") {
    redirect(callbackPath);
  }

  return (
    <AdminLoginScreen
      callbackPath={callbackPath}
      hasConfiguredCredentials={hasConfiguredAdminCredentials()}
      showAccessDenied={showAccessDenied}
    />
  );
}
