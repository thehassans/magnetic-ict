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
        <div className="min-h-screen bg-[linear-gradient(180deg,#fbfcfe_0%,#f3f6fb_100%)] text-slate-950 dark:bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] dark:text-white">
          {children}
        </div>
      </AppProviders>
    </NextIntlClientProvider>
  );
}
