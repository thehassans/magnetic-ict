"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { ActiveLanguage } from "@/types/i18n";

type LanguageSwitcherProps = {
  activeLanguages: ActiveLanguage[];
  className?: string;
  triggerClassName?: string;
  align?: "left" | "right";
};

export function LanguageSwitcher({
  activeLanguages,
  className,
  triggerClassName,
  align = "right"
}: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Navigation");
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLanguage =
    activeLanguages.find((language) => language.code === locale) ?? activeLanguages[0];

  useEffect(() => {
    function handlePointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointer);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-cyan-400/30 dark:hover:bg-white/10",
          triggerClassName
        )}
      >
        <Languages className="h-4 w-4 text-violet-600 dark:text-cyan-300" />
        <span className="hidden sm:inline">{t("language")}</span>
        <span className="max-w-24 truncate text-slate-700 dark:text-slate-200">{currentLanguage?.label}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute top-[calc(100%+0.75rem)] z-50 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            <div className="px-3 pb-2 pt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
              {t("language")}
            </div>
            <div className="space-y-1">
              {activeLanguages.map((language) => {
                const isCurrent = language.code === locale;

                return (
                  <Link
                    key={language.code}
                    href={pathname}
                    locale={language.code}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition",
                      isCurrent
                        ? "bg-violet-50 text-slate-900 dark:bg-white/10 dark:text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    <div>
                      <div className="font-medium">{language.label}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {language.code}
                      </div>
                    </div>
                    {isCurrent ? <Check className="h-4 w-4 text-violet-600 dark:text-cyan-300" /> : null}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
