"use client";

import { cn } from "@/lib/utils";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <AnimatedThemeToggle />
    </div>
  );
}
