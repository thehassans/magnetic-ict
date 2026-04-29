import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { auth } from "@/auth";
import { AppProviders } from "@/components/providers/app-providers";
import messages from "../../../messages/en.json";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <AppProviders session={session}>
        <div className="admin-theme min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_20%),linear-gradient(180deg,#fbfcfe_0%,#f3f6fb_100%)] text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.16),transparent_18%),linear-gradient(180deg,#020617_0%,#060d1a_54%,#020617_100%)] dark:text-slate-100">
          {children}
        </div>
      </AppProviders>
    </NextIntlClientProvider>
  );
}
