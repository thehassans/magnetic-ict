"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import SkyToggle from "@/components/ui/sky-toggle";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={cn("flex items-center", className)}>
      <SkyToggle checked={isDark} onChange={toggleTheme} />
    </div>
  );
}
