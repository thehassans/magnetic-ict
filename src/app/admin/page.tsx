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
    <main className="admin-theme min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_22%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_18%),linear-gradient(180deg,#fbfcfe_0%,#f4f7fb_46%,#edf5ff_100%)] px-4 py-4 transition-colors dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.24),transparent_24%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.2),transparent_18%),linear-gradient(180deg,#020617_0%,#07111f_48%,#020617_100%)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl items-center justify-center">
        <AdminLoginScreen
          callbackPath={callbackPath}
          hasConfiguredCredentials={hasConfiguredAdminCredentials()}
          showAccessDenied={showAccessDenied}
        />
      </div>
    </main>
  );
}
