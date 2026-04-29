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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_20%),linear-gradient(180deg,#fbfcfe_0%,#f4f7fb_100%)] px-6 py-10 transition-colors dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.18),transparent_18%),linear-gradient(180deg,#020617_0%,#07111f_100%)] sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <AdminLoginScreen
          callbackPath={callbackPath}
          hasConfiguredCredentials={hasConfiguredAdminCredentials()}
          showAccessDenied={showAccessDenied}
        />
      </div>
    </main>
  );
}
