import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { defaultBrandingConfig, getBrandingConfig } from "@/lib/platform-settings";

type AdminShellProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  activePath?: string;
  children: ReactNode;
  actions?: ReactNode;
  noPadding?: boolean;
};

export async function AdminShell({
  title,
  description,
  eyebrow,
  children,
  actions,
  noPadding = false,
}: AdminShellProps) {
  const branding = await getBrandingConfig().catch(() => defaultBrandingConfig);

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] dark:bg-[#07070f]">
      <AdminSidebar
        logoLight={branding.adminLogoLight || undefined}
        logoDark={branding.adminLogoDark || undefined}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.05] bg-white/90 dark:bg-[#07070f]/90 backdrop-blur-xl px-6 py-3">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-white/30 mb-0.5">{eyebrow}</p>
            )}
            <h1 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white truncate">{title}</h1>
            {description && (
              <p className="text-[12px] text-slate-400 dark:text-white/35 mt-0.5 truncate max-w-lg">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {actions}
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <div className={noPadding ? "flex-1" : "flex-1 p-6 space-y-5"}>
          {children}
        </div>
      </main>
    </div>
  );
}
