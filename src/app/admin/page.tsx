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
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbfcfe_0%,#f4f7fb_100%)] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <AdminLoginScreen
          callbackPath={callbackPath}
          hasConfiguredCredentials={Boolean(process.env.ADMIN_EMAIL?.trim() && process.env.ADMIN_PASSWORD)}
          showAccessDenied={showAccessDenied}
        />
      </div>
    </main>
  );
}
