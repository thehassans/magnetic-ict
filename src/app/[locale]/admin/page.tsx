import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminLoginScreen } from "@/components/admin/admin-login-screen";

function normalizeCallbackPath(rawPath?: string) {
  if (!rawPath || !rawPath.startsWith("/") || rawPath === "/admin") {
    return "/admin/orders";
  }

  return rawPath;
}

export default async function AdminEntryPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callback?: string }>;
}) {
  const [{ locale }, query, session] = await Promise.all([params, searchParams, auth()]);
  const callbackPath = normalizeCallbackPath(query.callback);
  const showAccessDenied = Boolean(session?.user);

  if (session?.user?.role === "ADMIN") {
    redirect(`/${locale}${callbackPath}`);
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <AdminLoginScreen
        locale={locale}
        callbackPath={callbackPath}
        hasConfiguredCredentials={Boolean(process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD)}
        showAccessDenied={showAccessDenied}
      />
    </main>
  );
}
