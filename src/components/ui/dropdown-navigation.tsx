"use client";

import { type ElementType, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export type DropdownNavigationSubMenuItem = {
  label: string;
  description?: string;
  icon: ElementType;
  href: string;
};

export type DropdownNavigationItem = {
  id: number;
  label: string;
  icon?: ElementType;
  subMenus?: {
    title: string;
    items: DropdownNavigationSubMenuItem[];
  }[];
  link?: string;
};

export function DropdownNavigation({
  navItems,
  locale,
  className
}: {
  navItems: DropdownNavigationItem[];
  locale: string;
  className?: string;
}) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isHover, setIsHover] = useState<number | null>(null);

  const handleHover = (menuLabel: string | null) => {
    setOpenMenu(menuLabel);
  };

  return (
    <div className={cn("relative shrink-0 items-center", className)}>
      <ul className="relative flex items-center gap-0.5 xl:gap-1">
        {navItems.map((navItem) => {
          const TopIcon = navItem.icon;
          const isActive = isHover === navItem.id || openMenu === navItem.label;
          const triggerClassName = "relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full px-3.5 xl:px-4 text-sm font-medium text-slate-700 transition-colors duration-300 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white";
          const content = (
            <>
              <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                {TopIcon ? <TopIcon className="h-4 w-4 shrink-0" /> : null}
                <span>{navItem.label}</span>
                {navItem.subMenus ? (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-300",
                      openMenu === navItem.label && "rotate-180"
                    )}
                  />
                ) : null}
              </span>
              {isActive ? (
                <motion.div
                  layoutId="hover-bg"
                  className="absolute inset-0 size-full rounded-full bg-slate-900/5 dark:bg-white/10"
                />
              ) : null}
            </>
          );

          return (
            <li
              key={navItem.label}
              className="relative"
              onMouseEnter={() => handleHover(navItem.subMenus ? navItem.label : null)}
              onMouseLeave={() => handleHover(null)}
            >
              {navItem.subMenus ? (
                <button
                  type="button"
                  className={triggerClassName}
                  onMouseEnter={() => setIsHover(navItem.id)}
                  onMouseLeave={() => setIsHover(null)}
                >
                  {content}
                </button>
              ) : (
                <Link
                  href={navItem.link || "/"}
                  locale={locale}
                  className={triggerClassName}
                  onMouseEnter={() => setIsHover(navItem.id)}
                  onMouseLeave={() => setIsHover(null)}
                >
                  {content}
                </Link>
              )}

              <AnimatePresence>
                {openMenu === navItem.label && navItem.subMenus ? (
                  <div className="absolute left-0 top-full z-50 pt-4">
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="w-max max-w-[min(92vw,64rem)] rounded-[32px] border border-slate-200/60 bg-white/95 p-5 shadow-[0_32px_80px_rgba(15,23,42,0.10),0_0_0_1px_rgba(15,23,42,0.03)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#0a0d14]/95 dark:shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
                    >
                      <div className="flex flex-wrap gap-6 xl:gap-8 overflow-hidden">
                        {navItem.subMenus.map((sub) => (
                          <motion.div layout className="min-w-[14rem] max-w-[18rem] flex-1" key={sub.title}>
                            {sub.title && (
                              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                                {sub.title}
                              </h3>
                            )}
                            <ul className="space-y-3">
                              {sub.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <li key={`${sub.title}-${item.label}`}>
                                    <Link
                                      href={item.href}
                                      locale={locale}
                                      onClick={() => setOpenMenu(null)}
                                      className="group flex items-start gap-3.5 rounded-[20px] border border-transparent px-3 py-2.5 transition-all duration-150 hover:border-slate-100 hover:bg-slate-50/80 dark:hover:border-white/[0.07] dark:hover:bg-white/[0.05]"
                                    >
                                      <div className="flex size-9 shrink-0 items-center justify-center rounded-[14px] border border-slate-200/80 bg-slate-50 text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-150 group-hover:border-slate-300 group-hover:bg-white group-hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)] dark:border-white/[0.09] dark:bg-white/[0.04] dark:text-slate-300 dark:group-hover:border-white/20 dark:group-hover:bg-white/[0.09]">
                                        <Icon className="h-4 w-4 flex-none" />
                                      </div>
                                      <div className="leading-5">
                                        <p className="text-[13.5px] font-medium text-slate-900 dark:text-white">
                                          {item.label}
                                        </p>
                                        {item.description ? (
                                          <p className="mt-0.5 text-[11.5px] leading-[1.55] text-slate-500 transition-colors duration-150 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300">
                                            {item.description}
                                          </p>
                                        ) : null}
                                      </div>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
