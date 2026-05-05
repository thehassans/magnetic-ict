"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  BotMessageSquare,
  ChevronDown,
  Globe,
  Grid2x2,
  BrainCircuit,
  Download,
  ImageIcon,
  LayoutGrid,
  Lock,
  Mail,
  Menu,
  Bot,
  LogOut,
  Search,
  Shield,
  ShieldCheck,
  ScanFace,
  UserRound,
  X,
  Briefcase,
  Database,
  Activity,
  Sparkles,
  Server,
  Package
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { BrandLogo } from "@/components/branding/brand-logo";
import { CartTrigger } from "@/components/commerce/cart-trigger";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Link } from "@/i18n/navigation";
import { DOMAIN_CART_UPDATED_EVENT, readDomainCart } from "@/lib/domain-cart";
import { type ServiceMenuKey } from "@/lib/service-menu";
import { cn } from "@/lib/utils";
import type { ActiveLanguage } from "@/types/i18n";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type SiteHeaderProps = {
  locale: string;
  activeLanguages: ActiveLanguage[];
  visibleServiceMenuItems: ReadonlyArray<{ key: ServiceMenuKey; id: string; href: string }>;
  sessionUser?: SessionUser | null;
  hasMagneticSocialBotAccess?: boolean;
};

const iconMap = {
  ssl: ShieldCheck,
  websiteBuilder: LayoutGrid,
  emailServices: Mail,
  professionalEmail: Briefcase,
  seoTools: Search,
  imageConversion: ImageIcon,
  aiDetection: BrainCircuit,
  videoDownloader: Download,
  magneticSocialBot: Bot,
  magneticCommerce: Package,
  magneticVpsHosting: Server,
  magneticFaceSearch: ScanFace,
  siteLockVpn: Lock,
  siteMonitoring: Activity,
  websiteSecurity: Shield,
  websiteBackup: Database,
  nordVpn: Globe
} satisfies Record<ServiceMenuKey, typeof ShieldCheck>;

export function SiteHeader({ locale, activeLanguages, visibleServiceMenuItems, sessionUser, hasMagneticSocialBotAccess = false }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [domainCartCount, setDomainCartCount] = useState(0);
  const [isSigningOut, startSignOutTransition] = useTransition();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("Navigation");
  const signInHref = "/customer/sign-in?callback=/dashboard";

  const initials = useMemo(() => {
    const source = sessionUser?.name?.trim() || sessionUser?.email?.trim() || "M";
    return source.slice(0, 1).toUpperCase();
  }, [sessionUser?.email, sessionUser?.name]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    function syncDomainCartCount() {
      setDomainCartCount(readDomainCart(window.localStorage).length);
    }

    function handleStorage(event: StorageEvent) {
      if (!event.key || event.key === "magneticict-domain-cart-v2" || event.key === "magneticict-domain-cart") {
        syncDomainCartCount();
      }
    }

    syncDomainCartCount();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(DOMAIN_CART_UPDATED_EVENT, syncDomainCartCount);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(DOMAIN_CART_UPDATED_EVENT, syncDomainCartCount);
    };
  }, []);

  function handleSignOut() {
    startSignOutTransition(() => {
      void signOut({ redirectTo: `/${locale}` });
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[5.5rem] items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" locale={locale} className="group inline-flex items-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="rounded-2xl px-1 py-1">
                <BrandLogo className="w-[150px] sm:w-[182px]" priority />
              </motion.div>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              <NavLink locale={locale} href="/">
                {t("home")}
              </NavLink>

              <div
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {t("services")}
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition dark:text-slate-500", servicesOpen && "rotate-180 text-violet-600 dark:text-cyan-300")} />
                </motion.button>

                <AnimatePresence>
                  {servicesOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-[-4.5rem] top-[calc(100%+0.12rem)] w-[min(94vw,980px)] overflow-hidden rounded-[32px] border border-violet-100 bg-white/95 p-3 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95"
                    >
                      <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/60 to-cyan-50/70 p-6 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.9))]">
                        <div className="mx-auto mb-6 max-w-2xl text-center">
                          <div>
                            <div className="text-xs uppercase tracking-[0.28em] text-violet-600 dark:text-cyan-300">
                              {t("servicesMenuEyebrow")}
                            </div>
                            <div className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{t("servicesMenuTitle")}</div>
                          </div>
                          <Link
                            href="/services"
                            locale={locale}
                            className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-violet-200 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
                          >
                            <Grid2x2 className="h-4 w-4 text-violet-600 dark:text-cyan-300" />
                            {t("allServices")}
                          </Link>
                        </div>

                        <div className="mx-auto flex max-w-[860px] flex-wrap justify-center gap-3">
                          {visibleServiceMenuItems.map((item, index) => {
                            const Icon = iconMap[item.key];

                            return (
                              <motion.div
                                key={item.key}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03, duration: 0.2 }}
                                className="w-full sm:max-w-[calc(50%-0.375rem)] md:max-w-[calc(33.333%-0.5rem)] md:basis-[calc(33.333%-0.5rem)]"
                              >
                                <Link
                                  href={`/services/${item.key}`}
                                  locale={locale}
                                  className="group flex h-full items-start gap-4 rounded-[24px] border border-violet-100/70 bg-white/75 px-4 py-4 text-left shadow-[0_12px_36px_rgba(15,23,42,0.06)] transition hover:border-violet-200 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-400/20 dark:hover:bg-white/10"
                                >
                                  <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100 dark:bg-white/5 dark:text-cyan-300 dark:group-hover:bg-cyan-400/10">
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-slate-950 dark:text-white">{t(`items.${item.key}.title`)}</div>
                                    <div className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                      {t(`items.${item.key}.description`)}
                                    </div>
                                  </div>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <NavLink locale={locale} href="/support">
                {t("support")}
              </NavLink>
            </nav>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher activeLanguages={activeLanguages} />

            <ThemeToggle />

            <Link href="/domains/cart" locale={locale} className="relative inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-cyan-400/20 dark:hover:bg-white/10">
              <span>Domain cart</span>
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950">
                {domainCartCount}
              </span>
            </Link>

            <CartTrigger />

            {sessionUser?.role === "ADMIN" ? (
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <NextLink
                  href="/admin/dashboard"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {t("adminOps")}
                </NextLink>
              </motion.div>
            ) : null}

            {sessionUser ? (
              <div className="relative" ref={accountMenuRef}>
                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAccountMenuOpen((value) => !value)}
                  className={cn(
                    "inline-flex h-11 items-center gap-3 rounded-full border px-2.5 pl-3.5 pr-3 text-sm font-medium transition",
                    accountMenuOpen
                      ? "border-violet-200 bg-violet-50 text-slate-950 dark:border-cyan-400/20 dark:bg-white/10 dark:text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-cyan-400/20 dark:hover:bg-white/10"
                  )}
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-300 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(124,58,237,0.22)]">
                    {initials}
                  </span>
                  <span className="flex max-w-36 flex-col items-start leading-none">
                    <span className="max-w-36 truncate font-semibold">{sessionUser.name || t("profile")}</span>
                    <span className="mt-1 max-w-36 truncate text-[11px] text-slate-500 dark:text-slate-400">{sessionUser.email || t("profile")}</span>
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-slate-400 transition dark:text-slate-500", accountMenuOpen && "rotate-180 text-violet-600 dark:text-cyan-300")} />
                </motion.button>

                <AnimatePresence>
                  {accountMenuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-[calc(100%+0.9rem)] z-50 w-[320px] overflow-hidden rounded-[30px] border border-violet-100 bg-white/95 p-3 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95"
                    >
                      <div className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/55 to-cyan-50/70 p-4 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))]">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-300 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(124,58,237,0.24)]">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs uppercase tracking-[0.28em] text-violet-600 dark:text-cyan-300">{t("profile")}</div>
                            <div className="mt-2 truncate text-base font-semibold text-slate-950 dark:text-white">{sessionUser.name || t("profile")}</div>
                            <div className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{sessionUser.email}</div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <AccountMenuLink
                            href="/dashboard"
                            locale={locale}
                            icon={<BadgeCheck className="h-4 w-4" />}
                            label={t("memberships")}
                            onClick={() => setAccountMenuOpen(false)}
                          />
                          {hasMagneticSocialBotAccess ? (
                            <AccountMenuLink
                              href="/dashboard/magnetic-social-bot"
                              locale={locale}
                              icon={<BotMessageSquare className="h-4 w-4" />}
                              label={t("dashboard")}
                              onClick={() => setAccountMenuOpen(false)}
                            />
                          ) : null}
                          <button
                            type="button"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="flex h-12 w-full items-center justify-between rounded-[20px] border border-transparent bg-white/80 px-4 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-white dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-400/20 dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                                {isSigningOut ? <Sparkles className="h-4 w-4 animate-pulse" /> : <LogOut className="h-4 w-4" />}
                              </span>
                              <span>{t("signOut")}</span>
                            </span>
                            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">H</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link href={signInHref} locale={locale} className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-violet-700">
                  <UserRound className="h-4 w-4" />
                  {t("signIn")}
                </Link>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <CartTrigger className="lg:hidden" />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/70 bg-white/90 dark:border-white/10 dark:bg-slate-950/95 lg:hidden"
          >
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-2">
                <MobileNavLink locale={locale} href="/" onClick={() => setMobileMenuOpen(false)}>
                  {t("home")}
                </MobileNavLink>
                <MobileNavLink locale={locale} href="/services" onClick={() => setMobileMenuOpen(false)}>
                  {t("services")}
                </MobileNavLink>
                <MobileNavLink locale={locale} href="/support" onClick={() => setMobileMenuOpen(false)}>
                  {t("support")}
                </MobileNavLink>
              </div>

              <div className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-white via-violet-50/60 to-cyan-50/70 p-4 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.9))]">
                <div className="mb-3 text-xs uppercase tracking-[0.26em] text-violet-600 dark:text-cyan-300">
                  {t("servicesMenuEyebrow")}
                </div>
                <div className="grid gap-2">
                  {visibleServiceMenuItems.map((item) => {
                    const Icon = iconMap[item.key];
                    return (
                      <Link
                        key={item.key}
                        href={`/services/${item.key}`}
                        locale={locale}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-slate-700 transition hover:bg-white/80 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <Icon className="h-4 w-4 text-violet-600 dark:text-cyan-300" />
                        {t(`items.${item.key}.title`)}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <ThemeToggle className="w-full sm:w-auto" />

              <LanguageSwitcher activeLanguages={activeLanguages} align="left" className="w-full" />

              <Link
                href="/domains/cart"
                locale={locale}
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <span>Domain cart</span>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950">
                  {domainCartCount}
                </span>
              </Link>

              {sessionUser ? (
                <>
                  <Link
                    href="/dashboard"
                    locale={locale}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <UserRound className="h-4 w-4" />
                    {t("memberships")}
                  </Link>
                  {hasMagneticSocialBotAccess ? (
                    <Link
                      href="/dashboard/magnetic-social-bot"
                      locale={locale}
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <BotMessageSquare className="h-4 w-4" />
                      {t("dashboard")}
                    </Link>
                  ) : null}
                  {sessionUser.role === "ADMIN" ? (
                    <NextLink
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-5 text-sm font-medium text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {t("adminOps")}
                    </NextLink>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("signOut")}
                  </button>
                </>
              ) : (
                <Link href={signInHref} locale={locale} onClick={() => setMobileMenuOpen(false)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white">
                  <UserRound className="h-4 w-4" />
                  {t("signIn")}
                </Link>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  locale,
  href,
  children
}: {
  locale: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        locale={locale}
        className="inline-flex h-11 items-center rounded-full px-4 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
      >
        {children}
      </Link>
    </motion.div>
  );
}

function MobileNavLink({
  locale,
  href,
  children,
  onClick
}: {
  locale: string;
  href: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      locale={locale}
      onClick={onClick}
      className="inline-flex h-12 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
    >
      {children}
    </Link>
  );
}

function AccountMenuLink({
  locale,
  href,
  icon,
  label,
  onClick
}: {
  locale: string;
  href: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      locale={locale}
      onClick={onClick}
      className="flex h-12 items-center justify-between rounded-[20px] border border-transparent bg-white/80 px-4 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-white dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-400/20 dark:hover:bg-white/10"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-white/10 dark:text-cyan-300">
          {icon}
        </span>
        <span>{label}</span>
      </span>
      <ChevronDown className="h-4 w-4 -rotate-90 text-slate-300 dark:text-slate-600" />
    </Link>
  );
 }
